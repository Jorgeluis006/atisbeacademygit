<?php
require_once __DIR__ . '/../_bootstrap.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) { $data = $_POST; }

$userId = isset($data['id']) ? (int)$data['id'] : 0;
$username = isset($data['username']) ? trim((string)$data['username']) : '';
$password = isset($data['password']) ? (string)$data['password'] : '';

if ($password === '' || strlen($password) < 6) {
    json_error('La contraseña debe tener al menos 6 caracteres', 422);
}

ensure_users_schema();
$pdo = get_pdo();

try {
    if ($userId > 0) {
        $stmt = $pdo->prepare('UPDATE users SET password_hash=? WHERE id=?');
        $stmt->execute([password_hash($password, PASSWORD_BCRYPT), $userId]);
    } elseif ($username !== '') {
        $stmt = $pdo->prepare('UPDATE users SET password_hash=? WHERE username=?');
        $stmt->execute([password_hash($password, PASSWORD_BCRYPT), $username]);
    } else {
        json_error('Debe indicar id o username', 422);
    }
    json_ok(['updated' => true]);
} catch (Throwable $e) {
    json_error('No se pudo actualizar la contraseña', 500, ['details' => $e->getMessage()]);
}
