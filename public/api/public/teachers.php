<?php
require_once __DIR__ . '/../_bootstrap.php';
ensure_users_schema();

$pdo = get_pdo();

try {
    $stmt = $pdo->query('SELECT id, username, name, email FROM users WHERE role = "teacher" ORDER BY name IS NULL, name ASC, username ASC');
    $items = $stmt->fetchAll();
    json_ok(['items' => $items]);
} catch (Throwable $e) {
    json_error('Error obteniendo profesores', 500, ['details' => $e->getMessage()]);
}
