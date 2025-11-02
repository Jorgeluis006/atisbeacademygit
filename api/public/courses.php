<?php
require_once __DIR__ . '/../_bootstrap.php';
ensure_cms_schema();

$pdo = get_pdo();

// Obtener solo cursos publicados
$stmt = $pdo->query('
    SELECT id, title, description, price, duration, level, modality, image_url, syllabus
    FROM courses 
    WHERE is_published = TRUE
    ORDER BY display_order ASC, created_at DESC
');
$items = $stmt->fetchAll();

json_ok(['items' => $items]);
