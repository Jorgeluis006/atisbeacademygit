<?php
require_once __DIR__ . '/../_bootstrap.php';
require_admin();
ensure_cms_schema();

$pdo = get_pdo();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $course_id = isset($_GET['course_id']) ? (int)$_GET['course_id'] : 0;
    if ($course_id <= 0) { json_error('course_id requerido', 400); }
    $stmt = $pdo->prepare('SELECT * FROM course_modalities WHERE course_id = ? ORDER BY display_order ASC, created_at DESC');
    $stmt->execute([$course_id]);
    $items = $stmt->fetchAll();
    json_ok(['items' => $items]);
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];

if ($method === 'POST') {
    $course_id = (int)($input['course_id'] ?? 0);
    $title = trim($input['title'] ?? '');
    $description = trim($input['description'] ?? '');
    $image_url = trim($input['image_url'] ?? '');
    $is_published = isset($input['is_published']) ? (bool)$input['is_published'] : true;
    $display_order = (int)($input['display_order'] ?? 0);

    if ($course_id <= 0 || !$title) {
        json_error('course_id y title son requeridos');
    }

    $stmt = $pdo->prepare('INSERT INTO course_modalities (course_id, title, description, image_url, is_published, display_order) VALUES (?,?,?,?,?,?)');
    $stmt->execute([$course_id, $title, $description, $image_url, $is_published, $display_order]);
    json_ok(['id' => (int)$pdo->lastInsertId()]);
}

if ($method === 'PUT') {
    $id = (int)($input['id'] ?? 0);
    if ($id <= 0) { json_error('ID requerido'); }

    $title = trim($input['title'] ?? '');
    $description = trim($input['description'] ?? '');
    $image_url = trim($input['image_url'] ?? '');
    $is_published = isset($input['is_published']) ? (bool)$input['is_published'] : true;
    $display_order = (int)($input['display_order'] ?? 0);

    if (!$title) { json_error('title requerido'); }

    $stmt = $pdo->prepare('UPDATE course_modalities SET title=?, description=?, image_url=?, is_published=?, display_order=? WHERE id=?');
    $stmt->execute([$title, $description, $image_url, $is_published, $display_order, $id]);
    json_ok();
}

if ($method === 'DELETE') {
    $id = (int)($input['id'] ?? 0);
    if ($id <= 0) { json_error('ID requerido'); }
    $stmt = $pdo->prepare('DELETE FROM course_modalities WHERE id=?');
    $stmt->execute([$id]);
    json_ok();
}

json_error('Método no permitido', 405);
