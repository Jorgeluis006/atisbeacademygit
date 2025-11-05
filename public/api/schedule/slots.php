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
$stmt = $pdo->prepare('
    SELECT 
        id,
        datetime,
        tipo,
        modalidad,
        duration_minutes,
        curso,
        nivel,
        is_available
    FROM teacher_slots
    WHERE teacher_id = ? 
      AND datetime > NOW()
    ORDER BY datetime ASC
');
$stmt->execute([$teacher_id]);
$slots = $stmt->fetchAll();

// No necesitamos formatear - enviar datetime tal como está en MySQL
json_ok(['slots' => $slots]);
