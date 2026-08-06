<?php
require_once __DIR__ . '/../_bootstrap.php';
require_admin_or_coordinator();
ensure_schedule_schema();

$pdo = get_pdo();

function teacher_id_from_request($source) {
    $teacherId = isset($source['teacher_id']) ? (int)$source['teacher_id'] : 0;
    if ($teacherId <= 0) {
        json_error('teacher_id requerido', 422);
    }
    return $teacherId;
}

function validate_teacher(PDO $pdo, int $teacherId) {
    $stmt = $pdo->prepare('SELECT id FROM users WHERE id = ? AND role = "teacher" LIMIT 1');
    $stmt->execute([$teacherId]);
    if (!$stmt->fetch()) {
        json_error('Profesor no encontrado', 404);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $teacherId = teacher_id_from_request($_GET);
    validate_teacher($pdo, $teacherId);

    $stmt = $pdo->prepare('
        SELECT id, teacher_id, starts_at, ends_at, reason, created_by, created_at
        FROM teacher_schedule_blocks
        WHERE teacher_id = ?
          AND ends_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY starts_at ASC
    ');
    $stmt->execute([$teacherId]);

    json_ok(['items' => $stmt->fetchAll()]);
}

$raw = file_get_contents('php://input');
$input = json_decode($raw, true);
if (!is_array($input)) {
    $input = $_POST;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $teacherId = teacher_id_from_request($input);
    validate_teacher($pdo, $teacherId);

    $startsAt = trim((string)($input['starts_at'] ?? ''));
    $endsAt = trim((string)($input['ends_at'] ?? ''));
    $reason = trim((string)($input['reason'] ?? ''));

    if ($startsAt === '' || $endsAt === '') {
        json_error('starts_at y ends_at requeridos', 422);
    }

    $startTs = strtotime($startsAt);
    $endTs = strtotime($endsAt);
    if (!$startTs || !$endTs || $endTs <= $startTs) {
        json_error('Rango de bloqueo inválido', 422);
    }

    $stmt = $pdo->prepare('
        INSERT INTO teacher_schedule_blocks (teacher_id, starts_at, ends_at, reason, created_by)
        VALUES (?, ?, ?, ?, ?)
    ');
    $stmt->execute([
        $teacherId,
        date('Y-m-d H:i:s', $startTs),
        date('Y-m-d H:i:s', $endTs),
        $reason !== '' ? $reason : null,
        (int)($_SESSION['user_id'] ?? 0) ?: null,
    ]);

    // Inhabilitar slots futuros que se crucen con el bloqueo
    $disable = $pdo->prepare('
        UPDATE teacher_slots
        SET is_available = 0
        WHERE teacher_id = ?
          AND datetime >= NOW()
          AND datetime < ?
          AND DATE_ADD(datetime, INTERVAL duration_minutes MINUTE) > ?
    ');
    $disable->execute([$teacherId, date('Y-m-d H:i:s', $endTs), date('Y-m-d H:i:s', $startTs)]);

    json_ok(['id' => (int)$pdo->lastInsertId()]);
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = (int)($input['id'] ?? 0);
    if ($id <= 0) {
        json_error('id requerido', 422);
    }

    $stmt = $pdo->prepare('DELETE FROM teacher_schedule_blocks WHERE id = ?');
    $stmt->execute([$id]);

    json_ok(['deleted' => true]);
}

json_error('Método no permitido', 405);
