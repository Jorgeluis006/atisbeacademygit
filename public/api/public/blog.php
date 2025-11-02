<?php
require_once __DIR__ . '/../_bootstrap.php';
ensure_cms_schema();

$pdo = get_pdo();

// Obtener solo posts publicados
$stmt = $pdo->query('
    SELECT 
        bp.id, 
        bp.title, 
        bp.slug, 
        bp.excerpt, 
        bp.content, 
        bp.image_url, 
        bp.category, 
        bp.tags,
        bp.published_at,
        u.name as author_name,
        u.username as author_username
    FROM blog_posts bp
    LEFT JOIN users u ON bp.author_id = u.id
    WHERE bp.is_published = TRUE
    ORDER BY bp.published_at DESC, bp.created_at DESC
');
$items = $stmt->fetchAll();

json_ok(['items' => $items]);
