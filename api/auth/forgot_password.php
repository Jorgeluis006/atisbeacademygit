<?php
require_once __DIR__ . '/../_bootstrap.php';
require_once __DIR__ . '/../mailer.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) { $data = $_POST; }

$email = isset($data['email']) ? trim((string)$data['email']) : '';

if ($email === '') {
    json_error('El correo electrónico es requerido', 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_error('El correo electrónico no es válido', 422);
}

try {
    $pdo = get_pdo();
    
    // Asegurar que la tabla tenga el campo email
    ensure_users_schema();
    
    // Buscar usuario por email
    $stmt = $pdo->prepare('SELECT id, username, name, email FROM users WHERE email = ? AND email IS NOT NULL');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user) {
        // Por seguridad, no revelar si el email existe o no
        json_ok(['message' => 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña']);
        exit;
    }
    
    // Generar token de recuperación (válido por 1 hora)
    $token = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));
    
    // Guardar token en base de datos
    // Primero asegurar que existe la tabla
    $pdo->exec("CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        token VARCHAR(64) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        used TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )");
    
    // Insertar token
    $stmt = $pdo->prepare('INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)');
    $stmt->execute([$user['id'], $token, $expires]);
    
    // Enviar correo con link de recuperación
    $resetLink = 'https://atisbeacademy.com/reset-password?token=' . $token;
    
    $emailSubject = 'Recuperación de Contraseña - Atisbe Academy';
    $emailBody = '
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #382a1d; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #791eba 0%, #b789a3 100%); color: #fefaf6; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #fefaf6; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { background: #f6eee3; border: 2px solid #f2c02a; padding: 15px; margin: 20px 0; border-radius: 8px; }
            .button { display: inline-block; background: #791eba; color: #fefaf6 !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #54473c; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Recuperación de Contraseña</h1>
            </div>
            <div class="content">
                <p>Hola <strong>' . htmlspecialchars($user['name'] ?: $user['username']) . '</strong>,</p>
                
                <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Atisbe Academy</strong>.</p>
                
                <div class="alert-box">
                    <p style="margin: 0;"><strong>⚠️ Importante:</strong> Este enlace es válido solo por <strong>1 hora</strong>.</p>
                </div>
                
                <p>Para crear una nueva contraseña, haz clic en el siguiente botón:</p>
                
                <p style="text-align: center;">
                    <a href="' . $resetLink . '" class="button">🔑 Restablecer mi contraseña</a>
                </p>
                
                <p style="font-size: 12px; color: #54473c;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                <p style="font-size: 12px; word-break: break-all; color: #791eba;">' . $resetLink . '</p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #d7c8b5;">
                
                <p><strong>¿No solicitaste este cambio?</strong></p>
                <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura. Tu contraseña no cambiará.</p>
                
                <p style="margin-top: 30px;">Si tienes alguna pregunta, contáctanos:</p>
                <ul>
                    <li>📧 Email: automatic@atisbeacademy.com</li>
                    <li>📱 WhatsApp: +57 322 785 0345</li>
                </ul>
                
                <p style="margin-top: 30px;">Saludos,<br><strong>El equipo de Atisbe Academy</strong></p>
            </div>
            <div class="footer">
                <p>Este es un correo automático, por favor no responder.</p>
                <p>&copy; ' . date('Y') . ' Atisbe Academy. Todos los derechos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    ';
    
    send_mail($user['email'], $emailSubject, $emailBody);
    
    json_ok(['message' => 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña']);
} catch (Throwable $e) {
    error_log('Error en forgot-password: ' . $e->getMessage());
    json_error('Error al procesar la solicitud', 500);
}
