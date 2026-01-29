<?php
require_once __DIR__ . '/../_bootstrap.php';
ensure_cms_schema();

$slug = isset($_GET['slug']) ? trim($_GET['slug']) : '';
if ($slug === '') { json_error('slug requerido'); }

$pdo = get_pdo();
$stmt = $pdo->prepare('SELECT id, title, slug, description, detail_description, image_url FROM exams WHERE slug = ? AND is_published = TRUE LIMIT 1');
$stmt->execute([$slug]);
$item = $stmt->fetch();
if (!$item) { json_error('No encontrado', 404); }
json_ok(['item' => $item]);
