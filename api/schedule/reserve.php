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
$slot_id = isset($data['slot_id']) ? (int)$data['slot_id'] : null;

if ($datetime === '') { json_error('datetime requerido (ISO 8601)', 422); }
try {
    $dt = new DateTime($datetime);
} catch (Throwable $e) {
    json_error('datetime inválido', 422);
}

$pdo = get_pdo();
$user_id = (int)$_SESSION['user_id'];

// Obtener teacher_id del estudiante
$stmt = $pdo->prepare('SELECT teacher_id FROM users WHERE id = ?');
$stmt->execute([$user_id]);
$user = $stmt->fetch();
$teacher_id = $user ? (int)$user['teacher_id'] : null;

// Si se proporciona slot_id, verificar que pertenezca al profesor del estudiante y esté disponible
if ($slot_id) {
    $stmt = $pdo->prepare('SELECT teacher_id, is_available FROM teacher_slots WHERE id = ?');
    $stmt->execute([$slot_id]);
    $slot = $stmt->fetch();
    
    if (!$slot) {
        json_error('Slot no encontrado', 404);
    }
    
    if (!$slot['is_available']) {
        json_error('Este horario ya no está disponible', 409);
    }
    
    if ($teacher_id && (int)$slot['teacher_id'] !== $teacher_id) {
        json_error('Este horario no pertenece a tu profesor asignado', 403);
    }
}

// Evitar duplicado del mismo usuario en el mismo horario
$check = $pdo->prepare('SELECT id FROM schedule_reservations WHERE user_id=? AND datetime=? LIMIT 1');
$check->execute([$user_id, $dt->format('Y-m-d H:i:s')]);
if ($check->fetch()) {
    json_error('Ya tienes una reserva en ese horario', 409);
}

$stmt = $pdo->prepare('INSERT INTO schedule_reservations (user_id, teacher_id, slot_id, datetime, tipo, modalidad, notas) VALUES (?,?,?,?,?,?,?)');
$stmt->execute([
    $user_id,
    $teacher_id,
    $slot_id,
    $dt->format('Y-m-d H:i:s'),
    $tipo,
    $modalidad,
    $notas,
]);

// Marcar el slot como no disponible si se reservó
if ($slot_id) {
    $stmt = $pdo->prepare('UPDATE teacher_slots SET is_available = FALSE WHERE id = ?');
    $stmt->execute([$slot_id]);
}

json_ok(['id' => (int)$pdo->lastInsertId()]);

