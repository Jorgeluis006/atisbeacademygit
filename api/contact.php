<?php
require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/mailer.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    // Fallback para application/x-www-form-urlencoded
    $data = $_POST;
}

$required = ['nombre','edad','nacionalidad','email','telefono','idioma','modalidad','franja'];
foreach ($required as $k) {
    if (!isset($data[$k]) || trim((string)$data[$k]) === '') {
        json_error('Campo requerido faltante: ' . $k, 422);
    }
}

// Validaciones simples
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    json_error('Correo inválido', 422);
}

try {
    ensure_schema();
    $pdo = get_pdo();
    $stmt = $pdo->prepare('INSERT INTO contacts (nombre, edad, nacionalidad, email, telefono, idioma, modalidad, franja) VALUES (?,?,?,?,?,?,?,?)');
    $stmt->execute([
        trim($data['nombre']),
        trim($data['edad']),
        trim($data['nacionalidad']),
        trim($data['email']),
        trim($data['telefono']),
        trim($data['idioma']),
        trim($data['modalidad']),
        trim($data['franja']),
    ]);

    // Opcional: enviar correo de notificación (SMTP con PHPMailer si disponible)
    if (defined('MAIL_TO') && MAIL_TO !== '') {
        $body = '<h3>Nuevo contacto Atisbe</h3>' .
            '<p><strong>Nombre:</strong> ' . htmlspecialchars($data['nombre']) . '</p>' .
            '<p><strong>Email:</strong> ' . htmlspecialchars($data['email']) . '</p>' .
            '<p><strong>Teléfono:</strong> ' . htmlspecialchars($data['telefono']) . '</p>' .
            '<p><strong>Idioma:</strong> ' . htmlspecialchars($data['idioma']) . '</p>' .
            '<p><strong>Modalidad:</strong> ' . htmlspecialchars($data['modalidad']) . '</p>' .
            '<p><strong>Franja:</strong> ' . htmlspecialchars($data['franja']) . '</p>' .
            '<p><strong>Curso (usuario):</strong> ' . (isset($data['curso']) ? htmlspecialchars($data['curso']) : '') . '</p>' .
            '<p><strong>Día de interés (usuario):</strong> ' . (isset($data['dia_interes']) ? htmlspecialchars($data['dia_interes']) : '') . '</p>';
    @send_mail(MAIL_TO, 'Nuevo contacto Atisbe', $body);
    // Enviar copia a automatic@atisbeacademy.com
    @send_mail('automatic@atisbeacademy.com', 'Copia de nuevo contacto Atisbe', $body);
    }

    // Enviar correo de confirmación al usuario
    try {
        $userEmailSubject = '¡Gracias por contactarnos! - Atisbe Academy';
        // Construir enlace de WhatsApp con mensaje prellenado (si el usuario proporcionó curso/día)
        $cursoSolicitado = isset($data['curso']) ? trim((string)$data['curso']) : '';
        $diaInteres = isset($data['dia_interes']) ? trim((string)$data['dia_interes']) : '';
        $waNumber = '573227850345';
        $waMessage = '';
        if ($cursoSolicitado || $diaInteres) {
            $waMessage = 'Hola Atisbe, me gustaría obtener más información';
            if ($cursoSolicitado) { $waMessage .= ' sobre el curso de ' . $cursoSolicitado; }
            if ($diaInteres) { $waMessage .= '. Estoy interesado en clases el/los ' . $diaInteres; }
            $waMessage .= '. Mi nombre es ' . (trim((string)$data['nombre']) ?: '');
        }
        $waLink = $waMessage ? ('https://wa.me/' . $waNumber . '?text=' . rawurlencode($waMessage)) : '';

        $userEmailBody = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #791eba 0%, #bfa6a4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #791eba; border-radius: 5px; }
                .contact-info { background: #fffef1; padding: 20px; margin: 20px 0; border-radius: 8px; border: 2px solid #fcb500; }
                .whatsapp-button { display: inline-block; background: #25D366; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎓 ¡Gracias por contactarnos!</h1>
                </div>
                <div class="content">
                    <p>Hola <strong>' . htmlspecialchars($data['nombre']) . '</strong>,</p>
                    
                    <p>Hemos recibido tu solicitud de información y queremos agradecerte por tu interés en <strong>Atisbe Academy</strong>.</p>
                    
                    <div class="info-box">
                        <h3 style="color: #791eba; margin-top: 0;">📋 Resumen de tu solicitud:</h3>
                        <p><strong>Idioma de interés:</strong> ' . htmlspecialchars($data['idioma']) . '</p>
                        <p><strong>Modalidad:</strong> ' . htmlspecialchars($data['modalidad']) . '</p>
                        <p><strong>Franja horaria:</strong> ' . htmlspecialchars($data['franja']) . '</p>
                    </div>
                    
                    <p>Uno de nuestros asesores se pondrá en contacto contigo pronto para brindarte toda la información que necesites.</p>
                    
                    <div class="contact-info">
                        <h3 style="color: #791eba; margin-top: 0;">📞 Mientras tanto, puedes contactarnos:</h3>
                        <p><strong>📱 WhatsApp:</strong> <a href="https://wa.me/573227850345">+57 322 785 0345</a></p>
                        <p><strong>📧 Email:</strong> automatic@atisbeacademy.com</p>
                        <p><strong>⏰ Horario:</strong> Lunes a Domingo, 24/7</p>
                        
                            <p style="text-align: center; margin-top: 20px;">
                                ' . ($waLink ? '<a href="' . htmlspecialchars($waLink) . '" class="whatsapp-button">💬 Chatea con nosotros por WhatsApp</a>' : '<a href="https://wa.me/573227850345?text=Hola%20Atisbe,%20me%20gustaría%20obtener%20más%20información" class="whatsapp-button">💬 Chatea con nosotros por WhatsApp</a>') . '
                            </p>
                    </div>
                    
                    <h3 style="color: #791eba;">🌟 ¿Por qué elegir Atisbe Academy?</h3>
                    <ul>
                        <li>✅ Profesores certificados y especializados</li>
                        <li>✅ Horarios flexibles adaptados a ti</li>
                        <li>✅ Modalidad virtual y presencial</li>
                        <li>✅ Metodología personalizada y efectiva</li>
                        <li>✅ Precios competitivos y accesibles</li>
                    </ul>
                    
                    <p style="margin-top: 30px;">Estamos emocionados de acompañarte en tu proceso de aprendizaje.</p>
                    
                    <p style="margin-top: 30px;">Saludos cordiales,<br><strong>El equipo de Atisbe Academy</strong></p>
                </div>
                <div class="footer">
                    <p>Este es un correo automático de confirmación.</p>
                    <p>&copy; ' . date('Y') . ' Atisbe Academy. Todos los derechos reservados.</p>
                    <p>Si no solicitaste esta información, puedes ignorar este correo.</p>
                </div>
            </div>
        </body>
        </html>
        ';
        
        send_mail($data['email'], $userEmailSubject, $userEmailBody);
    } catch (Throwable $mailError) {
        // Error al enviar correo de confirmación, pero el contacto ya fue guardado
        error_log('Error al enviar correo de confirmación al usuario: ' . $mailError->getMessage());
    }

    json_ok(['id' => (int)$pdo->lastInsertId()]);
} catch (Throwable $e) {
    json_error('Error del servidor', 500, ['details' => $e->getMessage()]);
}
