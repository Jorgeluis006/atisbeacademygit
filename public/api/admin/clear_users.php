<?php
require_once __DIR__ . '/../_bootstrap.php';

// Solo admin puede ejecutar esto
require_admin();

try {
    $pdo = get_pdo();
    
    // Eliminar todos los usuarios que NO sean admin
    $stmt = $pdo->prepare("DELETE FROM users WHERE role != 'admin'");
    $stmt->execute();
    $deleted = $stmt->rowCount();
    
    json_ok([
        'message' => 'Usuarios eliminados correctamente',
        'deleted_count' => $deleted
    ]);
} catch (Throwable $e) {
    json_error('Error al eliminar usuarios', 500, ['details' => $e->getMessage()]);
}
