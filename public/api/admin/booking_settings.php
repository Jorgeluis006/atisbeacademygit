<?php
require_once __DIR__ . '/../_bootstrap.php';
require_admin();

// Endpoint simple para obtener/actualizar los días permitidos para reservas
// GET -> devuelve { allowed_days: ["Monday","Tuesday",...] }
// POST -> recibir { allowed_days: [ ... ] } y guardar

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $pdo = get_pdo();
    $row = $pdo->query("SELECT allowed_days FROM booking_settings WHERE id = 1 LIMIT 1")->fetch();
    $allowed = null;
    if ($row && $row['allowed_days']) {
        $allowed = json_decode($row['allowed_days'], true);
    }
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => true, 'allowed_days' => $allowed], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (!is_array($data) || !isset($data['allowed_days']) || !is_array($data['allowed_days'])) {
        json_error('allowed_days array requerido', 422);
    }
    $allowed = array_values(array_filter($data['allowed_days'], function($v){ return is_string($v) && $v !== ''; }));
    $pdo = get_pdo();
    $stmt = $pdo->prepare("UPDATE booking_settings SET allowed_days = ? WHERE id = 1");
    $stmt->execute([json_encode($allowed, JSON_UNESCAPED_UNICODE)]);
    json_ok(['allowed_days' => $allowed]);
}

http_response_code(405);
echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
