<?php
require_once __DIR__ . '/../_bootstrap.php';
require_admin();
ensure_cms_schema();

$pdo = get_pdo();

// GET: Listar todos los testimonios
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query('SELECT * FROM testimonials ORDER BY display_order ASC, created_at DESC');
    $items = $stmt->fetchAll();
    json_ok(['items' => $items]);
}

// POST: Crear nuevo testimonio
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $author_name = trim($input['author_name'] ?? '');
    $author_role = trim($input['author_role'] ?? '');
    $content = trim($input['content'] ?? '');
    $rating = (int)($input['rating'] ?? 5);
    $image_url = trim($input['image_url'] ?? '');
    $is_published = isset($input['is_published']) ? (bool)$input['is_published'] : true;
    $display_order = (int)($input['display_order'] ?? 0);
    
    if (!$author_name || !$content) {
        json_error('Nombre del autor y contenido son requeridos');
    }
    
    $stmt = $pdo->prepare('
        INSERT INTO testimonials (author_name, author_role, content, rating, image_url, is_published, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ');
    $stmt->execute([$author_name, $author_role, $content, $rating, $image_url, $is_published, $display_order]);
    
    json_ok(['id' => (int)$pdo->lastInsertId()]);
}

// PUT: Actualizar testimonio existente
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $id = (int)($input['id'] ?? 0);
    if (!$id) {
        json_error('ID requerido');
    }
    
    $author_name = trim($input['author_name'] ?? '');
    $author_role = trim($input['author_role'] ?? '');
    $content = trim($input['content'] ?? '');
    $rating = (int)($input['rating'] ?? 5);
    $image_url = trim($input['image_url'] ?? '');
    $is_published = isset($input['is_published']) ? (bool)$input['is_published'] : true;
    $display_order = (int)($input['display_order'] ?? 0);
    
    if (!$author_name || !$content) {
        json_error('Nombre del autor y contenido son requeridos');
    }
    
    $stmt = $pdo->prepare('
        UPDATE testimonials 
        SET author_name = ?, author_role = ?, content = ?, rating = ?, image_url = ?, is_published = ?, display_order = ?
        WHERE id = ?
    ');
    $stmt->execute([$author_name, $author_role, $content, $rating, $image_url, $is_published, $display_order, $id]);
    
    json_ok();
}

// DELETE: Eliminar testimonio
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = (int)($input['id'] ?? 0);
    
    if (!$id) {
        json_error('ID requerido');
    }
    
    $stmt = $pdo->prepare('DELETE FROM testimonials WHERE id = ?');
    $stmt->execute([$id]);
    
    json_ok();
}

json_error('Método no permitido', 405);
