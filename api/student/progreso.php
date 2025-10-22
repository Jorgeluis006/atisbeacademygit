<?php
require_once __DIR__ . '/../_bootstrap.php';

require_auth();

// Datos de ejemplo; en producción, consulta por $_SESSION['user_id']
$userId = (int)$_SESSION['user_id'];

$response = [
    'asistencia' => 72, // porcentaje
    'notas' => [
        ['actividad' => 'Quiz 1', 'nota' => 4.2, 'fecha' => '2025-09-10'],
        ['actividad' => 'Tarea 1', 'nota' => 4.6, 'fecha' => '2025-09-17'],
    ],
    'nivel' => [
        'mcer' => 'A2',
        'descripcion' => 'Usuario básico avanzado. Comprende frases y expresiones frecuentes.',
    ],
    'fortalezas' => ['Comprensión auditiva', 'Vocabulario de uso cotidiano'],
    'debilidades' => ['Producción escrita', 'Estructuras gramaticales en pasado'],
];

json_ok(['progreso' => $response, 'userId' => $userId]);
