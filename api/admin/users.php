<?php
require_once __DIR__ . '/../_bootstrap.php';
require_admin();

ensure_users_schema();

$q = isset($_GET['q']) ? trim((string)$_GET['q']) : '';
$page = max(1, (int)($_GET['page'] ?? 1));
$limit = min(50, max(1, (int)($_GET['limit'] ?? 20)));
$offset = ($page - 1) * $limit;

$pdo = get_pdo();

if ($q !== '') {
    $like = '%' . $q . '%';
    $countStmt = $pdo->prepare('SELECT COUNT(*) FROM users WHERE username LIKE ? OR name LIKE ?');
    $countStmt->execute([$like, $like]);
    $total = (int)$countStmt->fetchColumn();

    $stmt = $pdo->prepare('SELECT id, username, name, role, created_at FROM users WHERE username LIKE ? OR name LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?');
    $stmt->execute([$like, $like, $limit, $offset]);
} else {
    $total = (int)$pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
    $stmt = $pdo->prepare('SELECT id, username, name, role, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?');
    $stmt->execute([$limit, $offset]);
}

$items = $stmt->fetchAll();

json_ok([
    'items' => $items,
    'page' => $page,
    'limit' => $limit,
    'total' => $total,
]);
