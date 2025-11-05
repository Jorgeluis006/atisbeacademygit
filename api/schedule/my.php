<?php
require_once __DIR__ . '/../_bootstrap.php';
require_auth();
ensure_schedule_schema();

$pdo = get_pdo();
$stmt = $pdo->prepare('
  SELECT 
    sr.id, 
    sr.datetime, 
    sr.tipo, 
    sr.modalidad, 
    sr.notas, 
    sr.created_at,
    ts.meeting_link,
    ts.curso,
    ts.nivel
  FROM schedule_reservations sr
  LEFT JOIN teacher_slots ts ON sr.slot_id = ts.id
  WHERE sr.user_id=? 
  ORDER BY sr.datetime ASC
');
$stmt->execute([ (int)$_SESSION['user_id'] ]);
$reservas = $stmt->fetchAll();

// No necesitamos formatear - enviar datetime tal como está en MySQL
json_ok(['reservas' => $reservas]);
