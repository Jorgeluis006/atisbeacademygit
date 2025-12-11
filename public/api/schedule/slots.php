<?php
require_once __DIR__ . '/../_bootstrap.php';
require_auth();
ensure_schedule_schema();

$user_id = (int)$_SESSION['user_id'];

// Obtener el profesor asignado al estudiante
$pdo = get_pdo();
$stmt = $pdo->prepare('SELECT teacher_id FROM users WHERE id = ?');
$stmt->execute([$user_id]);
$user = $stmt->fetch();

if (!$user || !$user['teacher_id']) {
    // Si no tiene profesor asignado, retornar slots vacíos
    json_ok(['slots' => []]);
}

$teacher_id = (int)$user['teacher_id'];

// Obtener todos los slots del profesor (permitir clases grupales)
// Ya no filtramos por is_available para permitir múltiples estudiantes

// Traer también max_alumnos
// Permitir slots que comenzaron en los últimos 30 minutos (útil si clase ya está en progreso)
$stmt = $pdo->prepare('
        SELECT 
                id,
                datetime,
                tipo,
                modalidad,
                duration_minutes,
                curso,
                nivel,
                is_available,
                max_alumnos
        FROM teacher_slots
        WHERE teacher_id = ? 
            AND (DATE(datetime) > DATE(NOW()) OR datetime >= NOW())
        ORDER BY datetime ASC
');
$stmt->execute([$teacher_id]);
$slots = $stmt->fetchAll();

// Filtrar slots llenos
$filtered = [];
foreach ($slots as $slot) {
    $stmt2 = $pdo->prepare('SELECT COUNT(*) FROM schedule_reservations WHERE slot_id = ?');
    $stmt2->execute([$slot['id']]);
    $num_reservas = (int)$stmt2->fetchColumn();
    $max_alumnos = isset($slot['max_alumnos']) ? (int)$slot['max_alumnos'] : 1;
    if ($num_reservas < $max_alumnos) {
        $filtered[] = $slot;
    }
}
json_ok(['slots' => $filtered]);
