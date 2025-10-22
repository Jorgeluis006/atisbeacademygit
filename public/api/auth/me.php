<?php
require_once __DIR__ . '/../_bootstrap.php';

if (!isset($_SESSION['user_id'])) {
    json_ok(['user' => null]);
}

json_ok(['user' => [
    'id' => (int)$_SESSION['user_id'],
    'username' => (string)($_SESSION['username'] ?? ''),
    'name' => (string)($_SESSION['name'] ?? ''),
    'role' => (string)($_SESSION['role'] ?? 'student'),
]]);
