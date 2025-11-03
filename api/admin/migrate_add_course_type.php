<?php
require_once __DIR__ . '/../_bootstrap.php';
require_admin();

$pdo = get_pdo();

try {
    // Verificar si la columna ya existe
    $stmt = $pdo->query("SHOW COLUMNS FROM courses LIKE 'course_type'");
    $exists = $stmt->fetch();
    
    if (!$exists) {
        // Agregar la columna si no existe
        $pdo->exec("ALTER TABLE courses ADD COLUMN course_type VARCHAR(100) DEFAULT 'general' AFTER modality");
        $pdo->exec("ALTER TABLE courses ADD INDEX idx_course_type (course_type)");
        json_ok(['message' => 'Columna course_type agregada exitosamente']);
    } else {
        json_ok(['message' => 'La columna course_type ya existe']);
    }
} catch (PDOException $e) {
    json_error('Error al agregar columna: ' . $e->getMessage(), 500);
}
