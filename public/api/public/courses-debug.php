<?php
// Este archivo es solo para debugging
// Muestra todos los cursos sin filtrar
require_once __DIR__ . '/../_bootstrap.php';
ensure_cms_schema();

$pdo = get_pdo();

// Obtener TODOS los cursos (publicados y no publicados)
$stmt = $pdo->query('
    SELECT id, title, description, price, duration, level, modality, is_published, display_order, created_at
    FROM courses 
    ORDER BY display_order ASC, created_at DESC
');
$items = $stmt->fetchAll();

// Contar cursos
$total = count($items);
$published = count(array_filter($items, fn($item) => $item['is_published']));
$unpublished = $total - $published;

json_ok([
    'total_courses' => $total,
    'published' => $published,
    'unpublished' => $unpublished,
    'items' => $items
]);
