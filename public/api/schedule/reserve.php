<?php
require_once __DIR__ . '/../_bootstrap.php';
require_auth();
ensure_schedule_schema();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) { $data = $_POST; }

$datetime = isset($data['datetime']) ? trim((string)$data['datetime']) : '';
$tipo = isset($data['tipo']) ? trim((string)$data['tipo']) : 'clase';
$modalidad = isset($data['modalidad']) ? trim((string)$data['modalidad']) : 'virtual';
$notas = isset($data['notas']) ? trim((string)$data['notas']) : null;
$slot_id = isset($data['slot_id']) ? (int)$data['slot_id'] : null;

if ($datetime === '') { json_error('datetime requerido (ISO 8601)', 422); }
try {
    $dt = new DateTime($datetime);
} catch (Throwable $e) {
    json_error('datetime inválido', 422);
}

$pdo = get_pdo();
$user_id = (int)$_SESSION['user_id'];

// Obtener teacher_id del estudiante
$stmt = $pdo->prepare('SELECT teacher_id FROM users WHERE id = ?');
$stmt->execute([$user_id]);
$user = $stmt->fetch();
$teacher_id = $user ? (int)$user['teacher_id'] : null;

// Si se proporciona slot_id, verificar que pertenezca al profesor del estudiante
if ($slot_id) {
    $stmt = $pdo->prepare('SELECT teacher_id FROM teacher_slots WHERE id = ?');
    $stmt->execute([$slot_id]);
    $slot = $stmt->fetch();
    
    if (!$slot) {
        json_error('Slot no encontrado', 404);
    }
    
    // Permitir múltiples estudiantes en el mismo horario (clases grupales)
    // Ya no verificamos is_available para permitir reservas grupales
    
    if ($teacher_id && (int)$slot['teacher_id'] !== $teacher_id) {
        json_error('Este horario no pertenece a tu profesor asignado', 403);
    }
}

// Evitar duplicado del mismo usuario en el mismo horario
$check = $pdo->prepare('SELECT id FROM schedule_reservations WHERE user_id=? AND datetime=? LIMIT 1');
$check->execute([$user_id, $dt->format('Y-m-d H:i:s')]);
if ($check->fetch()) {
    json_error('Ya tienes una reserva en ese horario', 409);
}

$stmt = $pdo->prepare('INSERT INTO schedule_reservations (user_id, teacher_id, slot_id, datetime, tipo, modalidad, notas) VALUES (?,?,?,?,?,?,?)');
$stmt->execute([
    $user_id,
    $teacher_id,
    $slot_id,
    $dt->format('Y-m-d H:i:s'),
    $tipo,
    $modalidad,
    $notas,
]);

$reservation_id = (int)$pdo->lastInsertId();

// Enviar email con el enlace de la reunión si existe
if ($slot_id) {
    try {
        require_once __DIR__ . '/../mailer.php';
        
        // Obtener información del estudiante, profesor y slot
        $stmt = $pdo->prepare('
            SELECT 
                u.name as student_name, 
                u.email as student_email,
                t.name as teacher_name,
                s.meeting_link,
                s.curso,
                s.nivel,
                s.tipo,
                s.modalidad
            FROM users u
            LEFT JOIN users t ON t.id = ?
            LEFT JOIN teacher_slots s ON s.id = ?
            WHERE u.id = ?
        ');
        $stmt->execute([$teacher_id, $slot_id, $user_id]);
        $info = $stmt->fetch();
        
        // Enviar email si el estudiante tiene email configurado
        if ($info && $info['student_email']) {
            $studentName = $info['student_name'] ?: 'Estudiante';
            $teacherName = $info['teacher_name'] ?: 'tu profesor';
            $meetingLink = $info['meeting_link'];
            $curso = $info['curso'] ?: 'Inglés';
            $nivel = $info['nivel'] ? " - Nivel {$info['nivel']}" : '';
            $tipo = $info['tipo'] ?: 'clase';
            $modalidad = $info['modalidad'] ?: 'virtual';
            
            $fechaFormateada = $dt->format('d/m/Y \a \l\a\s H:i');
            
            $emailSubject = "Confirmación de Reserva - Atisbe Academy";
            $emailBody = '
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #791eba 0%, #bfa6a4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .info-box { background: #fff; border-left: 4px solid #791eba; padding: 15px; margin: 20px 0; border-radius: 4px; }
                    .button { display: inline-block; background: #791eba; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
                    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📅 Clase Confirmada</h1>
                    </div>
                    <div class="content">
                        <p>Hola <strong>' . htmlspecialchars($studentName) . '</strong>,</p>
                        
                        <p>Tu clase ha sido reservada exitosamente en <strong>Atisbe Academy</strong>.</p>
                        
                        <div class="info-box">
                            <p><strong>📚 Curso:</strong> ' . htmlspecialchars($curso . $nivel) . '</p>
                            <p><strong>👨‍🏫 Profesor:</strong> ' . htmlspecialchars($teacherName) . '</p>
                            <p><strong>📆 Fecha y hora:</strong> ' . htmlspecialchars($fechaFormateada) . '</p>
                            <p><strong>💻 Modalidad:</strong> ' . htmlspecialchars(ucfirst($modalidad)) . '</p>
                            <p><strong>📝 Tipo:</strong> ' . htmlspecialchars(ucfirst($tipo)) . '</p>
                        </div>
                        ' . ($meetingLink ? '
                        <p style="text-align: center; margin: 30px 0;">
                            <strong>🎥 Enlace de la videollamada:</strong>
                        </p>
                        
                        <p style="text-align: center;">
                            <a href="' . htmlspecialchars($meetingLink) . '" class="button">🔗 Unirse a la clase</a>
                        </p>
                        
                        <p style="font-size: 12px; color: #666; text-align: center;">O copia y pega este enlace en tu navegador:</p>
                        <p style="font-size: 12px; word-break: break-all; color: #791eba; text-align: center;">' . htmlspecialchars($meetingLink) . '</p>
                        ' : '
                        <p style="text-align: center; margin: 30px 0; padding: 15px; background: #fff3cd; border-radius: 8px; color: #856404;">
                            ℹ️ El profesor agregará el enlace de la videollamada próximamente.
                        </p>
                        ') . '
                        
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                        
                        <p><strong>Recomendaciones:</strong></p>
                        <ul>
                            <li>Únete 5 minutos antes del inicio de la clase</li>
                            <li>Verifica que tu micrófono y cámara funcionen correctamente</li>
                            <li>Ten a mano tu material de estudio</li>
                        </ul>
                        
                        <p style="margin-top: 30px;">Si tienes alguna pregunta, contáctanos:</p>
                        <ul>
                            <li>📧 Email: automatic@atisbeacademy.com</li>
                            <li>📱 WhatsApp: +57 322 785 0345</li>
                        </ul>
                        
                        <p style="margin-top: 30px;">¡Nos vemos en clase!<br><strong>El equipo de Atisbe Academy</strong></p>
                    </div>
                    <div class="footer">
                        <p>Este es un correo automático, por favor no responder.</p>
                        <p>&copy; ' . date('Y') . ' Atisbe Academy. Todos los derechos reservados.</p>
                    </div>
                </div>
            </body>
            </html>
            ';
            
            send_mail($info['student_email'], $emailSubject, $emailBody);
        }
    } catch (Throwable $e) {
        error_log('Error enviando email de confirmación: ' . $e->getMessage());
        // No fallar la reserva si el email falla
    }
}

// NO marcar el slot como no disponible para permitir clases grupales
// Los slots permanecen disponibles para que múltiples estudiantes puedan reservar
// Si quieres limitar el número de estudiantes por clase, implementa una verificación de cupo aquí

json_ok(['id' => $reservation_id]);

