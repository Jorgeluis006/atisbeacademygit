<?php
require_once __DIR__ . '/../_bootstrap.php';
require_auth();
ensure_schedule_schema();

$role = $_SESSION['role'] ?? '';
if ($role !== 'teacher') {
    json_error('No autorizado', 403);
}

$teacher_id = (int)$_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Listar todos los slots del profesor
    $pdo = get_pdo();
    $stmt = $pdo->prepare('
        SELECT id, datetime, tipo, modalidad, duration_minutes, is_available, created_at
        FROM teacher_slots
        WHERE teacher_id = ?
        ORDER BY datetime ASC
    ');
    $stmt->execute([$teacher_id]);
    $slots = $stmt->fetchAll();
    json_ok(['slots' => $slots]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Crear un nuevo slot
    $input = json_decode(file_get_contents('php://input'), true);
    $datetime = trim($input['datetime'] ?? '');
    $tipo = trim($input['tipo'] ?? 'clase');
    $modalidad = trim($input['modalidad'] ?? 'virtual');
    $duration = (int)($input['duration_minutes'] ?? 60);

    if (!$datetime) {
        json_error('Fecha y hora requeridas');
    }

    // Validar que no exista ya un slot en ese horario para este profesor
    $pdo = get_pdo();
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM teacher_slots WHERE teacher_id = ? AND datetime = ?');
    $stmt->execute([$teacher_id, $datetime]);
    if ((int)$stmt->fetchColumn() > 0) {
        json_error('Ya existe un horario en esa fecha y hora');
    }

    $stmt = $pdo->prepare('
        INSERT INTO teacher_slots (teacher_id, datetime, tipo, modalidad, duration_minutes)
        VALUES (?, ?, ?, ?, ?)
    ');
    $stmt->execute([$teacher_id, $datetime, $tipo, $modalidad, $duration]);
    
    json_ok(['id' => (int)$pdo->lastInsertId()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Eliminar un slot
    $input = json_decode(file_get_contents('php://input'), true);
    $slot_id = (int)($input['id'] ?? 0);

    if (!$slot_id) {
        json_error('ID de slot requerido');
    }

    // Verificar que el slot pertenezca al profesor
    $pdo = get_pdo();
    $stmt = $pdo->prepare('SELECT teacher_id FROM teacher_slots WHERE id = ?');
    $stmt->execute([$slot_id]);
    $slot = $stmt->fetch();

    if (!$slot) {
        json_error('Slot no encontrado', 404);
    }

    if ((int)$slot['teacher_id'] !== $teacher_id) {
        json_error('No autorizado para eliminar este slot', 403);
    }

    // Verificar si hay reservas asociadas
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM schedule_reservations WHERE slot_id = ?');
    $stmt->execute([$slot_id]);
    if ((int)$stmt->fetchColumn() > 0) {
        json_error('No se puede eliminar un slot con reservas activas');
    }

    $stmt = $pdo->prepare('DELETE FROM teacher_slots WHERE id = ?');
    $stmt->execute([$slot_id]);
    
    json_ok();
}

json_error('Método no permitido', 405);
