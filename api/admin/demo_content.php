<?php
require_once __DIR__ . '/../_bootstrap.php';
require_admin();
ensure_cms_schema();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_error('Método no permitido', 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$action = is_array($input) ? ($input['action'] ?? '') : '';
if (!in_array($action, ['seed', 'remove'], true)) {
    json_error('Acción no válida', 400);
}

$pdo = get_pdo();
$tables = [
    'courses' => 'title',
    'blog_posts' => 'title',
    'testimonials' => 'author_name',
    'testimonial_videos' => 'title',
    'exams' => 'title',
    'corporativo_items' => 'title',
    'products' => 'name',
];

try {
    $pdo->beginTransaction();

    if ($action === 'remove') {
        $removed = [];
        foreach ($tables as $table => $column) {
            $stmt = $pdo->prepare("DELETE FROM {$table} WHERE {$column} LIKE '[MUESTRA] %'");
            $stmt->execute();
            $removed[$table] = $stmt->rowCount();
        }
        $pdo->commit();
        json_ok(['action' => 'remove', 'removed' => $removed, 'message' => 'Se retiraron únicamente los registros identificados como MUESTRA.']);
    }

    $added = array_fill_keys(array_keys($tables), 0);

    $courses = [
        ['[MUESTRA] Inglés para la vida diaria', 'Ejemplo visual de un curso de idiomas. Reemplaza esta descripción y sus datos antes de usarla como oferta real.', '8 semanas · Ejemplo', 'A1–B1 · Ejemplo', '/images/muestras/curso.svg', 'cursos-idiomas'],
        ['[MUESTRA] Francés desde cero', 'Contenido demostrativo para mostrar cómo se presenta una ruta de aprendizaje de idiomas.', '10 semanas · Ejemplo', 'Inicial · Ejemplo', '/images/muestras/curso.svg', 'cursos-idiomas'],
        ['[MUESTRA] Conversación y fluidez', 'Tarjeta de muestra para visualizar una experiencia de práctica oral; no corresponde a una oferta real.', '6 semanas · Ejemplo', 'Intermedio · Ejemplo', '/images/muestras/experiencia.svg', 'conversarte'],
    ];
    foreach ($courses as $index => [$title, $description, $duration, $level, $image, $type]) {
        $stmt = $pdo->prepare('SELECT id FROM courses WHERE title = ? LIMIT 1');
        $stmt->execute([$title]);
        $courseId = $stmt->fetchColumn();
        if (!$courseId) {
            $stmt = $pdo->prepare('INSERT INTO courses (title, description, duration, level, modality, course_type, image_url, syllabus, is_published, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?)');
            $stmt->execute([$title, $description, $duration, $level, 'Virtual', $type, $image, 'Contenido de muestra. Sustituir por el programa definitivo.', 900 + $index]);
            $courseId = (int)$pdo->lastInsertId();
            $added['courses']++;
        }
        $modalityTitle = '[MUESTRA] Modalidad virtual';
        $stmt = $pdo->prepare('SELECT id FROM course_modalities WHERE course_id = ? AND title = ? LIMIT 1');
        $stmt->execute([$courseId, $modalityTitle]);
        if (!$stmt->fetchColumn()) {
            $stmt = $pdo->prepare('INSERT INTO course_modalities (course_id, title, description, image_url, is_published, display_order) VALUES (?, ?, ?, ?, TRUE, ?)');
            $stmt->execute([$courseId, $modalityTitle, 'Opción de demostración. Reemplaza esta información desde Admin.', $image, 900 + $index]);
        }
    }

    $posts = [
        ['[MUESTRA] Cómo crear una rutina de estudio', 'muestra-rutina-estudio', 'Una guía de ejemplo para organizar sesiones breves de aprendizaje.', 'Este artículo es contenido de demostración. Puedes reemplazarlo desde Admin antes de publicar información definitiva. Una rutina puede dividirse en objetivos pequeños: repasar vocabulario, escuchar un audio y practicar una frase. Ajusta la frecuencia y los recursos a las metas de cada estudiante.', 'Aprendizaje', 'rutina,demostración', '/images/muestras/blog.svg'],
        ['[MUESTRA] Aprender idiomas con constancia', 'muestra-constancia-idiomas', 'Ideas ilustrativas para practicar un idioma en el día a día.', 'Contenido de muestra: no es una recomendación académica institucional. Para hacer más visible el progreso, puedes alternar lectura, escucha y conversación, y anotar qué temas deseas practicar después.', 'Aprendizaje', 'idiomas,demostración', '/images/muestras/blog.svg'],
        ['[MUESTRA] Preparar una meta de aprendizaje', 'muestra-meta-aprendizaje', 'Ejemplo de una publicación para la sección de novedades.', 'Este texto es demostrativo y debe sustituirse por información revisada. Una meta concreta puede ayudar a seleccionar materiales y actividades adecuados para cada persona.', 'Novedades', 'metas,demostración', '/images/muestras/experiencia.svg'],
    ];
    foreach ($posts as $index => [$title, $slug, $excerpt, $content, $category, $tags, $image]) {
        $stmt = $pdo->prepare('SELECT id FROM blog_posts WHERE slug = ? LIMIT 1');
        $stmt->execute([$slug]);
        if (!$stmt->fetchColumn()) {
            $stmt = $pdo->prepare('INSERT INTO blog_posts (title, slug, excerpt, content, author_id, image_url, category, tags, is_published, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE, NOW())');
            $stmt->execute([$title, $slug, $excerpt, $content, (int)($_SESSION['user_id'] ?? 0) ?: null, $image, $category, $tags]);
            $added['blog_posts']++;
        }
    }

    $testimonials = [
        ['[MUESTRA] Estudiante 01', 'Perfil ficticio · contenido de demostración', 'Este comentario es ficticio y se incluye solo para mostrar el diseño. No corresponde a una reseña ni a una experiencia real.', '/images/muestras/avatar.svg'],
        ['[MUESTRA] Estudiante 02', 'Perfil ficticio · contenido de demostración', 'Testimonio de ejemplo, no real. Sustitúyelo por una opinión autorizada antes de utilizar esta sección como referencia pública.', '/images/muestras/avatar.svg'],
        ['[MUESTRA] Estudiante 03', 'Perfil ficticio · contenido de demostración', 'Texto ilustrativo para previsualizar la tarjeta. No representa a una persona ni a un resultado comprobado.', '/images/muestras/avatar.svg'],
    ];
    foreach ($testimonials as $index => [$name, $role, $content, $image]) {
        $stmt = $pdo->prepare('SELECT id FROM testimonials WHERE author_name = ? LIMIT 1');
        $stmt->execute([$name]);
        if (!$stmt->fetchColumn()) {
            $stmt = $pdo->prepare('INSERT INTO testimonials (author_name, author_role, content, rating, image_url, is_published, display_order) VALUES (?, ?, ?, 0, ?, TRUE, ?)');
            $stmt->execute([$name, $role, $content, $image, 900 + $index]);
            $added['testimonials']++;
        }
    }

    $videos = [
        ['[MUESTRA] Vista previa: experiencia de aprendizaje', '/images/muestras/video.svg'],
        ['[MUESTRA] Vista previa: práctica de idiomas', '/images/muestras/video.svg'],
        ['[MUESTRA] Vista previa: espacio para testimonio', '/images/muestras/video.svg'],
    ];
    foreach ($videos as $index => [$title, $preview]) {
        $stmt = $pdo->prepare('SELECT id FROM testimonial_videos WHERE title = ? LIMIT 1');
        $stmt->execute([$title]);
        if (!$stmt->fetchColumn()) {
            $stmt = $pdo->prepare('INSERT INTO testimonial_videos (title, video_url, thumbnail_url, is_published, display_order) VALUES (?, ?, ?, TRUE, ?)');
            $stmt->execute([$title, $preview, $preview, 900 + $index]);
            $added['testimonial_videos']++;
        }
    }

    $exams = [
        ['[MUESTRA] Preparación de inglés', 'muestra-preparacion-ingles', 'Tarjeta de demostración para presentar una ruta de preparación de idiomas.', 'Contenido visual de muestra. Sustituye la descripción y el detalle por información revisada antes de publicar.', '/images/muestras/examen.svg'],
        ['[MUESTRA] Práctica de comprensión', 'muestra-comprension', 'Ejemplo de una preparación enfocada en lectura y escucha.', 'Contenido demostrativo; no describe un examen oficial ni garantiza resultados.', '/images/muestras/examen.svg'],
        ['[MUESTRA] Evaluación de nivel', 'muestra-evaluacion-nivel', 'Vista previa para organizar los servicios de preparación.', 'Esta ficha es solo un ejemplo para el diseño. Agrega aquí información verificada del servicio real.', '/images/muestras/examen.svg'],
    ];
    foreach ($exams as $index => [$title, $slug, $description, $detail, $image]) {
        $stmt = $pdo->prepare('SELECT id FROM exams WHERE slug = ? LIMIT 1');
        $stmt->execute([$slug]);
        if (!$stmt->fetchColumn()) {
            $stmt = $pdo->prepare('INSERT INTO exams (title, slug, description, detail_description, image_url, is_published, display_order) VALUES (?, ?, ?, ?, ?, TRUE, ?)');
            $stmt->execute([$title, $slug, $description, $detail, $image, 900 + $index]);
            $added['exams']++;
        }
    }

    $corporate = [
        ['[MUESTRA] Formación para equipos', 'muestra-formacion-equipos', 'Ejemplo visual de un programa corporativo. Contenido de demostración que debe reemplazarse antes de presentar una oferta real.', '/images/muestras/corporativo.svg'],
        ['[MUESTRA] Idiomas para organizaciones', 'muestra-idiomas-organizaciones', 'Ficha ilustrativa para mostrar cómo se puede presentar una solución para organizaciones.', '/images/muestras/corporativo.svg'],
        ['[MUESTRA] Plan de aprendizaje empresarial', 'muestra-plan-empresarial', 'Tarjeta de muestra; no representa condiciones comerciales ni un servicio confirmado.', '/images/muestras/experiencia.svg'],
    ];
    foreach ($corporate as $index => [$title, $slug, $description, $image]) {
        $stmt = $pdo->prepare('SELECT id FROM corporativo_items WHERE slug = ? LIMIT 1');
        $stmt->execute([$slug]);
        if (!$stmt->fetchColumn()) {
            $stmt = $pdo->prepare('INSERT INTO corporativo_items (title, slug, description, image_url, default_modality, is_published, display_order) VALUES (?, ?, ?, ?, ?, TRUE, ?)');
            $stmt->execute([$title, $slug, $description, $image, 'Virtual · Ejemplo', 900 + $index]);
            $added['corporativo_items']++;
        }
    }

    $products = [
        ['[MUESTRA] Cuaderno de vocabulario', 'Producto visual de demostración. Sin inventario y no disponible para compra.', 0, '/images/muestras/producto.svg', 'material'],
        ['[MUESTRA] Guía de estudio', 'Ficha de tienda de ejemplo. Sin inventario y no disponible para compra.', 0, '/images/muestras/producto.svg', 'material'],
        ['[MUESTRA] Kit de aprendizaje', 'Producto ilustrativo para previsualizar la tienda. Sin inventario y no disponible para compra.', 0, '/images/muestras/producto.svg', 'general'],
    ];
    foreach ($products as $index => [$name, $description, $price, $image, $category]) {
        $stmt = $pdo->prepare('SELECT id FROM products WHERE name = ? LIMIT 1');
        $stmt->execute([$name]);
        if (!$stmt->fetchColumn()) {
            $stmt = $pdo->prepare('INSERT INTO products (name, description, price, image_url, category, stock, is_active) VALUES (?, ?, ?, ?, ?, 0, TRUE)');
            $stmt->execute([$name, $description, $price, $image, $category]);
            $added['products']++;
        }
    }

    $pdo->commit();
    json_ok(['action' => 'seed', 'added' => $added, 'message' => 'Contenido de muestra listo. Las entradas nuevas quedaron publicadas y se pueden retirar desde Admin.']);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('No se pudo gestionar el contenido de muestra: ' . $e->getMessage());
    json_error('No se pudo completar la operación de contenido de muestra', 500);
}
