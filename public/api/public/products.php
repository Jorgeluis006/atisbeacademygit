<?php
require_once __DIR__ . '/../_bootstrap.php';
ensure_cms_schema();

$pdo = get_pdo();

$stmt = $pdo->query('SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC');
$items = $stmt->fetchAll();

json_ok(['items' => $items]);
