<?php
require_once __DIR__ . '/../_bootstrap.php';
require_auth();
ensure_schedule_schema();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$receiver_id = (int)($input['receiver_id'] ?? 0);
$body = trim($input['body'] ?? '');
$reservation_id = isset($input['reservation_id']) ? (int)$input['reservation_id'] : null;

if (!$receiver_id || $body === '') {
    json_error('Parámetros inválidos: receptor y mensaje son requeridos', 422);
}

$sender_id = (int)$_SESSION['user_id'];
$pdo = get_pdo();

// Opcional: validar relación teacher-student mediante reservas si se provee reservation_id
if ($reservation_id) {
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM schedule_reservations WHERE id = ?');
    $stmt->execute([$reservation_id]);
    if ((int)$stmt->fetchColumn() === 0) {
        json_error('Reserva asociada no encontrada', 404);
    }
}

$stmt = $pdo->prepare('INSERT INTO chat_messages (sender_id, receiver_id, body, reservation_id) VALUES (?, ?, ?, ?)');
$stmt->execute([$sender_id, $receiver_id, $body, $reservation_id]);

json_ok(['id' => (int)$pdo->lastInsertId()]);
<?php
