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

$username = isset($data['username']) ? trim((string)$data['username']) : '';
$email = isset($data['email']) ? trim((string)$data['email']) : '';
$password = isset($data['password']) ? (string)$data['password'] : '';

if ($username === '' || $email === '' || $password === '') {
    json_error('Usuario, correo electrónico y contraseña son requeridos', 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_error('El correo electrónico no es válido', 422);
}

try {
    ensure_users_schema();
    seed_demo_user_if_empty();

    $pdo = get_pdo();
    
    // Login with username
    $stmt = $pdo->prepare('SELECT id, username, password_hash, name, role, email FROM users WHERE username = ? LIMIT 1');
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    if (!$user) {
        json_error('Usuario no encontrado', 404);
    }
    
    if (!password_verify($password, (string)$user['password_hash'])) {
        json_error('Contraseña incorrecta', 401);
    }
    
    // Verify email matches
    if ($user['email'] !== null && $user['email'] !== '') {
        if ($user['email'] !== $email) {
            json_error('El correo electrónico no coincide con el registrado', 401);
        }
    } else {
        // First login - set the email
        $updateStmt = $pdo->prepare('UPDATE users SET email = ? WHERE id = ?');
        $updateStmt->execute([$email, $user['id']]);
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
