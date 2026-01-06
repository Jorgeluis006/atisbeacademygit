<?php
require_once __DIR__ . '/../_bootstrap.php';
ensure_cms_schema();

$pdo = get_pdo();
$stmt = $pdo->query('SELECT id, title, slug, description, image_url FROM exams WHERE is_published = TRUE ORDER BY display_order ASC, created_at DESC');
$items = $stmt->fetchAll();
json_ok(['items' => $items]);
