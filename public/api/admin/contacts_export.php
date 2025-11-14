<?php
require_once __DIR__ . '/../_bootstrap.php';
require_admin();

ensure_schema();

// Export CSV with proper .csv filename so Excel opens it without warnings
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename=contacts.csv');

$out = fopen('php://output', 'w');
fputcsv($out, ['id','nombre','edad','nacionalidad','email','telefono','idioma','modalidad','franja','created_at']);

$stmt = get_pdo()->query('SELECT id,nombre,edad,nacionalidad,email,telefono,idioma,modalidad,franja,created_at FROM contacts ORDER BY created_at DESC');
while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
    fputcsv($out, $row);
}
fclose($out);
exit;
