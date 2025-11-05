<?php
require_once __DIR__ . '/../_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

require_auth();

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) { $data = $_POST; }

$currentPassword = isset($data['currentPassword']) ? (string)$data['currentPassword'] : '';
$newPassword = isset($data['newPassword']) ? (string)$data['newPassword'] : '';

if ($currentPassword === '' || $newPassword === '') {
    json_error('La contraseña actual y la nueva son requeridas', 422);
}

if (strlen($newPassword) < 6) {
    json_error('La nueva contraseña debe tener al menos 6 caracteres', 422);
}

try {
    $userId = $_SESSION['user_id'];
    $pdo = get_pdo();
    
    // Verificar contraseña actual
    $stmt = $pdo->prepare('SELECT password_hash FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($currentPassword, $user['password_hash'])) {
        json_error('La contraseña actual es incorrecta', 401);
    }
    
    // Actualizar contraseña
    $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
    $stmt->execute([$newHash, $userId]);
    
    json_ok(['message' => 'Contraseña actualizada exitosamente']);
} catch (Throwable $e) {
    json_error('Error al cambiar la contraseña', 500, ['details' => $e->getMessage()]);
}
