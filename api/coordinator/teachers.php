<?php
require_once __DIR__ . '/../_bootstrap.php';
require_admin_or_coordinator();
ensure_users_schema();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Método no permitido', 405);
}

$pdo = get_pdo();
$stmt = $pdo->query('SELECT id, username, name, email FROM users WHERE role = "teacher" ORDER BY name ASC, username ASC');
$items = $stmt->fetchAll();

json_ok(['items' => $items]);
