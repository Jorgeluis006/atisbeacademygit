<?php
require_once __DIR__ . '/../_bootstrap.php';
require_admin();

ensure_schedule_schema();
ensure_users_schema();

header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename=reservations.csv');

$out = fopen('php://output', 'w');
fputcsv($out, ['id','username','datetime','tipo','modalidad','notas','created_at']);

$sql = 'SELECT r.id, u.username, r.datetime, r.tipo, r.modalidad, r.notas, r.created_at
        FROM schedule_reservations r INNER JOIN users u ON u.id = r.user_id
        ORDER BY r.created_at DESC';
$stmt = get_pdo()->query($sql);
while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
    fputcsv($out, $row);
}
fclose($out);
exit;
