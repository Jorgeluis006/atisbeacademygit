<?php
require_once __DIR__ . '/../_bootstrap.php';
ensure_cms_schema();

$pdo = get_pdo();

// Obtener solo videos publicados
$stmt = $pdo->query('
    SELECT id, title, video_url, thumbnail_url
    FROM testimonial_videos 
    WHERE is_published = TRUE
    ORDER BY display_order ASC, created_at DESC
');
$items = $stmt->fetchAll();

json_ok(['items' => $items]);
