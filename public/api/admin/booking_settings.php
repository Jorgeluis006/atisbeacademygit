<?php
require_once __DIR__ . '/../_bootstrap.php';
require_admin();

// Endpoint simple para obtener/actualizar los días permitidos para reservas (configuración GLOBAL)
// GET -> devuelve { blocked_days: ["Monday","Tuesday",...] }
// POST -> recibir { blocked_days: [ ... ] } y guardar (solo global)

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $pdo = get_pdo();
    $blocked = null;
    // global setting: prefer blocked_days column, fallback to allowed_days for compatibility
    $row = $pdo->query("SELECT blocked_days, allowed_days FROM booking_settings WHERE id = 1 LIMIT 1")->fetch();
    if ($row) {
        if (!empty($row['blocked_days'])) $blocked = json_decode($row['blocked_days'], true);
        elseif (!empty($row['allowed_days'])) {
            // convert allowed -> blocked (i.e., days not in allowed are blocked)
            $all = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
            $allowed = json_decode($row['allowed_days'], true) ?: [];
            $blocked = array_values(array_filter($all, function($d) use ($allowed){ return !in_array($d, $allowed, true); }));
        }
    }
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => true, 'blocked_days' => $blocked], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (!is_array($data) || !isset($data['blocked_days']) || !is_array($data['blocked_days'])) {
        json_error('blocked_days array requerido', 422);
    }
    $blocked = array_values(array_filter($data['blocked_days'], function($v){ return is_string($v) && $v !== ''; }));
    $pdo = get_pdo();
    // update global blocked_days column; create column if not exists
    try { $pdo->exec("ALTER TABLE booking_settings ADD COLUMN blocked_days JSON DEFAULT NULL"); } catch (Throwable $e) {}
    $stmt = $pdo->prepare("UPDATE booking_settings SET blocked_days = ? WHERE id = 1");
    $stmt->execute([json_encode($blocked, JSON_UNESCAPED_UNICODE)]);
    json_ok(['blocked_days' => $blocked]);
}

http_response_code(405);
echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
