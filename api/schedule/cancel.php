<?php
require_once __DIR__ . '/../_bootstrap.php';
require_auth();
ensure_schedule_schema();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) { $data = $_POST; }

$id = isset($data['id']) ? (int)$data['id'] : 0;
if ($id <= 0) { json_error('id inválido', 422); }

$pdo = get_pdo();

// Solo cancelar reservas del usuario autenticado
// Verificar existencia y ventana de 24 horas
$stmt = $pdo->prepare('SELECT id, datetime FROM schedule_reservations WHERE id = ? AND user_id = ?');
$stmt->execute([$id, (int)$_SESSION['user_id']]);
$res = $stmt->fetch();

if (!$res) {
    json_error('Reserva no encontrada', 404);
}

// Solo permitir cancelar si faltan 24 horas o más
$stmt = $pdo->prepare('SELECT CASE WHEN ? >= DATE_ADD(NOW(), INTERVAL 24 HOUR) THEN 1 ELSE 0 END AS allowed');
$stmt->execute([$res['datetime']]);
$allowed = (int)$stmt->fetchColumn();

if ($allowed !== 1) {
    json_error('Solo puedes cancelar hasta 24 horas antes de la clase');
}

// Proceder a cancelar
$stmt = $pdo->prepare('DELETE FROM schedule_reservations WHERE id=? AND user_id=?');
$stmt->execute([$id, (int)$_SESSION['user_id']]);

json_ok();
