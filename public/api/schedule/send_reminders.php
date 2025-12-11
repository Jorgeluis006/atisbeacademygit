<?php
require_once __DIR__ . '/../_bootstrap.php';
ensure_schedule_schema();

// Permitir ejecución vía token (para cron) o por administrador autenticado
$tokenParam = isset($_GET['token']) ? (string)$_GET['token'] : '';
$hasToken = defined('REMINDER_CRON_TOKEN') && REMINDER_CRON_TOKEN !== '' && $tokenParam === REMINDER_CRON_TOKEN;
if (!$hasToken) {
    // Si no hay token válido, requerir admin
    try { require_admin(); } catch (Throwable $e) { json_error('No autorizado', 403); }
}

$pdo = get_pdo();

// Seleccionar reservas que inician en <= 1 minuto y aún no se ha enviado recordatorio
$stmt = $pdo->prepare('
    SELECT 
        sr.id,
        sr.datetime,
        sr.tipo,
        sr.modalidad,
        sr.notas,
        u.email AS student_email,
        u.name AS student_name,
        t.name AS teacher_name,
        ts.meeting_link,
        ts.curso,
        ts.nivel
    FROM schedule_reservations sr
    INNER JOIN users u ON u.id = sr.user_id
    LEFT JOIN users t ON t.id = sr.teacher_id
    LEFT JOIN teacher_slots ts ON ts.id = sr.slot_id
    WHERE sr.reminder_sent_at IS NULL
      AND sr.datetime > NOW()
      AND sr.datetime <= DATE_ADD(NOW(), INTERVAL 1 MINUTE)
');
$stmt->execute();
$rows = $stmt->fetchAll();

require_once __DIR__ . '/../mailer.php';

$sent = 0; $failed = 0; $items = [];
foreach ($rows as $r) {
    $email = (string)($r['student_email'] ?? '');
    if ($email === '') { $failed++; $items[] = ['id' => (int)$r['id'], 'status' => 'no-email']; continue; }

    $studentName = $r['student_name'] ?: 'Estudiante';
    $teacherName = $r['teacher_name'] ?: 'tu profesor';
    $curso = $r['curso'] ?: 'Curso';
    $nivel = $r['nivel'] ? (' - Nivel ' . $r['nivel']) : '';
    $meetingLink = $r['meeting_link'] ?? '';

    // Formatear fecha para el mensaje
    $dt = new DateTime($r['datetime']);
    $fechaFormateada = $dt->format('d/m/Y \a \l\a\s H:i');

    $subject = 'Recordatorio: tu clase empieza en 1 minuto';
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
          <p>Este es un recordatorio: tu clase inicia en <strong>1 minuto</strong>.</p>
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
    if ($ok) {
        $sent++;
        $items[] = ['id' => (int)$r['id'], 'status' => 'sent'];
        $upd = $pdo->prepare('UPDATE schedule_reservations SET reminder_sent_at = NOW() WHERE id = ?');
        $upd->execute([(int)$r['id']]);
    } else {
        $failed++;
        $items[] = ['id' => (int)$r['id'], 'status' => 'failed'];
    }
}

json_ok(['sent' => $sent, 'failed' => $failed, 'items' => $items, 'checked' => count($rows)]);
