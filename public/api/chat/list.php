<?php
require_once __DIR__ . '/../_bootstrap.php';
require_auth();
ensure_schedule_schema();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_error('Método no permitido', 405);
}

$other_id = isset($_GET['other_id']) ? (int)$_GET['other_id'] : 0;
$limit = isset($_GET['limit']) ? max(1, min((int)$_GET['limit'], 200)) : 50;
$before_id = isset($_GET['before_id']) ? (int)$_GET['before_id'] : 0;

if (!$other_id) { json_error('Parámetros inválidos: other_id requerido', 422); }

$me = (int)$_SESSION['user_id'];
$pdo = get_pdo();

$query = 'SELECT id, sender_id, receiver_id, body, reservation_id, created_at
          FROM chat_messages
          WHERE ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))';
$params = [$me, $other_id, $other_id, $me];

if ($before_id > 0) {
    $query .= ' AND id < ?';
    $params[] = $before_id;
}

$query .= ' ORDER BY id DESC LIMIT ?';
$params[] = $limit;

$stmt = $pdo->prepare($query);
$stmt->execute($params);
$items = $stmt->fetchAll();

// Devolver en orden cronológico ascendente para el UI
$items = array_reverse($items);

json_ok(['messages' => $items]);
<?php
