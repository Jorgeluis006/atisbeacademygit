<?php
require_once __DIR__ . '/../_bootstrap.php';
require_admin();

ensure_users_schema();
ensure_teacher_fields();
ensure_student_progress_schema();

$pdo = get_pdo();

try {
    $sql = "SELECT u.id, u.username, u.name, u.level, u.modality, u.teacher_id, sp.data AS progress_data
            FROM users u
            LEFT JOIN student_progress sp ON sp.user_id = u.id
            WHERE u.role = 'student'
            ORDER BY (u.name IS NULL), u.name ASC, u.username ASC";
    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll();

    $items = [];
    foreach ($rows as $r) {
        $data = null;
        if (isset($r['progress_data']) && $r['progress_data'] !== null) {
            $data = json_decode((string)$r['progress_data'], true);
        }
        if (!is_array($data)) {
            $data = [
                'asistencia' => 0,
                'notas' => [],
                'nivel' => [ 'mcer' => '', 'descripcion' => '' ],
                'fortalezas' => [],
                'debilidades' => [],
            ];
        }

        // Lookup teacher info if available
        $teacher = null;
        if (!empty($r['teacher_id'])) {
            $tStmt = $pdo->prepare('SELECT id, username, name FROM users WHERE id = ?');
            $tStmt->execute([(int)$r['teacher_id']]);
            $t = $tStmt->fetch();
            if ($t) { $teacher = [ 'id' => (int)$t['id'], 'username' => $t['username'], 'name' => $t['name'] ]; }
        }

        $items[] = [
            'id' => (int)$r['id'],
            'username' => $r['username'],
            'name' => $r['name'],
            'level' => $r['level'],
            'modality' => $r['modality'],
            'teacher' => $teacher,
            'progreso' => $data,
        ];
    }

    json_ok(['items' => $items]);
} catch (Throwable $e) {
    json_error('Error obteniendo progreso de estudiantes', 500, ['details' => $e->getMessage()]);
}
