<?php
require_once __DIR__ . '/../_bootstrap.php';
require_auth();

$role = (string)($_SESSION['role'] ?? '');
if ($role !== 'teacher') json_error('No autorizado', 403);

$teacherId = (int)($_SESSION['user_id'] ?? 0);
$studentUsername = isset($_GET['student']) ? trim((string)$_GET['student']) : '';
if ($studentUsername === '') json_error('Falta parámetro student', 422);

ensure_users_schema();
ensure_teacher_fields();
ensure_student_progress_schema();

$pdo = get_pdo();

// Verificar que el estudiante pertenece al profesor
$stmt = $pdo->prepare('SELECT id, username, name FROM users WHERE username=? AND role="student" AND teacher_id=?');
$stmt->execute([$studentUsername, $teacherId]);
$student = $stmt->fetch();
if (!$student) json_error('Estudiante no encontrado o no asignado al profesor', 404);

// Buscar progreso
$stmt = $pdo->prepare('SELECT data FROM student_progress WHERE user_id=?');
$stmt->execute([(int)$student['id']]);
$row = $stmt->fetch();

$default = [
    'asistencia' => 0,
    'notas' => [],
    'nivel' => [ 'mcer' => '', 'descripcion' => '' ],
    'fortalezas' => [],
    'debilidades' => [],
];

$data = $row ? json_decode((string)$row['data'], true) : $default;
if (!is_array($data)) $data = $default;

json_ok(['student' => [
    'id' => (int)$student['id'],
    'username' => $student['username'],
    'name' => $student['name'],
], 'progreso' => $data]);
