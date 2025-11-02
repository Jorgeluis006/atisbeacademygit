<?php
require_once __DIR__ . '/../_bootstrap.php';
require_auth();

$role = $_SESSION['role'] ?? '';
if ($role !== 'teacher') {
    json_error('No autorizado', 403);
}

$teacher_id = (int)$_SESSION['user_id'];

// Listar todas las reservas de los estudiantes asignados a este profesor
$pdo = get_pdo();
$stmt = $pdo->prepare('
    SELECT 
        r.id,
        r.datetime,
        r.tipo,
        r.modalidad,
        r.notas,
        r.created_at,
        u.id as student_id,
        u.name as student_name,
        u.username as student_username
    FROM schedule_reservations r
    INNER JOIN users u ON r.user_id = u.id
    WHERE r.teacher_id = ?
    ORDER BY r.datetime DESC
');
$stmt->execute([$teacher_id]);
$reservations = $stmt->fetchAll();

json_ok(['reservations' => $reservations]);
