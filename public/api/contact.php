<?php
require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/mailer.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    // Fallback para application/x-www-form-urlencoded
    $data = $_POST;
}

$required = ['nombre','edad','nacionalidad','email','telefono','idioma','modalidad','franja'];
foreach ($required as $k) {
    if (!isset($data[$k]) || trim((string)$data[$k]) === '') {
        json_error('Campo requerido faltante: ' . $k, 422);
    }
}

// Validaciones simples
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    json_error('Correo inválido', 422);
}

try {
    ensure_schema();
    $pdo = get_pdo();
    $stmt = $pdo->prepare('INSERT INTO contacts (nombre, edad, nacionalidad, email, telefono, idioma, modalidad, franja) VALUES (?,?,?,?,?,?,?,?)');
    $stmt->execute([
        trim($data['nombre']),
        trim($data['edad']),
        trim($data['nacionalidad']),
        trim($data['email']),
        trim($data['telefono']),
        trim($data['idioma']),
        trim($data['modalidad']),
        trim($data['franja']),
    ]);

    // Opcional: enviar correo de notificación (SMTP con PHPMailer si disponible)
    if (defined('MAIL_TO') && MAIL_TO !== '') {
        $body = '<h3>Nuevo contacto Atisbe</h3>' .
                '<p><strong>Nombre:</strong> ' . htmlspecialchars($data['nombre']) . '</p>' .
                '<p><strong>Email:</strong> ' . htmlspecialchars($data['email']) . '</p>' .
                '<p><strong>Teléfono:</strong> ' . htmlspecialchars($data['telefono']) . '</p>' .
                '<p><strong>Idioma:</strong> ' . htmlspecialchars($data['idioma']) . '</p>' .
                '<p><strong>Modalidad:</strong> ' . htmlspecialchars($data['modalidad']) . '</p>' .
                '<p><strong>Franja:</strong> ' . htmlspecialchars($data['franja']) . '</p>';
        @send_mail(MAIL_TO, 'Nuevo contacto Atisbe', $body);
    }

    json_ok(['id' => (int)$pdo->lastInsertId()]);
} catch (Throwable $e) {
    json_error('Error del servidor', 500, ['details' => $e->getMessage()]);
}
