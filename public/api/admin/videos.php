<?php
require_once __DIR__ . '/../_bootstrap.php';
require_admin();
ensure_cms_schema();

$pdo = get_pdo();

// GET: Listar todos los videos
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query('SELECT * FROM testimonial_videos ORDER BY display_order ASC, created_at DESC');
    $items = $stmt->fetchAll();
    json_ok(['items' => $items]);
}

// POST: Crear nuevo video
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $title = trim($input['title'] ?? '');
    $video_url = trim($input['video_url'] ?? '');
    $thumbnail_url = trim($input['thumbnail_url'] ?? '');
    $is_published = isset($input['is_published']) ? (bool)$input['is_published'] : true;
    $display_order = (int)($input['display_order'] ?? 0);
    
    if (!$video_url) {
        json_error('URL del video es requerida');
    }
    
    $stmt = $pdo->prepare('
        INSERT INTO testimonial_videos (title, video_url, thumbnail_url, is_published, display_order)
        VALUES (?, ?, ?, ?, ?)
    ');
    $stmt->execute([$title, $video_url, $thumbnail_url, $is_published, $display_order]);
    
    json_ok(['id' => (int)$pdo->lastInsertId()]);
}

// PUT: Actualizar video existente
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $id = (int)($input['id'] ?? 0);
    if (!$id) {
        json_error('ID requerido');
    }
    
    $title = trim($input['title'] ?? '');
    $video_url = trim($input['video_url'] ?? '');
    $thumbnail_url = trim($input['thumbnail_url'] ?? '');
    $is_published = isset($input['is_published']) ? (bool)$input['is_published'] : true;
    $display_order = (int)($input['display_order'] ?? 0);
    
    if (!$video_url) {
        json_error('URL del video es requerida');
    }
    
    $stmt = $pdo->prepare('
        UPDATE testimonial_videos 
        SET title = ?, video_url = ?, thumbnail_url = ?, is_published = ?, display_order = ?
        WHERE id = ?
    ');
    $stmt->execute([$title, $video_url, $thumbnail_url, $is_published, $display_order, $id]);
    
    json_ok();
}

// DELETE: Eliminar video
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = (int)($input['id'] ?? 0);
    
    if (!$id) {
        json_error('ID requerido');
    }
    
    $stmt = $pdo->prepare('DELETE FROM testimonial_videos WHERE id = ?');
    $stmt->execute([$id]);
    
    json_ok();
}

json_error('Método no permitido', 405);
