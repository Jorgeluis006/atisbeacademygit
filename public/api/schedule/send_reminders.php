<?php
require_once __DIR__ . '/../_bootstrap.php';
ensure_schedule_schema();

// Permitir ejecución:
// 1) Con token (REMINDER_CRON_TOKEN)
// 2) Sin token si ALLOW_PUBLIC_REMINDERS === true
// 3) O por administrador autenticado
$tokenParam = isset($_GET['token']) ? (string)$_GET['token'] : '';
$hasToken = defined('REMINDER_CRON_TOKEN') && REMINDER_CRON_TOKEN !== '' && $tokenParam === REMINDER_CRON_TOKEN;
$allowPublic = (defined('ALLOW_PUBLIC_REMINDERS') && ALLOW_PUBLIC_REMINDERS === true);
if (!$hasToken && !$allowPublic) {
  // Si no hay token ni modo público, requerir admin
  try { require_admin(); } catch (Throwable $e) { json_error('No autorizado', 403); }
}

$pdo = get_pdo();

require_once __DIR__ . '/../mailer.php';

function sendWindowReminders(PDO $pdo, int $minutes, string $column): array {
    $upper = $minutes;
    $lower = max(0, $minutes - 1);
    $sql = "
        SELECT 
            sr.id,
            sr.datetime,
            sr.tipo,
            sr.modalidad,
            sr.notas,
            u.email AS student_email,
            u.name AS student_name,
            t.name AS teacher_name,
          t.email AS teacher_email,
            ts.meeting_link,
            ts.curso,
            ts.nivel
        FROM schedule_reservations sr
        INNER JOIN users u ON u.id = sr.user_id
        LEFT JOIN users t ON t.id = sr.teacher_id
        LEFT JOIN teacher_slots ts ON ts.id = sr.slot_id
        WHERE sr.$column IS NULL
          AND sr.datetime > NOW()
          AND sr.datetime <= DATE_ADD(NOW(), INTERVAL $upper MINUTE)
          AND sr.datetime > DATE_ADD(NOW(), INTERVAL $lower MINUTE)
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $rows = $stmt->fetchAll();

    $sent = 0; $failed = 0; $items = [];
    foreach ($rows as $r) {
        $email = (string)($r['student_email'] ?? '');
        if ($email === '') { $failed++; $items[] = ['id' => (int)$r['id'], 'status' => 'no-email', 'minutes' => $minutes]; continue; }

        $studentName = $r['student_name'] ?: 'Estudiante';
        $teacherName = $r['teacher_name'] ?: 'tu profesor';
        $curso = $r['curso'] ?: 'Curso';
        $nivel = $r['nivel'] ? (' - Nivel ' . $r['nivel']) : '';
        $meetingLink = $r['meeting_link'] ?? '';

        $dt = new DateTime($r['datetime']);
        $fechaFormateada = $dt->format('d/m/Y \a \l\a\s H:i');
        $minLabel = ($minutes === 1) ? '1 minuto' : ($minutes . ' minutos');
        $subject = 'Recordatorio: tu clase empieza en ' . $minLabel;
        $body = '
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #791eba 0%, #bfa6a4 100%); color: white; padding: 24px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 24px; border-radius: 0 0 10px 10px; }
            .info-box { background: #fff; border-left: 4px solid #791eba; padding: 12px; margin: 16px 0; border-radius: 6px; }
            .button { display: inline-block; background: #791eba; color: white !important; padding: 12px 22px; text-decoration: none; border-radius: 8px; margin: 16px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header"><h2>⏰ Tu clase está por empezar</h2></div>
            <div class="content">
              <p>Hola <strong>' . htmlspecialchars($studentName) . '</strong>,</p>
              <p>Este es un recordatorio: tu clase inicia en <strong>' . htmlspecialchars($minLabel) . '</strong>.</p>
              <div class="info-box">
                <p><strong>📚 Curso:</strong> ' . htmlspecialchars($curso . $nivel) . '</p>
                <p><strong>👨‍🏫 Profesor:</strong> ' . htmlspecialchars($teacherName) . '</p>
                <p><strong>📆 Fecha y hora:</strong> ' . htmlspecialchars($fechaFormateada) . '</p>
                <p><strong>💻 Modalidad:</strong> ' . htmlspecialchars(ucfirst((string)$r['modalidad'])) . '</p>
              </div>
              ' . ($meetingLink ? '<p style="text-align:center;"><a href="' . htmlspecialchars($meetingLink) . '" class="button">🔗 Unirse a la clase</a></p>' : '') . '
              <p style="font-size:12px;color:#666;">Por favor verifica tu conexión y únete puntualmente.</p>
            </div>
            <div class="footer">&copy; ' . date('Y') . ' Atisbe Academy</div>
          </div>
        </body>
        </html>';

        $ok = false;
        try { $ok = send_mail($email, $subject, $body); } catch (Throwable $e) { $ok = false; }
        // Optional: notify teacher as well
        $teacherEmail = (string)($r['teacher_email'] ?? '');
        if ($teacherEmail !== '') {
            $tSubject = 'Recordatorio: clase con ' . $studentName . ' empieza en ' . $minLabel;
            $tBody = '
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #791eba 0%, #bfa6a4 100%); color: white; padding: 20px; text-align: center; border-radius: 10px; }
                .content { background: #f9f9f9; padding: 20px; border-radius: 8px; }
                .info-box { background: #fff; border-left: 4px solid #791eba; padding: 12px; margin: 16px 0; border-radius: 6px; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header"><h3>⏰ Recordatorio de clase</h3></div>
                <div class="content">
                  <p>Tu clase con <strong>' . htmlspecialchars($studentName) . '</strong> inicia en <strong>' . htmlspecialchars($minLabel) . '</strong>.</p>
                  <div class="info-box">
                    <p><strong>📚 Curso:</strong> ' . htmlspecialchars($curso . $nivel) . '</p>
                    <p><strong>📆 Fecha y hora:</strong> ' . htmlspecialchars($fechaFormateada) . '</p>
                    <p><strong>💻 Modalidad:</strong> ' . htmlspecialchars(ucfirst((string)$r['modalidad'])) . '</p>
                  </div>
                  ' + ($meetingLink ? '<p><strong>Enlace:</strong> ' . htmlspecialchars($meetingLink) . '</p>' : '') + '
                </div>
                <div class="footer">&copy; ' . date('Y') . ' Atisbe Academy</div>
              </div>
            </body>
            </html>';
            try { send_mail($teacherEmail, $tSubject, $tBody); } catch (Throwable $e) {}
        }

        if ($ok) {
            $sent++;
            $items[] = ['id' => (int)$r['id'], 'status' => 'sent', 'minutes' => $minutes];
            $upd = $pdo->prepare("UPDATE schedule_reservations SET $column = NOW() WHERE id = ?");
            $upd->execute([(int)$r['id']]);
        } else {
            $failed++;
            $items[] = ['id' => (int)$r['id'], 'status' => 'failed', 'minutes' => $minutes];
        }
    }

    return ['sent' => $sent, 'failed' => $failed, 'items' => $items];
}

$totalSent = 0; $totalFailed = 0; $allItems = [];
foreach ([[30,'reminder_30_sent_at'], [5,'reminder_5_sent_at'], [1,'reminder_1_sent_at']] as [$m, $col]) {
    $res = sendWindowReminders($pdo, $m, $col);
    $totalSent += $res['sent'];
    $totalFailed += $res['failed'];
    $allItems = array_merge($allItems, $res['items']);
}

json_ok(['sent' => $totalSent, 'failed' => $totalFailed, 'items' => $allItems]);
