<?php
require_once __DIR__ . '/../_bootstrap.php';
ensure_cms_schema();

$pdo = get_pdo();

$course_id = isset($_GET['course_id']) ? (int)$_GET['course_id'] : 0;
if ($course_id <= 0) {
    json_error('course_id requerido', 400);
}

$stmt = $pdo->prepare('
    SELECT id, course_id, title, description, image_url, is_published, display_order
    FROM course_modalities
    WHERE course_id = ? AND is_published = TRUE
    ORDER BY display_order ASC, created_at DESC
');
$stmt->execute([$course_id]);
$items = $stmt->fetchAll();

json_ok(['items' => $items]);
