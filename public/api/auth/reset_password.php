<?php
require_once __DIR__ . '/../_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) { $data = $_POST; }

$token = isset($data['token']) ? trim((string)$data['token']) : '';
$newPassword = isset($data['new_password']) ? trim((string)$data['new_password']) : '';

if ($token === '') {
    json_error('El token es requerido', 422);
}

if ($newPassword === '') {
    json_error('La nueva contraseña es requerida', 422);
}

if (strlen($newPassword) < 6) {
    json_error('La contraseña debe tener al menos 6 caracteres', 422);
}

try {
    $pdo = get_pdo();
    
    // Asegurar que existe la tabla de tokens
    $pdo->exec("CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        token VARCHAR(64) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        used TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )");
    
    // Buscar token válido y no usado
    $stmt = $pdo->prepare('
        SELECT t.id, t.user_id, t.expires_at, u.username, u.email
        FROM password_reset_tokens t
        JOIN users u ON u.id = t.user_id
        WHERE t.token = ? AND t.used = 0
    ');
    $stmt->execute([$token]);
    $tokenData = $stmt->fetch();
    
    if (!$tokenData) {
        json_error('Token inválido o ya utilizado', 400);
    }
    
    // Verificar si el token expiró
    $now = new DateTime();
    $expires = new DateTime($tokenData['expires_at']);
    
    if ($now > $expires) {
        json_error('El token ha expirado. Solicita un nuevo enlace de recuperación', 400);
    }
    
    // Actualizar contraseña
    $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare('UPDATE users SET password = ? WHERE id = ?');
    $stmt->execute([$hashedPassword, $tokenData['user_id']]);
    
    // Marcar token como usado
    $stmt = $pdo->prepare('UPDATE password_reset_tokens SET used = 1 WHERE id = ?');
    $stmt->execute([$tokenData['id']]);
    
    json_ok(['message' => 'Tu contraseña ha sido actualizada exitosamente']);
} catch (Throwable $e) {
    error_log('Error en reset-password: ' . $e->getMessage());
    json_error('Error al restablecer la contraseña', 500);
}
