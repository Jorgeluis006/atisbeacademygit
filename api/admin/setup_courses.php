<?php
/**
 * Script de inicialización para crear cursos de ejemplo
 * Ejecutar una vez para poblar la tabla de cursos
 */

require_once __DIR__ . '/../_bootstrap.php';
require_admin();
ensure_cms_schema();

$pdo = get_pdo();

try {
    // Verificar si ya hay cursos
    $stmt = $pdo->query("SELECT COUNT(*) FROM courses");
    $count = $stmt->fetchColumn();
    
    // Si no hay cursos, insertar los de ejemplo
    if ($count == 0) {
        $pdo->exec("
            INSERT INTO courses (title, description, price, duration, level, modality, is_published, display_order) VALUES
            ('Inglés', 'Todos los niveles - Método ATIKA personalizado para mejorar tu fluidez en inglés', 150000, '3 meses', 'Todos los niveles', 'Virtual/Presencial', TRUE, 1),
            ('Francés', 'Nivel A1–C1 - Aprende francés desde cero o perfecciona tu nivel actual', 160000, '3 meses', 'A1-C1', 'Virtual', TRUE, 2),
            ('Español para extranjeros', 'Cultura + lenguaje - Aprende español con inmersión cultural colombiana', 140000, '2 meses', 'Básico-Avanzado', 'Presencial', TRUE, 3),
            ('Club Conversacional', 'Práctica guiada - Mejora tu speaking con conversaciones reales', 80000, '1 mes', 'Intermedio-Avanzado', 'Virtual', TRUE, 4),
            ('ConversArte', 'Arte + idioma - Combina el aprendizaje de idiomas con expresión artística', 120000, '2 meses', 'Todos', 'Presencial', TRUE, 5),
            ('Tour Cafetero', 'Experiencia inmersiva - Aprende español mientras exploras la región cafetera', 350000, '1 semana', 'Básico-Intermedio', 'Presencial', TRUE, 6),
            ('Cursos para niños', 'Lúdico y efectivo - Metodología especializada para el aprendizaje infantil', 130000, '3 meses', 'Niños 6-12 años', 'Virtual/Presencial', TRUE, 7),
            ('Clases personalizadas', '100% a tu medida - Diseñamos el curso perfecto según tus objetivos', 200000, 'Flexible', 'Personalizado', 'Virtual/Presencial', TRUE, 8),
            ('General', 'Curso general de idiomas', 100000, 'Flexible', 'Todos', 'Virtual/Presencial', TRUE, 9)
        ");
        
        json_ok([
            'message' => 'Cursos de ejemplo insertados exitosamente',
            'courses_count' => 9
        ]);
    } else {
        json_ok([
            'message' => 'Ya existen cursos en la base de datos',
            'courses_count' => $count
        ]);
    }
    
} catch (Exception $e) {
    json_error('Error al inicializar cursos: ' . $e->getMessage(), 500);
}
