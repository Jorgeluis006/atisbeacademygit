<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../_bootstrap.php';

try {
    $pdo = get_pdo();
    
    // Verificar estudiante luisito
    $stmt = $pdo->prepare('SELECT id, username, teacher_id FROM users WHERE username = ?');
    $stmt->execute(['luisito']);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $result = [];
    $result['student'] = $student;
    
    if ($student && $student['teacher_id']) {
        // Verificar profesor
        $stmt = $pdo->prepare('SELECT id, username FROM users WHERE id = ?');
        $stmt->execute([$student['teacher_id']]);
        $teacher = $stmt->fetch(PDO::FETCH_ASSOC);
        $result['teacher'] = $teacher;
        
        // Slots para hoy
        $stmt = $pdo->prepare('
            SELECT id, datetime, duration_minutes, tipo, modalidad, curso, nivel
            FROM teacher_slots
            WHERE teacher_id = ? 
              AND DATE(datetime) = DATE(NOW())
            ORDER BY datetime ASC
        ');
        $stmt->execute([$student['teacher_id']]);
        $slots = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $result['slots_today'] = $slots;
        $result['count_slots'] = count($slots);
        
        // Slots con la nueva condición (últimos 30 minutos)
        $stmt = $pdo->prepare('
            SELECT id, datetime, duration_minutes, tipo, modalidad, curso, nivel
            FROM teacher_slots
            WHERE teacher_id = ? 
              AND datetime > DATE_SUB(NOW(), INTERVAL 30 MINUTE)
            ORDER BY datetime ASC
        ');
        $stmt->execute([$student['teacher_id']]);
        $slots_30 = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $result['slots_with_grace'] = $slots_30;
        $result['count_slots_grace'] = count($slots_30);
    }
    
    http_response_code(200);
    echo json_encode($result, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
