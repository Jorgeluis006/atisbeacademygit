<?php
require_once __DIR__ . '/../_bootstrap.php';
require_admin();
ensure_cms_schema();

$pdo = get_pdo();

// GET: Listar todos los cursos
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query('SELECT * FROM courses ORDER BY display_order ASC, created_at DESC');
    $items = $stmt->fetchAll();
    json_ok(['items' => $items]);
}

// POST: Crear nuevo curso
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $title = trim($input['title'] ?? '');
    $description = trim($input['description'] ?? '');
    $price = isset($input['price']) ? (float)$input['price'] : null;
    $duration = trim($input['duration'] ?? '');
    $level = trim($input['level'] ?? '');
    $modality = trim($input['modality'] ?? 'virtual');
    $image_url = trim($input['image_url'] ?? '');
    $syllabus = trim($input['syllabus'] ?? '');
    $is_published = isset($input['is_published']) ? (bool)$input['is_published'] : true;
    $display_order = (int)($input['display_order'] ?? 0);
    
    if (!$title || !$description) {
        json_error('Título y descripción son requeridos');
    }
    
    $stmt = $pdo->prepare('
        INSERT INTO courses (title, description, price, duration, level, modality, image_url, syllabus, is_published, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');
    $stmt->execute([$title, $description, $price, $duration, $level, $modality, $image_url, $syllabus, $is_published, $display_order]);
    
    json_ok(['id' => (int)$pdo->lastInsertId()]);
}

// PUT: Actualizar curso existente
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $id = (int)($input['id'] ?? 0);
    if (!$id) {
        json_error('ID requerido');
    }
    
    $title = trim($input['title'] ?? '');
    $description = trim($input['description'] ?? '');
    $price = isset($input['price']) ? (float)$input['price'] : null;
    $duration = trim($input['duration'] ?? '');
    $level = trim($input['level'] ?? '');
    $modality = trim($input['modality'] ?? 'virtual');
    $image_url = trim($input['image_url'] ?? '');
    $syllabus = trim($input['syllabus'] ?? '');
    $is_published = isset($input['is_published']) ? (bool)$input['is_published'] : true;
    $display_order = (int)($input['display_order'] ?? 0);
    
    if (!$title || !$description) {
        json_error('Título y descripción son requeridos');
    }
    
    $stmt = $pdo->prepare('
        UPDATE courses 
        SET title = ?, description = ?, price = ?, duration = ?, level = ?, modality = ?, image_url = ?, syllabus = ?, is_published = ?, display_order = ?
        WHERE id = ?
    ');
    $stmt->execute([$title, $description, $price, $duration, $level, $modality, $image_url, $syllabus, $is_published, $display_order, $id]);
    
    json_ok();
}

// DELETE: Eliminar curso
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = (int)($input['id'] ?? 0);
    
    if (!$id) {
        json_error('ID requerido');
    }
    
    $stmt = $pdo->prepare('DELETE FROM courses WHERE id = ?');
    $stmt->execute([$id]);
    
    json_ok();
}

json_error('Método no permitido', 405);
