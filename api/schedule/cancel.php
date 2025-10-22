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
$stmt = $pdo->prepare('DELETE FROM schedule_reservations WHERE id=? AND user_id=?');
$stmt->execute([$id, (int)$_SESSION['user_id']]);

json_ok();
