<?php
require_once __DIR__ . '/../_bootstrap.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    $data = $_POST;
}

$email = isset($data['email']) ? trim((string)$data['email']) : '';
$username = isset($data['username']) ? trim((string)$data['username']) : '';
$password = isset($data['password']) ? (string)$data['password'] : '';

if ($email === '' || $username === '' || $password === '') {
    json_error('Todos los campos son requeridos', 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_error('El correo electrónico no es válido', 422);
}

try {
    ensure_users_schema();
    $pdo = get_pdo();
    
    // Check if username exists
    $stmt = $pdo->prepare('SELECT id, password_hash, name, role, email FROM users WHERE username = ? LIMIT 1');
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    if (!$user) {
        json_error('Usuario no encontrado', 404);
    }
    
    // Verify password
    if (!password_verify($password, (string)$user['password_hash'])) {
        json_error('Contraseña incorrecta', 401);
    }
    
    // Check if this account already has an email
    if ($user['email'] !== null && $user['email'] !== '') {
        json_error('Esta cuenta ya está vinculada a un correo electrónico', 409);
    }
    
    // Check if this email is already linked to another account
    $emailStmt = $pdo->prepare('SELECT id, username FROM users WHERE email = ? LIMIT 1');
    $emailStmt->execute([$email]);
    $existingUser = $emailStmt->fetch();
    
    if ($existingUser) {
        json_error('Este correo ya está vinculado a otra cuenta', 409);
    }
    
    // Link email to account
    $updateStmt = $pdo->prepare('UPDATE users SET email = ? WHERE id = ?');
    $updateStmt->execute([$email, $user['id']]);
    
    // Log in the user
    $_SESSION['user_id'] = (int)$user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['name'] = $user['name'];
    $_SESSION['role'] = $user['role'];

    json_ok([
        'user' => [
            'id' => (int)$user['id'],
            'username' => $user['username'],
            'name' => $user['name'],
            'role' => $user['role']
        ],
        'message' => 'Cuenta vinculada exitosamente'
    ]);
} catch (Throwable $e) {
    error_log("Error in link_account.php: " . $e->getMessage());
    json_error('Error al vincular la cuenta', 500);
}
