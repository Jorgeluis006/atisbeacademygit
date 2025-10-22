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

// Fallback si no hay registro aún
$response = [
    'asistencia' => 72,
    'notas' => [
        ['actividad' => 'Quiz 1', 'nota' => 4.2, 'fecha' => '2025-09-10'],
        ['actividad' => 'Tarea 1', 'nota' => 4.6, 'fecha' => '2025-09-17'],
    ],
    'nivel' => [ 'mcer' => 'A2', 'descripcion' => 'Usuario básico avanzado. Comprende frases y expresiones frecuentes.' ],
    'fortalezas' => ['Comprensión auditiva', 'Vocabulario de uso cotidiano'],
    'debilidades' => ['Producción escrita', 'Estructuras gramaticales en pasado'],
];
json_ok(['progreso' => $response, 'userId' => $userId]);
