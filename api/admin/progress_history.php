<?php
require_once __DIR__ . '/../_bootstrap.php';
require_admin();

ensure_users_schema();
ensure_teacher_fields();
ensure_student_progress_schema();
ensure_student_progress_history_schema();

$studentId = isset($_GET['student_id']) ? (int)$_GET['student_id'] : 0;
$studentUsername = isset($_GET['student_username']) ? trim((string)$_GET['student_username']) : '';
if ($studentId <= 0 && $studentUsername === '') {
    json_error('Debes indicar un estudiante', 422);
}

$pdo = get_pdo();

try {
    if ($studentId > 0) {
        $stmt = $pdo->prepare('SELECT id, username, name, level, modality FROM users WHERE id = ? AND role = "student" LIMIT 1');
        $stmt->execute([$studentId]);
    } else {
        $stmt = $pdo->prepare('SELECT id, username, name, level, modality FROM users WHERE username = ? AND role = "student" LIMIT 1');
        $stmt->execute([$studentUsername]);
    }

    $student = $stmt->fetch();
    if (!$student) {
        json_error('Estudiante no encontrado', 404);
    }

    $historyStmt = $pdo->prepare(
        'SELECT h.id, h.student_id, h.changed_by_user_id, h.actor_role, h.action_type, h.previous_data, h.new_data, h.created_at,
                actor.username AS actor_username, actor.name AS actor_name, actor.role AS actor_current_role
         FROM student_progress_history h
         LEFT JOIN users actor ON actor.id = h.changed_by_user_id
         WHERE h.student_id = ?
         ORDER BY h.created_at DESC, h.id DESC'
    );
    $historyStmt->execute([(int)$student['id']]);
    $rows = $historyStmt->fetchAll();

    $items = [];
    foreach ($rows as $row) {
        $previousData = null;
        if (isset($row['previous_data']) && $row['previous_data'] !== null) {
            $decoded = json_decode((string)$row['previous_data'], true);
            if (is_array($decoded)) {
                $previousData = normalize_student_progress($decoded);
            }
        }

        $newData = null;
        if (isset($row['new_data']) && $row['new_data'] !== null) {
            $decoded = json_decode((string)$row['new_data'], true);
            if (is_array($decoded)) {
                $newData = normalize_student_progress($decoded);
            }
        }

        $items[] = [
            'id' => (int)$row['id'],
            'student_id' => (int)$row['student_id'],
            'action_type' => (string)$row['action_type'],
            'created_at' => (string)$row['created_at'],
            'actor' => [
                'id' => $row['changed_by_user_id'] !== null ? (int)$row['changed_by_user_id'] : null,
                'username' => $row['actor_username'] ?? null,
                'name' => $row['actor_name'] ?? null,
                'role' => $row['actor_role'] ?: ($row['actor_current_role'] ?? null),
            ],
            'previous_data' => $previousData,
            'new_data' => $newData,
        ];
    }

    json_ok([
        'student' => [
            'id' => (int)$student['id'],
            'username' => (string)$student['username'],
            'name' => $student['name'],
            'level' => $student['level'],
            'modality' => $student['modality'],
        ],
        'items' => $items,
    ]);
} catch (Throwable $e) {
    json_error('No se pudo cargar el historial del estudiante', 500, ['details' => $e->getMessage()]);
}