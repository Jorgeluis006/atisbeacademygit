<?php
require_once __DIR__ . '/../_bootstrap.php';

header('Content-Type: application/json; charset=utf-8');

$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');

if ($email === '') {
    json_error('El correo electrónico es requerido', 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_error('El correo electrónico no es válido', 422);
}

try {
    $pdo = get_pdo();
    
    // Check if email already exists
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        json_error('Este correo electrónico ya está registrado', 409);
    }
    
    json_ok(['message' => 'Correo registrado correctamente. Ahora vincula tu cuenta.']);
} catch (Throwable $e) {
    error_log("Error in register.php: " . $e->getMessage());
    json_error('Error al registrar el correo', 500);
}
