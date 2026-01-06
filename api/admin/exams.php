<?php
require_once __DIR__ . '/../_bootstrap.php';
require_admin();
ensure_cms_schema();

$pdo = get_pdo();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query('SELECT * FROM exams ORDER BY display_order ASC, created_at DESC');
    $items = $stmt->fetchAll();
    json_ok(['items' => $items]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $title = trim($input['title'] ?? '');
    $slug = trim($input['slug'] ?? '');
    $description = trim($input['description'] ?? '');
    $image_url = trim($input['image_url'] ?? '');
    $is_published = isset($input['is_published']) ? (bool)$input['is_published'] : true;
    $display_order = (int)($input['display_order'] ?? 0);

    if ($title === '' || $slug === '') { json_error('Título y slug son requeridos'); }

    $stmt = $pdo->prepare('INSERT INTO exams (title, slug, description, image_url, is_published, display_order) VALUES (?,?,?,?,?,?)');
    $stmt->execute([$title, $slug, $description, $image_url, $is_published, $display_order]);
    json_ok(['id' => (int)$pdo->lastInsertId()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = (int)($input['id'] ?? 0);
    if (!$id) { json_error('ID requerido'); }
    $title = trim($input['title'] ?? '');
    $slug = trim($input['slug'] ?? '');
    $description = trim($input['description'] ?? '');
    $image_url = trim($input['image_url'] ?? '');
    $is_published = isset($input['is_published']) ? (bool)$input['is_published'] : true;
    $display_order = (int)($input['display_order'] ?? 0);
    if ($title === '' || $slug === '') { json_error('Título y slug son requeridos'); }

    $stmt = $pdo->prepare('UPDATE exams SET title=?, slug=?, description=?, image_url=?, is_published=?, display_order=? WHERE id=?');
    $stmt->execute([$title, $slug, $description, $image_url, $is_published, $display_order, $id]);
    json_ok();
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = (int)($input['id'] ?? 0);
    if (!$id) { json_error('ID requerido'); }
    $stmt = $pdo->prepare('DELETE FROM exams WHERE id = ?');
    $stmt->execute([$id]);
    json_ok();
}

json_error('Método no permitido', 405);
