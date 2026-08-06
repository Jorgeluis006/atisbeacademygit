<?php
require_once __DIR__ . '/../_bootstrap.php';
require_auth();

$role = (string)($_SESSION['role'] ?? '');
if ($role !== 'teacher' && $role !== 'coordinator' && $role !== 'admin') {
    json_error('No autorizado', 403);
}

$pdo = get_pdo();
$pdo->exec("CREATE TABLE IF NOT EXISTS class_structure_docs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    pdf_url VARCHAR(255) NOT NULL,
    is_published BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX (is_published),
    INDEX (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Método no permitido', 405);
}

$stmt = $pdo->query('SELECT id, title, pdf_url, display_order FROM class_structure_docs WHERE is_published = 1 ORDER BY display_order ASC, id DESC');
json_ok(['items' => $stmt->fetchAll()]);
