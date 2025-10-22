<?php
require_once __DIR__ . '/../_bootstrap.php';
require_auth();

$userId = (int)($_SESSION['user_id'] ?? 0);
$role = (string)($_SESSION['role'] ?? '');
if ($role !== 'teacher') {
    json_error('No autorizado', 403);
}

ensure_users_schema();
ensure_teacher_fields();

$pdo = get_pdo();
$stmt = $pdo->prepare('SELECT id, username, name, level, modality FROM users WHERE role="student" AND teacher_id=? ORDER BY level, modality, name');
$stmt->execute([$userId]);
$rows = $stmt->fetchAll();

$grouped = [];
foreach ($rows as $r) {
    $lvl = $r['level'] ?? 'Sin nivel';
    $mod = $r['modality'] ?? 'sin-definir';
    if (!isset($grouped[$lvl])) $grouped[$lvl] = ['virtual' => [], 'presencial' => [], 'sin-definir' => []];
    if (!isset($grouped[$lvl][$mod])) $grouped[$lvl][$mod] = [];
    $grouped[$lvl][$mod][] = [
        'id' => (int)$r['id'],
        'username' => $r['username'],
        'name' => $r['name'],
        'level' => $r['level'],
        'modality' => $r['modality'],
    ];
}

json_ok(['students' => $grouped]);
