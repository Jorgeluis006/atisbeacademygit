<?php
require_once __DIR__ . '/../_bootstrap.php';
require_auth();
ensure_schedule_schema();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) { $data = $_POST; }

$datetime = isset($data['datetime']) ? trim((string)$data['datetime']) : '';
$tipo = isset($data['tipo']) ? trim((string)$data['tipo']) : 'clase';
$modalidad = isset($data['modalidad']) ? trim((string)$data['modalidad']) : 'virtual';
$notas = isset($data['notas']) ? trim((string)$data['notas']) : null;

if ($datetime === '') { json_error('datetime requerido (ISO 8601)', 422); }
try {
    $dt = new DateTime($datetime);
} catch (Throwable $e) {
    json_error('datetime inválido', 422);
}

$pdo = get_pdo();

// Evitar duplicado del mismo usuario en el mismo horario
$check = $pdo->prepare('SELECT id FROM schedule_reservations WHERE user_id=? AND datetime=? LIMIT 1');
$check->execute([ (int)$_SESSION['user_id'], $dt->format('Y-m-d H:i:s') ]);
if ($check->fetch()) {
    json_error('Ya tienes una reserva en ese horario', 409);
}

$stmt = $pdo->prepare('INSERT INTO schedule_reservations (user_id, datetime, tipo, modalidad, notas) VALUES (?,?,?,?,?)');
$stmt->execute([
    (int)$_SESSION['user_id'],
    $dt->format('Y-m-d H:i:s'),
    $tipo,
    $modalidad,
    $notas,
]);

json_ok(['id' => (int)$pdo->lastInsertId()]);
