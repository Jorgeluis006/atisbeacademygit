<?php
require_once __DIR__ . '/../_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

require_admin();

// Evita que se vuelva a sembrar el usuario demo
if (!defined('DISABLE_DEMO_SEED') || DISABLE_DEMO_SEED !== true) {
    define('DISABLE_DEMO_SEED', true);
}

$pdo = get_pdo();
$pdo->prepare('DELETE FROM users WHERE username = ?')->execute(['demo']);
json_ok(['demo_removed' => true]);
