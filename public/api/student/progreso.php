<?php
require_once __DIR__ . '/../_bootstrap.php';

require_auth();

$userId = (int)$_SESSION['user_id'];

ensure_student_progress_schema();
$pdo = get_pdo();
$stmt = $pdo->prepare('SELECT data FROM student_progress WHERE user_id=?');
$stmt->execute([$userId]);
$row = $stmt->fetch();

if ($row && isset($row['data'])) {
    $data = json_decode((string)$row['data'], true);
    if (is_array($data)) {
        json_ok(['progreso' => $data, 'userId' => $userId]);
    }
}

// Fallback si no hay registro aún: devolver progreso vacío (sin notas de ejemplo)
$response = [
    'asistencia' => 0,
    'notas' => [],
    'nivel' => [ 'mcer' => '', 'descripcion' => '' ],
    'fortalezas' => [],
    'debilidades' => [],
];
json_ok(['progreso' => $response, 'userId' => $userId]);
