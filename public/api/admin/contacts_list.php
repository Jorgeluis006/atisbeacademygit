<?php
require_once __DIR__ . '/../_bootstrap.php';
require_admin();
ensure_schema();
header('Content-Type: application/json; charset=utf-8');
$stmt = get_pdo()->query('SELECT id,nombre,edad,nacionalidad,email,telefono,idioma,modalidad,franja,created_at FROM contacts ORDER BY created_at DESC');
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode(['contacts' => $rows]);
