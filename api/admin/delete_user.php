<?php
require_once __DIR__ . '/../_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

require_admin();

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) { $data = $_POST; }

$userId = isset($data['id']) ? (int)$data['id'] : 0;

if ($userId <= 0) {
    json_error('ID de usuario inválido', 422);
}

try {
    $pdo = get_pdo();
    
    // Verificar que el usuario existe
    $stmt = $pdo->prepare('SELECT id, username, role FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    $user = $stmt->fetch();
    
    if (!$user) {
        json_error('Usuario no encontrado', 404);
    }
    
    // Eliminar el usuario (ahora se permiten admins también)
    $stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
    $stmt->execute([$userId]);
    
    json_ok([
        'message' => 'Usuario eliminado correctamente',
        'deleted_user' => $user['username']
    ]);
} catch (Throwable $e) {
    json_error('Error al eliminar usuario', 500, ['details' => $e->getMessage()]);
}
