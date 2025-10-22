<?php
require_once __DIR__ . '/../_bootstrap.php';
require_admin();

ensure_users_schema();

try {
    $q = isset($_GET['q']) ? trim((string)$_GET['q']) : '';
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = min(50, max(1, (int)($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;

    $pdo = get_pdo();

    if ($q !== '') {
        $like = '%' . $q . '%';
        $countStmt = $pdo->prepare('SELECT COUNT(*) FROM users WHERE username LIKE :q OR name LIKE :q2');
        $countStmt->bindValue(':q', $like, PDO::PARAM_STR);
        $countStmt->bindValue(':q2', $like, PDO::PARAM_STR);
        $countStmt->execute();
        $total = (int)$countStmt->fetchColumn();

        $stmt = $pdo->prepare('SELECT id, username, name, role, created_at FROM users WHERE username LIKE :q OR name LIKE :q2 ORDER BY created_at DESC LIMIT :limit OFFSET :offset');
        $stmt->bindValue(':q', $like, PDO::PARAM_STR);
        $stmt->bindValue(':q2', $like, PDO::PARAM_STR);
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        $stmt->execute();
    } else {
        $total = (int)$pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
        $stmt = $pdo->prepare('SELECT id, username, name, role, created_at FROM users ORDER BY created_at DESC LIMIT :limit OFFSET :offset');
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
        $stmt->execute();
    }

    $items = $stmt->fetchAll();

    json_ok([
        'items' => $items,
        'page' => $page,
        'limit' => $limit,
        'total' => $total,
    ]);
} catch (Throwable $e) {
    json_error('No se pudieron listar usuarios', 500, ['details' => $e->getMessage()]);
}
