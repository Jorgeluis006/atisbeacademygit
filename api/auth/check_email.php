<?php
require_once __DIR__ . '/../_bootstrap.php';

header('Content-Type: application/json; charset=utf-8');

$email = isset($_GET['email']) ? trim((string)$_GET['email']) : '';

if ($email === '') {
    json_error('El correo electrónico es requerido', 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_error('El correo electrónico no es válido', 422);
}

try {
    ensure_users_schema();
    $pdo = get_pdo();
    
    $stmt = $pdo->prepare('SELECT id, username FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if ($user) {
        // Email is already linked to an account
        json_ok([
            'exists' => true,
            'linked' => true,
            'message' => 'Este correo ya está vinculado. Inicia sesión con tu usuario y contraseña.'
        ]);
    } else {
        // Email not in system yet
        json_ok([
            'exists' => false,
            'linked' => false,
            'message' => 'Correo disponible. Vincula tu cuenta de estudiante, profesor o admin.'
        ]);
    }
} catch (Throwable $e) {
    error_log("Error in check_email.php: " . $e->getMessage());
    json_error('Error al verificar el correo', 500);
}
