<?php
require_once __DIR__ . '/../_bootstrap.php';
require_auth();

$role = (string)($_SESSION['role'] ?? '');
if ($role !== 'teacher') json_error('No autorizado', 403);

$teacherId = (int)($_SESSION['user_id'] ?? 0);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Método no permitido', 405);

$input = json_decode(file_get_contents('php://input'), true);
$studentUsername = isset($input['student_username']) ? trim((string)$input['student_username']) : '';
$progress = isset($input['progreso']) ? $input['progreso'] : null;
if ($studentUsername === '' || !is_array($progress)) json_error('Parámetros inválidos', 422);

ensure_users_schema();
ensure_teacher_fields();
ensure_student_progress_schema();
ensure_student_progress_history_schema();

$pdo = get_pdo();

// Verificar que el estudiante pertenece al profesor
$stmt = $pdo->prepare('SELECT id FROM users WHERE username=? AND role="student" AND teacher_id=?');
$stmt->execute([$studentUsername, $teacherId]);
$student = $stmt->fetch();
if (!$student) json_error('Estudiante no encontrado o no asignado al profesor', 404);

$userId = (int)$student['id'];

try {
    $result = save_student_progress_with_history(
        $pdo,
        $userId,
        $progress,
        (int)($_SESSION['user_id'] ?? 0),
        $role
    );
    json_ok($result);
} catch (Throwable $e) {
    json_error('No se pudo guardar el progreso', 500, ['details' => $e->getMessage()]);
}
