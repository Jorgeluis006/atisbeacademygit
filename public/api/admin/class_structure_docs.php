<?php
require_once __DIR__ . '/../_bootstrap.php';
require_admin_or_coordinator();

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

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query('SELECT id, title, pdf_url, is_published, display_order, created_at FROM class_structure_docs ORDER BY display_order ASC, id DESC');
    json_ok(['items' => $stmt->fetchAll()]);
}

$raw = file_get_contents('php://input');
$input = json_decode($raw, true);
if (!is_array($input)) $input = $_POST;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = trim((string)($input['title'] ?? ''));
    $pdfUrl = trim((string)($input['pdf_url'] ?? ''));
    $isPublished = isset($input['is_published']) ? (bool)$input['is_published'] : true;
    $displayOrder = isset($input['display_order']) ? (int)$input['display_order'] : 0;

    if ($title === '' || $pdfUrl === '') {
        json_error('title y pdf_url son requeridos', 422);
    }

    $stmt = $pdo->prepare('INSERT INTO class_structure_docs (title, pdf_url, is_published, display_order) VALUES (?,?,?,?)');
    $stmt->execute([$title, $pdfUrl, $isPublished ? 1 : 0, $displayOrder]);
    json_ok(['id' => (int)$pdo->lastInsertId()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $id = (int)($input['id'] ?? 0);
    if ($id <= 0) json_error('id requerido', 422);

    $title = trim((string)($input['title'] ?? ''));
    $pdfUrl = trim((string)($input['pdf_url'] ?? ''));
    $isPublished = isset($input['is_published']) ? (bool)$input['is_published'] : true;
    $displayOrder = isset($input['display_order']) ? (int)$input['display_order'] : 0;

    if ($title === '' || $pdfUrl === '') {
        json_error('title y pdf_url son requeridos', 422);
    }

    $stmt = $pdo->prepare('UPDATE class_structure_docs SET title=?, pdf_url=?, is_published=?, display_order=? WHERE id=?');
    $stmt->execute([$title, $pdfUrl, $isPublished ? 1 : 0, $displayOrder, $id]);
    json_ok(['updated' => true]);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = (int)($input['id'] ?? 0);
    if ($id <= 0) json_error('id requerido', 422);

    $stmt = $pdo->prepare('DELETE FROM class_structure_docs WHERE id = ?');
    $stmt->execute([$id]);
    json_ok(['deleted' => true]);
}

json_error('Método no permitido', 405);
