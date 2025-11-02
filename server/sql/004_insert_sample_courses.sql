-- Script para insertar cursos de ejemplo
-- Ejecutar desde el admin de base de datos o phpMyAdmin

INSERT INTO courses (title, description, price, duration, level, modality, is_published, display_order) VALUES
('Inglés', 'Todos los niveles - Método ATIKA personalizado para mejorar tu fluidez en inglés', 150000, '3 meses', 'Todos los niveles', 'Virtual/Presencial', TRUE, 1),
('Francés', 'Nivel A1–C1 - Aprende francés desde cero o perfecciona tu nivel actual', 160000, '3 meses', 'A1-C1', 'Virtual', TRUE, 2),
('Español para extranjeros', 'Cultura + lenguaje - Aprende español con inmersión cultural colombiana', 140000, '2 meses', 'Básico-Avanzado', 'Presencial', TRUE, 3),
('Club Conversacional', 'Práctica guiada - Mejora tu speaking con conversaciones reales', 80000, '1 mes', 'Intermedio-Avanzado', 'Virtual', TRUE, 4),
('ConversArte', 'Arte + idioma - Combina el aprendizaje de idiomas con expresión artística', 120000, '2 meses', 'Todos', 'Presencial', TRUE, 5),
('Tour Cafetero', 'Experiencia inmersiva - Aprende español mientras exploras la región cafetera', 350000, '1 semana', 'Básico-Intermedio', 'Presencial', TRUE, 6),
('Cursos para niños', 'Lúdico y efectivo - Metodología especializada para el aprendizaje infantil', 130000, '3 meses', 'Niños 6-12 años', 'Virtual/Presencial', TRUE, 7),
('Clases personalizadas', '100% a tu medida - Diseñamos el curso perfecto según tus objetivos', 200000, 'Flexible', 'Personalizado', 'Virtual/Presencial', TRUE, 8);
