<?php
require_once __DIR__ . '/../_bootstrap.php';
ensure_cms_schema();

$pdo = get_pdo();

// Obtener solo testimonios publicados
$stmt = $pdo->query('
    SELECT id, author_name, author_role, content, rating, image_url
    FROM testimonials 
    WHERE is_published = TRUE
    ORDER BY display_order ASC, created_at DESC
');
$items = $stmt->fetchAll();

json_ok(['items' => $items]);
