<?php
require_once __DIR__ . '/../_bootstrap.php';
require_auth();
ensure_schedule_schema();

$pdo = get_pdo();
$stmt = $pdo->prepare('SELECT id, datetime, tipo, modalidad, notas, created_at FROM schedule_reservations WHERE user_id=? ORDER BY datetime ASC');
$stmt->execute([ (int)$_SESSION['user_id'] ]);
$reservas = $stmt->fetchAll();

// Formato ISO 8601 para el frontend
foreach ($reservas as &$r) {
    $r['datetime'] = (new DateTime($r['datetime']))->format(DateTime::ATOM);
}

json_ok(['reservas' => $reservas]);
