<?php
require_once __DIR__ . '/../_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

require_admin();

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) { $data = $_POST; }

$username = isset($data['username']) ? trim((string)$data['username']) : '';
$password = isset($data['password']) ? (string)$data['password'] : '';
$name     = isset($data['name']) ? trim((string)$data['name']) : '';
$role     = isset($data['role']) ? trim((string)$data['role']) : 'student';
$email    = isset($data['email']) ? trim((string)$data['email']) : '';

if ($username === '' || $password === '') {
    json_error('username y password son requeridos', 422);
}
if (!preg_match('/^[a-zA-Z0-9_.-]{3,50}$/', $username)) {
    json_error('username inválido', 422);
}
if (!in_array($role, ['student','admin','teacher'], true)) { $role = 'student'; }

// Email es requerido para estudiantes y profesores
if ($role !== 'admin' && $email === '') {
    json_error('El correo electrónico es requerido para estudiantes y profesores', 422);
}

ensure_users_schema();
ensure_teacher_fields();

try {
    $pdo = get_pdo();
    $stmt = $pdo->prepare('INSERT INTO users (username, password_hash, name, role, email) VALUES (?,?,?,?,?)');
    $stmt->execute([$username, password_hash($password, PASSWORD_BCRYPT), $name, $role, $email ?: null]);
    json_ok(['created' => ['username' => $username, 'role' => $role]]);
} catch (Throwable $e) {
    if (str_contains($e->getMessage(), 'Duplicate')) {
        json_error('El usuario ya existe', 409);
    }
    json_error('Error al crear usuario', 500, ['details' => $e->getMessage()]);
}
