<?php
require_once __DIR__ . '/../_bootstrap.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

ensure_users_schema();
ensure_teacher_fields();

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) { $data = $_POST; }

$studentUsername = isset($data['student_username']) ? trim((string)$data['student_username']) : '';
$teacherUsername = isset($data['teacher_username']) ? trim((string)$data['teacher_username']) : '';
$level = isset($data['level']) ? trim((string)$data['level']) : null;
$modality = isset($data['modality']) ? trim((string)$data['modality']) : null;

if ($studentUsername === '' || $teacherUsername === '') {
    json_error('student_username y teacher_username son requeridos', 422);
}

$pdo = get_pdo();

$teacher = $pdo->prepare('SELECT id, role FROM users WHERE username=? LIMIT 1');
$teacher->execute([$teacherUsername]);
$t = $teacher->fetch();
if (!$t || $t['role'] !== 'teacher') {
    json_error('Profesor no encontrado', 404);
}

$student = $pdo->prepare('SELECT id FROM users WHERE username=? LIMIT 1');
$student->execute([$studentUsername]);
$s = $student->fetch();
if (!$s) { json_error('Estudiante no encontrado', 404); }

$stmt = $pdo->prepare('UPDATE users SET role="student", teacher_id=?, level=?, modality=? WHERE id=?');
$stmt->execute([(int)$t['id'], $level, $modality, (int)$s['id']]);

json_ok(['assigned' => true]);
