<?php
require_once __DIR__ . '/../_bootstrap.php';
ensure_cms_schema();

$pdo = get_pdo();

// Listado público de items corporativo publicados
$stmt = $pdo->query('SELECT id, title, slug, description, image_url, default_modality, display_order FROM corporativo_items WHERE is_published = 1 ORDER BY display_order ASC, created_at DESC');
$items = $stmt->fetchAll();
json_ok(['items' => $items]);
