<?php
require_once __DIR__ . '/../_bootstrap.php';
require_auth();

$user_id = (int)$_SESSION['user_id'];

// Obtener el profesor asignado al estudiante
$pdo = get_pdo();
$stmt = $pdo->prepare('SELECT teacher_id FROM users WHERE id = ?');
$stmt->execute([$user_id]);
$user = $stmt->fetch();

if (!$user || !$user['teacher_id']) {
    // Si no tiene profesor asignado, retornar slots vacíos o un mensaje
    json_ok(['slots' => [], 'message' => 'No tienes un profesor asignado aún']);
}

$teacher_id = (int)$user['teacher_id'];

// Obtener los slots disponibles del profesor
$stmt = $pdo->prepare('
    SELECT 
        id,
        datetime,
        tipo,
        modalidad,
        duration_minutes,
        is_available
    FROM teacher_slots
    WHERE teacher_id = ? 
      AND is_available = TRUE
      AND datetime > NOW()
    ORDER BY datetime ASC
');
$stmt->execute([$teacher_id]);
$slots = $stmt->fetchAll();

// Formatear para el frontend
foreach ($slots as &$slot) {
    $dt = new DateTime($slot['datetime']);
    $slot['datetime'] = $dt->format(DateTime::ATOM);
}

json_ok(['slots' => $slots]);

