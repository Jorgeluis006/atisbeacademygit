<?php
require_once __DIR__ . '/../_bootstrap.php';
require_admin();
ensure_cms_schema();

$pdo = get_pdo();

// GET: Listar todos los posts
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query('
        SELECT 
            bp.*,
            u.username as author_username,
            u.name as author_name
        FROM blog_posts bp
        LEFT JOIN users u ON bp.author_id = u.id
        ORDER BY created_at DESC
    ');
    $items = $stmt->fetchAll();
    json_ok(['items' => $items]);
}

// POST: Crear nuevo post
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $title = trim($input['title'] ?? '');
    $slug = trim($input['slug'] ?? '');
    $excerpt = trim($input['excerpt'] ?? '');
    $content = trim($input['content'] ?? '');
    $author_id = (int)($_SESSION['user_id'] ?? 0);
    $image_url = trim($input['image_url'] ?? '');
    $category = trim($input['category'] ?? '');
    $tags = trim($input['tags'] ?? '');
    $is_published = isset($input['is_published']) ? (bool)$input['is_published'] : false;
    $published_at = $is_published ? date('Y-m-d H:i:s') : null;
    
    if (!$title || !$content) {
        json_error('Título y contenido son requeridos');
    }
    
    // Generar slug si no se proporciona
    if (!$slug) {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title), '-'));
    }
    
    // Verificar que el slug sea único
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM blog_posts WHERE slug = ?');
    $stmt->execute([$slug]);
    if ((int)$stmt->fetchColumn() > 0) {
        $slug .= '-' . time();
    }
    
    $stmt = $pdo->prepare('
        INSERT INTO blog_posts (title, slug, excerpt, content, author_id, image_url, category, tags, is_published, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');
    $stmt->execute([$title, $slug, $excerpt, $content, $author_id, $image_url, $category, $tags, $is_published, $published_at]);
    
    json_ok(['id' => (int)$pdo->lastInsertId(), 'slug' => $slug]);
}

// PUT: Actualizar post existente
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $id = (int)($input['id'] ?? 0);
    if (!$id) {
        json_error('ID requerido');
    }
    
    $title = trim($input['title'] ?? '');
    $slug = trim($input['slug'] ?? '');
    $excerpt = trim($input['excerpt'] ?? '');
    $content = trim($input['content'] ?? '');
    $image_url = trim($input['image_url'] ?? '');
    $category = trim($input['category'] ?? '');
    $tags = trim($input['tags'] ?? '');
    $is_published = isset($input['is_published']) ? (bool)$input['is_published'] : false;
    
    if (!$title || !$content) {
        json_error('Título y contenido son requeridos');
    }
    
    // Verificar unicidad del slug si cambió
    if ($slug) {
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM blog_posts WHERE slug = ? AND id != ?');
        $stmt->execute([$slug, $id]);
        if ((int)$stmt->fetchColumn() > 0) {
            json_error('El slug ya existe');
        }
    }
    
    // Si se publica por primera vez, establecer published_at
    $stmt = $pdo->prepare('SELECT is_published FROM blog_posts WHERE id = ?');
    $stmt->execute([$id]);
    $current = $stmt->fetch();
    $published_at_update = '';
    if ($is_published && $current && !$current['is_published']) {
        $published_at_update = ', published_at = NOW()';
    }
    
    $stmt = $pdo->prepare('
        UPDATE blog_posts 
        SET title = ?, slug = ?, excerpt = ?, content = ?, image_url = ?, category = ?, tags = ?, is_published = ?' . $published_at_update . '
        WHERE id = ?
    ');
    $stmt->execute([$title, $slug, $excerpt, $content, $image_url, $category, $tags, $is_published, $id]);
    
    json_ok();
}

// DELETE: Eliminar post
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = (int)($input['id'] ?? 0);
    
    if (!$id) {
        json_error('ID requerido');
    }
    
    $stmt = $pdo->prepare('DELETE FROM blog_posts WHERE id = ?');
    $stmt->execute([$id]);
    
    json_ok();
}

json_error('Método no permitido', 405);
