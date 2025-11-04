<?php
require_once __DIR__ . '/../_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    $data = $_POST;
}

$email = isset($data['email']) ? trim((string)$data['email']) : '';
$password = isset($data['password']) ? (string)$data['password'] : '';

if ($email === '' || $password === '') {
    json_error('Correo electrónico y contraseña son requeridos', 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_error('El correo electrónico no es válido', 422);
}

try {
    ensure_users_schema();
    seed_demo_user_if_empty();

    $pdo = get_pdo();
    
    // Login with email instead of username
    $stmt = $pdo->prepare('SELECT id, username, password_hash, name, role, email FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user) {
        json_error('No se encontró una cuenta vinculada a este correo', 404);
    }
    
    if (!password_verify($password, (string)$user['password_hash'])) {
        json_error('Contraseña incorrecta', 401);
    }
    
    $_SESSION['user_id'] = (int)$user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['name'] = $user['name'];
    $_SESSION['role'] = $user['role'];

    json_ok(['user' => [
        'id' => (int)$user['id'],
        'username' => $user['username'],
        'name' => $user['name'],
        'role' => $user['role'],
    ]]);
} catch (Throwable $e) {
    json_error('Error del servidor', 500, ['details' => $e->getMessage()]);
}
