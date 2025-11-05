<?php
require_once __DIR__ . '/../_bootstrap.php';
require_teacher();
ensure_cms_schema();

$pdo = get_pdo();

// GET: Obtener lista de nombres de cursos para el dropdown
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query('
        SELECT DISTINCT title as name
        FROM courses 
        WHERE is_published = TRUE
        ORDER BY title ASC
    ');
    $courses = $stmt->fetchAll();
    
    json_ok(['courses' => $courses]);
}

json_error('Método no permitido', 405);
