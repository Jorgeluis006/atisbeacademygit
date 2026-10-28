<?php
/**
 * Script de uso interno / cron para enviar recordatorios de clases 1 hora antes.
 * Ejecutar vía CLI: php reminders_cron.php
 * O vía HTTP protegida (restringir acceso si se expone públicamente).
 */

require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/../mailer.php';
ensure_schedule_schema();

// Evitar salida JSON automática si se llama por navegador; imprimimos texto plano.
header('Content-Type: text/plain; charset=utf-8');

$pdo = get_pdo();

/**
 * Buscar reservas dentro de los próximos 70 minutos (margen para tolerancia)
 * que aún no tengan recordatorio enviado.
 */
$sql = "
    SELECT sr.id, sr.datetime, sr.reminder_sent_at,
           u.email AS student_email, u.name AS student_name,
           ts.meeting_link, ts.curso, ts.nivel, ts.modalidad, ts.tipo
    FROM schedule_reservations sr
    LEFT JOIN users u ON u.id = sr.user_id
    LEFT JOIN teacher_slots ts ON ts.id = sr.slot_id
    WHERE sr.datetime BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 70 MINUTE)
      AND (sr.reminder_sent_at IS NULL)
      AND u.email IS NOT NULL AND u.email <> ''
    ORDER BY sr.datetime ASC
";

$stmt = $pdo->query($sql);
$rows = $stmt->fetchAll();

$sent = 0;
$errors = 0;

foreach ($rows as $row) {
    try {
        $classDt = new DateTime($row['datetime']);
        $now = new DateTime();
        $diffMinutes = ($classDt->getTimestamp() - $now->getTimestamp()) / 60;

        // Solo enviar si falta entre 40 y 70 minutos (ventana razonable)
        if ($diffMinutes < 40 || $diffMinutes > 70) {
            continue; // Saltar si está fuera de ventana; evitar spam si se ejecuta muy seguido
        }

        $studentEmail = $row['student_email'];
        if (!$studentEmail) { continue; }

        $studentName = $row['student_name'] ?: 'Estudiante';
        $curso = $row['curso'] ?: 'Inglés';
        $nivel = $row['nivel'] ? (' - Nivel ' . $row['nivel']) : '';
        $modalidad = $row['modalidad'] ?: 'virtual';
        $tipo = $row['tipo'] ?: 'clase';
        $meetingLink = $row['meeting_link'] ?: '';
        $fechaFormateada = $classDt->format('d/m/Y \a \l\a\s H:i');

        $subject = 'Recordatorio: Tu clase inicia en 1 hora';
        $body = '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; color: #382a1d; line-height: 1.5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #791eba, #b789a3); color: #fefaf6; padding: 25px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fefaf6; padding: 25px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #791eba; color: #fefaf6 !important; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
        .info-box { background: #fefaf6; border-left: 4px solid #791eba; padding: 15px; margin: 20px 0; border-radius: 6px; }
        .footer { text-align: center; font-size: 12px; color: #54473c; margin-top: 25px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>⏰ Recordatorio de Clase</h2>
        </div>
        <div class="content">
            <p>Hola <strong>' . htmlspecialchars($studentName) . '</strong>,</p>
            <p>Tu <strong>' . htmlspecialchars($tipo) . '</strong> comienza en aproximadamente <strong>1 hora</strong>.</p>
            
            <div class="info-box">
                <p><strong>📚 Curso:</strong> ' . htmlspecialchars($curso . $nivel) . '</p>
                <p><strong>📆 Fecha y hora:</strong> ' . htmlspecialchars($fechaFormateada) . '</p>
                <p><strong>💻 Modalidad:</strong> ' . htmlspecialchars(ucfirst($modalidad)) . '</p>
            </div>
            
            ' . ($meetingLink ? '<p style="text-align: center;"><a href="' . htmlspecialchars($meetingLink) . '" class="button">🔗 Unirse a la clase</a></p>' : '<p style="background: #f6eee3; padding: 12px; border-radius: 6px; color: #856404; margin: 20px 0;">El enlace de la videollamada será agregado por el profesor.</p>') . '
            
            <p>Prepárate con tu material y verifica cámara/micrófono.</p>
            <p style="font-size: 12px; color: #54473c; margin-top: 20px;">Si la clase ya inició o este mensaje no aplica, puedes ignorarlo.</p>
            
            <div class="footer">
                Este es un correo automático. &copy; ' . date('Y') . ' Atisbe Academy.
            </div>
        </div>
    </div>
</body>
</html>';

        if (send_mail($studentEmail, $subject, $body)) {
            $upd = $pdo->prepare('UPDATE schedule_reservations SET reminder_sent_at = NOW() WHERE id = ?');
            $upd->execute([$row['id']]);
            $sent++;
            echo "✓ Recordatorio enviado a {$studentEmail} para clase a las {$fechaFormateada}\n";
        } else {
            $errors++;
            echo "✗ Fallo al enviar a {$studentEmail}\n";
        }
    } catch (Throwable $e) {
        $errors++;
        error_log('Error recordatorio reserva ID '.$row['id'].': '.$e->getMessage());
        echo "✗ Error: " . $e->getMessage() . "\n";
    }
}

echo "\n=== Resumen ===\n";
echo "Recordatorios enviados: $sent\n";
echo "Errores: $errors\n";
echo "Total candidatos revisados: " . count($rows) . "\n";

/**
 * CONFIGURACIÓN DE CRON
 * 
 * === Linux ===
 * Editar crontab: crontab -e
 * Agregar línea para ejecutar cada 10 minutos:
 * */10 * * * * /usr/bin/php /ruta/absoluta/public/api/schedule/reminders_cron.php >> /var/log/atisbe_reminders.log 2>&1
 * 
 * === Windows (Task Scheduler) ===
 * 1. Abrir "Tareas programadas" (Task Scheduler)
 * 2. Crear tarea básica
 * 3. Nombre: "Atisbe Class Reminders"
 * 4. Trigger: Repetido cada 10 minutos
 * 5. Acción:
 *    - Programa: C:\Program Files\php\php.exe (o la ruta de tu PHP)
 *    - Argumentos: C:\ruta\proyecto\public\api\schedule\reminders_cron.php
 *    - Iniciar en: C:\ruta\proyecto\
 * 6. Guardar
 * 
 * === Prueba manual ===
 * Ejecuta en terminal:
 * php public/api/schedule/reminders_cron.php
 */
?>
