<?php
require_once __DIR__ . '/../_bootstrap.php';
require_auth();
ensure_schedule_schema();

$pdo = get_pdo();
$stmt = $pdo->prepare('SELECT id, datetime, tipo, modalidad, notas, created_at FROM schedule_reservations WHERE user_id=? ORDER BY datetime ASC');
$stmt->execute([ (int)$_SESSION['user_id'] ]);
$reservas = $stmt->fetchAll();

// No necesitamos formatear - enviar datetime tal como está en MySQL
json_ok(['reservas' => $reservas]);
