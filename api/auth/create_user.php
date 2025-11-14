<?php
require_once __DIR__ . '/../_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

require_admin();

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) { $data = $_POST; }

$username = isset($data['username']) ? trim((string)$data['username']) : '';
$password = isset($data['password']) ? (string)$data['password'] : '';
$name     = isset($data['name']) ? trim((string)$data['name']) : '';
$role     = isset($data['role']) ? trim((string)$data['role']) : 'student';
$email    = isset($data['email']) ? trim((string)$data['email']) : '';

if ($username === '' || $password === '') {
    json_error('username y password son requeridos', 422);
}
if ($email === '') {
    json_error('El correo electrónico es requerido', 422);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_error('El correo electrónico no es válido', 422);
}
if (!preg_match('/^[a-zA-Z0-9_.-]{3,50}$/', $username)) {
    json_error('username inválido', 422);
}
if (!in_array($role, ['student','admin','teacher'], true)) { $role = 'student'; }

ensure_users_schema();
ensure_teacher_fields();

try {
    $pdo = get_pdo();
    $stmt = $pdo->prepare('INSERT INTO users (username, password_hash, name, role, email) VALUES (?,?,?,?,?)');
    $stmt->execute([$username, password_hash($password, PASSWORD_BCRYPT), $name, $role, $email]);
    
    // Enviar correo de bienvenida
    try {
        require_once __DIR__ . '/../mailer.php';
        
        $roleName = $role === 'student' ? 'estudiante' : ($role === 'teacher' ? 'profesor' : 'administrador');
        
        $emailSubject = '¡Bienvenido a Atisbe Academy!';
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
                .credentials { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #791eba; border-radius: 5px; }
                .button { display: inline-block; background: #791eba; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎓 ¡Bienvenido a Atisbe Academy!</h1>
                </div>
                <div class="content">
                    <p>Hola <strong>' . htmlspecialchars($name ?: $username) . '</strong>,</p>
                    
                    <p>Tu cuenta de <strong>' . $roleName . '</strong> ha sido creada exitosamente en Atisbe Academy.</p>
                    
                    <div class="credentials">
                        <h3 style="color: #791eba; margin-top: 0;">📝 Tus credenciales de acceso:</h3>
                        <p><strong>Usuario:</strong> ' . htmlspecialchars($username) . '</p>
                        <p><strong>Contraseña:</strong> ' . htmlspecialchars($password) . '</p>
                        <p><strong>Correo:</strong> ' . htmlspecialchars($email) . '</p>
                    </div>
                    
                    <p>⚠️ <em>Por seguridad, te recomendamos cambiar tu contraseña después del primer inicio de sesión.</em></p>
                    
                    <p style="text-align: center;">
                        <a href="https://atisbeacademy.com" class="button">Acceder a la plataforma</a>
                    </p>
                    
                    <p>Si tienes alguna pregunta, no dudes en contactarnos:</p>
                    <ul>
                        <li>📧 Email: automatic@atisbeacademy.com</li>
                        <li>📱 WhatsApp: +57 322 785 0345</li>
                    </ul>
                    
                    <p>¡Bienvenido a nuestra comunidad de aprendizaje!</p>
                    
                    <p style="margin-top: 30px;">Saludos cordiales,<br><strong>El equipo de Atisbe Academy</strong></p>
                </div>
                <div class="footer">
                    <p>Este es un correo automático, por favor no responder a esta dirección.</p>
                    <p>&copy; ' . date('Y') . ' Atisbe Academy. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        ';
        
        send_mail($email, $emailSubject, $emailBody);
    } catch (Throwable $mailError) {
        // Error al enviar correo, pero el usuario ya fue creado
        error_log('Error al enviar correo de bienvenida: ' . $mailError->getMessage());
    }
    
    json_ok(['created' => ['username' => $username, 'role' => $role, 'email' => $email]]);
    // Si es estudiante, asegurarnos de que no tenga notas automáticas: crear fila de progreso vacía
    if ($role === 'student') {
        try {
            ensure_student_progress_schema();
            $default = [
                'asistencia' => 0,
                'notas' => [],
                'nivel' => [ 'mcer' => '', 'descripcion' => '' ],
                'fortalezas' => [],
                'debilidades' => [],
            ];
            $json = json_encode($default, JSON_UNESCAPED_UNICODE);
            $lastId = (int)$pdo->lastInsertId();
            if ($lastId) {
                // Insertar o actualizar la fila de progreso para el nuevo usuario
                $pdo->prepare('INSERT INTO student_progress (user_id, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data=VALUES(data), updated_at=CURRENT_TIMESTAMP')
                    ->execute([$lastId, $json]);
            }
        } catch (Throwable $e) {
            // No fallar la creación de usuario por errores al crear progreso
            error_log('Warning: no se pudo inicializar student_progress: ' . $e->getMessage());
        }
    }
} catch (Throwable $e) {
    if (str_contains($e->getMessage(), 'Duplicate')) {
        json_error('El usuario o correo ya existe', 409);
    }
    json_error('Error al crear usuario', 500, ['details' => $e->getMessage()]);
}
