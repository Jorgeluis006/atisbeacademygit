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
      AND datetime > NOW()
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
// También incluir los días bloqueados para este profesor (si aplica) o globales
$blocked = null;
try {
    // Primero intentar obtener bloqueos a nivel de profesor
    $stmt = $pdo->prepare("SELECT booking_blocked_days FROM users WHERE id = ? LIMIT 1");
    $stmt->execute([$teacher_id]);
    $r = $stmt->fetch();
    if ($r && $r['booking_blocked_days']) {
        $blocked = json_decode($r['booking_blocked_days'], true);
    } else {
        // Fallback a configuración global (booking_settings)
        $row = $pdo->query("SELECT blocked_days, allowed_days FROM booking_settings WHERE id = 1 LIMIT 1")->fetch();
        if ($row) {
            if (!empty($row['blocked_days'])) $blocked = json_decode($row['blocked_days'], true);
            elseif (!empty($row['allowed_days'])) {
                $all = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
                $allowed = json_decode($row['allowed_days'], true) ?: [];
                $blocked = array_values(array_filter($all, function($d) use ($allowed){ return !in_array($d, $allowed, true); }));
            }
        }
    }
} catch (Throwable $e) {
    // ignore and leave blocked as null
}

// Re-emit JSON incluyendo blocked days
json_ok(['slots' => $filtered, 'blocked_days' => $blocked]);
