<?php
require_once __DIR__ . '/../_bootstrap.php';
require_admin_or_coordinator();
ensure_schedule_schema();

$pdo = get_pdo();

function get_teacher_id_from_input($source) {
    $teacherId = isset($source['teacher_id']) ? (int)$source['teacher_id'] : 0;
    if ($teacherId <= 0) {
        json_error('teacher_id requerido', 422);
    }
    return $teacherId;
}

function validate_teacher_exists(PDO $pdo, int $teacherId) {
    $stmt = $pdo->prepare('SELECT id FROM users WHERE id = ? AND role = "teacher" LIMIT 1');
    $stmt->execute([$teacherId]);
    if (!$stmt->fetch()) {
        json_error('Profesor no encontrado', 404);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $teacherId = get_teacher_id_from_input($_GET);
    validate_teacher_exists($pdo, $teacherId);

    $stmt = $pdo->prepare('
        SELECT id, datetime, tipo, modalidad, duration_minutes, curso, nivel, meeting_link, max_alumnos, is_available, created_at
        FROM teacher_slots
        WHERE teacher_id = ?
          AND DATE(datetime) >= DATE(NOW())
        ORDER BY datetime ASC
    ');
    $stmt->execute([$teacherId]);
    $slots = $stmt->fetchAll();

    json_ok(['slots' => $slots]);
}

$raw = file_get_contents('php://input');
$input = json_decode($raw, true);
if (!is_array($input)) {
    $input = $_POST;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $teacherId = get_teacher_id_from_input($input);
    validate_teacher_exists($pdo, $teacherId);

    $datetime = trim((string)($input['datetime'] ?? ''));
    $tipo = trim((string)($input['tipo'] ?? 'clase'));
    $modalidad = trim((string)($input['modalidad'] ?? 'virtual'));
    $duration = (int)($input['duration_minutes'] ?? 60);
    $curso = trim((string)($input['curso'] ?? 'Inglés'));
    $nivel = trim((string)($input['nivel'] ?? ''));
    $meetingLink = trim((string)($input['meeting_link'] ?? ''));
    $maxAlumnos = isset($input['max_alumnos']) ? max(1, (int)$input['max_alumnos']) : 1;

    if ($datetime === '') {
        json_error('Fecha y hora requeridas', 422);
    }

    $checkDup = $pdo->prepare('SELECT COUNT(*) FROM teacher_slots WHERE teacher_id = ? AND datetime = ?');
    $checkDup->execute([$teacherId, $datetime]);
    if ((int)$checkDup->fetchColumn() > 0) {
        json_error('Ya existe un horario en esa fecha y hora', 409);
    }

    $checkBlocked = $pdo->prepare('
        SELECT COUNT(*)
        FROM teacher_schedule_blocks
        WHERE teacher_id = ?
          AND ? < ends_at
          AND ? > starts_at
    ');
    $slotStart = $datetime;
    $slotEnd = date('Y-m-d H:i:s', strtotime($datetime . ' +' . $duration . ' minutes'));
    $checkBlocked->execute([$teacherId, $slotStart, $slotEnd]);
    if ((int)$checkBlocked->fetchColumn() > 0) {
        json_error('El horario cae dentro de un bloque de disponibilidad del coordinador', 409);
    }

    $stmt = $pdo->prepare('
        INSERT INTO teacher_slots (teacher_id, datetime, tipo, modalidad, duration_minutes, curso, nivel, meeting_link, max_alumnos)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');
    $stmt->execute([
        $teacherId,
        $datetime,
        $tipo,
        $modalidad,
        $duration,
        $curso,
        $nivel !== '' ? $nivel : null,
        $meetingLink !== '' ? $meetingLink : null,
        $maxAlumnos,
    ]);

    json_ok(['id' => (int)$pdo->lastInsertId()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $slotId = (int)($input['id'] ?? 0);
    $meetingLink = trim((string)($input['meeting_link'] ?? ''));

    if ($slotId <= 0) {
        json_error('ID de slot requerido', 422);
    }

    $stmt = $pdo->prepare('UPDATE teacher_slots SET meeting_link = ? WHERE id = ?');
    $stmt->execute([$meetingLink !== '' ? $meetingLink : null, $slotId]);

    json_ok(['updated' => true]);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $slotId = (int)($input['id'] ?? 0);
    if ($slotId <= 0) {
        json_error('ID de slot requerido', 422);
    }

    $checkRes = $pdo->prepare('SELECT COUNT(*) FROM schedule_reservations WHERE slot_id = ?');
    $checkRes->execute([$slotId]);
    if ((int)$checkRes->fetchColumn() > 0) {
        json_error('No se puede eliminar un slot con reservas activas', 409);
    }

    $stmt = $pdo->prepare('DELETE FROM teacher_slots WHERE id = ?');
    $stmt->execute([$slotId]);

    json_ok(['deleted' => true]);
}

json_error('Método no permitido', 405);
