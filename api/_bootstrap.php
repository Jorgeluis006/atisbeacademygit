<?php
header('Content-Type: application/json; charset=utf-8');

// Sesiones para autenticación
if (session_status() === PHP_SESSION_NONE) {
    // Cookies seguras si está en HTTPS
    if (!headers_sent()) {
        @session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'domain' => '',
            'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    }
    @session_start();
}

require_once __DIR__ . '/config.php';

if (ALLOW_ORIGIN !== '') {
    header('Access-Control-Allow-Origin: ' . ALLOW_ORIGIN);
    header('Vary: Origin');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function json_error($message, $code = 400, $extra = []) {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $message, ...$extra], JSON_UNESCAPED_UNICODE);
    exit;
}

function json_ok($data = []) {
    echo json_encode(['ok' => true, ...$data], JSON_UNESCAPED_UNICODE);
    exit;
}

function get_pdo() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $portPart = (defined('DB_PORT') && DB_PORT) ? (';port=' . DB_PORT) : '';
            $dsn = 'mysql:host=' . DB_HOST . $portPart . ';dbname=' . DB_NAME . ';charset=utf8mb4';
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        } catch (Throwable $e) {
            json_error('Error de conexión a la base de datos', 500, ['details' => $e->getMessage()]);
        }
    }
    return $pdo;
}

function ensure_schema() {
    $sql = "CREATE TABLE IF NOT EXISTS contacts (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(150) NOT NULL,
        edad VARCHAR(10) NOT NULL,
        nacionalidad VARCHAR(120) NOT NULL,
        email VARCHAR(180) NOT NULL,
        telefono VARCHAR(60) NOT NULL,
        idioma VARCHAR(120) NOT NULL,
        modalidad VARCHAR(60) NOT NULL,
        franja VARCHAR(120) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    get_pdo()->exec($sql);
}

function ensure_users_schema() {
    $pdo = get_pdo();
    $sql = "CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(80) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(150) DEFAULT NULL,
        role VARCHAR(50) DEFAULT 'student',
        email VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY idx_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    $pdo->exec($sql);
    
    // Agregar email si la tabla ya existe pero no tiene el campo
    try {
        $columns = $pdo->query("SHOW COLUMNS FROM users LIKE 'email'")->fetchAll();
        if (empty($columns)) {
            $pdo->exec("ALTER TABLE users ADD COLUMN email VARCHAR(255) DEFAULT NULL");
            $pdo->exec("ALTER TABLE users ADD UNIQUE INDEX idx_email (email)");
        }
    } catch (Throwable $e) {
        // Ignorar si ya existe
    }
}

function seed_demo_user_if_empty() {
    if (defined('DISABLE_DEMO_SEED') && DISABLE_DEMO_SEED === true) {
        return;
    }
    $pdo = get_pdo();
    $count = (int)$pdo->query('SELECT COUNT(*) AS c FROM users')->fetchColumn();
    if ($count === 0) {
        $stmt = $pdo->prepare('INSERT INTO users (username, password_hash, name, role) VALUES (?,?,?,?)');
        $stmt->execute(['demo', password_hash('demo123', PASSWORD_BCRYPT), 'Usuario Demo', 'admin']);
    }
}

function require_auth() {
    if (!isset($_SESSION['user_id'])) {
        json_error('No autenticado', 401);
    }
}

function ensure_schedule_schema() {
    $pdo = get_pdo();
    
    // Tabla de slots/horarios disponibles creados por profesores
    $sql = "CREATE TABLE IF NOT EXISTS teacher_slots (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        teacher_id INT UNSIGNED NOT NULL,
        datetime DATETIME NOT NULL,
        tipo VARCHAR(40) DEFAULT 'clase',
        modalidad VARCHAR(40) DEFAULT 'virtual',
        duration_minutes INT DEFAULT 60,
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (teacher_id),
        INDEX (datetime),
        CONSTRAINT fk_slot_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    $pdo->exec($sql);
    
    // Tabla de reservas de estudiantes
    $sql = "CREATE TABLE IF NOT EXISTS schedule_reservations (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        datetime DATETIME NOT NULL,
        tipo VARCHAR(40) DEFAULT 'clase',
        modalidad VARCHAR(40) DEFAULT 'virtual',
        notas VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (user_id),
        INDEX (datetime),
        CONSTRAINT fk_res_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    $pdo->exec($sql);
    
    // Agregar teacher_id a reservations si no existe
    try { 
        $pdo->exec("ALTER TABLE schedule_reservations ADD COLUMN teacher_id INT UNSIGNED NULL AFTER user_id"); 
    } catch (Throwable $e) {}
    try { 
        $pdo->exec("CREATE INDEX idx_res_teacher ON schedule_reservations(teacher_id)"); 
    } catch (Throwable $e) {}
    
    // Agregar slot_id para referenciar el slot reservado
    try { 
        $pdo->exec("ALTER TABLE schedule_reservations ADD COLUMN slot_id INT UNSIGNED NULL AFTER teacher_id"); 
    } catch (Throwable $e) {}
    try { 
        $pdo->exec("CREATE INDEX idx_res_slot ON schedule_reservations(slot_id)"); 
    } catch (Throwable $e) {}
    
    // Agregar campos de curso y nivel a teacher_slots
    try { 
        $pdo->exec("ALTER TABLE teacher_slots ADD COLUMN curso VARCHAR(100) DEFAULT 'Inglés' AFTER duration_minutes"); 
    } catch (Throwable $e) {}
    try { 
        $pdo->exec("ALTER TABLE teacher_slots ADD COLUMN nivel VARCHAR(10) DEFAULT NULL AFTER curso"); 
    } catch (Throwable $e) {}
    
    // Agregar campo meeting_link para Zoom/Teams
    try {
        $columns = $pdo->query("SHOW COLUMNS FROM teacher_slots LIKE 'meeting_link'")->fetchAll();
        if (empty($columns)) {
            $pdo->exec("ALTER TABLE teacher_slots ADD COLUMN meeting_link VARCHAR(500) DEFAULT NULL AFTER nivel");
        }
    } catch (Throwable $e) {}
    
    // Agregar campos de curso y nivel a schedule_reservations
    try { 
        $pdo->exec("ALTER TABLE schedule_reservations ADD COLUMN curso VARCHAR(100) DEFAULT NULL AFTER modalidad"); 
    } catch (Throwable $e) {}
    try { 
        $pdo->exec("ALTER TABLE schedule_reservations ADD COLUMN nivel VARCHAR(10) DEFAULT NULL AFTER curso"); 
    } catch (Throwable $e) {}

    // Columna para rastrear cuándo se envió el recordatorio (evitar duplicados)
    try {
        $columns = $pdo->query("SHOW COLUMNS FROM schedule_reservations LIKE 'reminder_sent_at'")->fetchAll();
        if (empty($columns)) {
            $pdo->exec("ALTER TABLE schedule_reservations ADD COLUMN reminder_sent_at DATETIME NULL AFTER created_at");
            $pdo->exec("CREATE INDEX idx_res_reminder ON schedule_reservations(reminder_sent_at)");
        }
    } catch (Throwable $e) {}

    // Nuevas columnas para recordatorios múltiples (30, 5 y 1 minuto)
    try {
        $cols = $pdo->query("SHOW COLUMNS FROM schedule_reservations LIKE 'reminder_30_sent_at'")->fetchAll();
        if (empty($cols)) {
            $pdo->exec("ALTER TABLE schedule_reservations ADD COLUMN reminder_30_sent_at DATETIME NULL AFTER reminder_sent_at");
            $pdo->exec("CREATE INDEX idx_res_reminder30 ON schedule_reservations(reminder_30_sent_at)");
        }
    } catch (Throwable $e) {}
    try {
        $cols = $pdo->query("SHOW COLUMNS FROM schedule_reservations LIKE 'reminder_5_sent_at'")->fetchAll();
        if (empty($cols)) {
            $pdo->exec("ALTER TABLE schedule_reservations ADD COLUMN reminder_5_sent_at DATETIME NULL AFTER reminder_30_sent_at");
            $pdo->exec("CREATE INDEX idx_res_reminder5 ON schedule_reservations(reminder_5_sent_at)");
        }
    } catch (Throwable $e) {}
    try {
        $cols = $pdo->query("SHOW COLUMNS FROM schedule_reservations LIKE 'reminder_1_sent_at'")->fetchAll();
        if (empty($cols)) {
            $pdo->exec("ALTER TABLE schedule_reservations ADD COLUMN reminder_1_sent_at DATETIME NULL AFTER reminder_5_sent_at");
            $pdo->exec("CREATE INDEX idx_res_reminder1 ON schedule_reservations(reminder_1_sent_at)");
        }
    } catch (Throwable $e) {}

    // Tabla para configuraciones de reservas (días permitidos)
    try {
        $sql = "CREATE TABLE IF NOT EXISTS booking_settings (
            id INT UNSIGNED PRIMARY KEY,
            allowed_days JSON DEFAULT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
        $pdo->exec($sql);
        // Insertar fila por defecto si no existe
        $exists = $pdo->query("SELECT COUNT(*) FROM booking_settings")->fetchColumn();
        if ((int)$exists === 0) {
            $pdo->exec("INSERT INTO booking_settings (id, allowed_days) VALUES (1, NULL)");
        }
    } catch (Throwable $e) {}
}

function require_admin() {
    require_auth();
    $role = isset($_SESSION['role']) ? (string)$_SESSION['role'] : '';
    if ($role !== 'admin') {
        json_error('No autorizado', 403);
    }
}

// Extiende la tabla users con campos para profesores/estudiantes si faltan
function ensure_teacher_fields() {
    $pdo = get_pdo();
    try { $pdo->exec("ALTER TABLE users ADD COLUMN level VARCHAR(10) NULL"); } catch (Throwable $e) {}
    try { $pdo->exec("ALTER TABLE users ADD COLUMN modality VARCHAR(20) NULL"); } catch (Throwable $e) {}
    try { $pdo->exec("ALTER TABLE users ADD COLUMN teacher_id INT UNSIGNED NULL"); } catch (Throwable $e) {}
    try { $pdo->exec("CREATE INDEX IF NOT EXISTS idx_users_teacher ON users(teacher_id)"); } catch (Throwable $e) { try { $pdo->exec("CREATE INDEX idx_users_teacher ON users(teacher_id)"); } catch (Throwable $e2) {} }
    // Agregar columnas para configuraciones de reserva por profesor (permitir bloqueos)
    try { $pdo->exec("ALTER TABLE users ADD COLUMN booking_allowed_days JSON DEFAULT NULL AFTER modality"); } catch (Throwable $e) {}
}

// Tabla para progreso de estudiante editable por profesores
function ensure_student_progress_schema() {
    $sql = "CREATE TABLE IF NOT EXISTS student_progress (
        user_id INT UNSIGNED PRIMARY KEY,
        data JSON NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    get_pdo()->exec($sql);
}

// Tablas para CMS: testimonios, cursos, blog
function ensure_cms_schema() {
    $pdo = get_pdo();
    
    // Tabla de testimonios
    $sql = "CREATE TABLE IF NOT EXISTS testimonials (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        author_name VARCHAR(150) NOT NULL,
        author_role VARCHAR(100) DEFAULT NULL,
        content TEXT NOT NULL,
        rating INT DEFAULT 5,
        image_url VARCHAR(255) DEFAULT NULL,
        is_published BOOLEAN DEFAULT TRUE,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (is_published),
        INDEX (display_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    $pdo->exec($sql);
    
    // Tabla de cursos
    $sql = "CREATE TABLE IF NOT EXISTS courses (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10,2) DEFAULT NULL,
        duration VARCHAR(100) DEFAULT NULL,
        level VARCHAR(50) DEFAULT NULL,
        modality VARCHAR(50) DEFAULT 'virtual',
        course_type VARCHAR(100) DEFAULT 'general',
        image_url VARCHAR(255) DEFAULT NULL,
        syllabus TEXT DEFAULT NULL,
        is_published BOOLEAN DEFAULT TRUE,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (is_published),
        INDEX (display_order),
        INDEX (course_type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    $pdo->exec($sql);
    
    // Agregar columna course_type si no existe (para tablas existentes)
    try {
        $stmt = $pdo->query("SHOW COLUMNS FROM courses LIKE 'course_type'");
        if (!$stmt->fetch()) {
            $pdo->exec("ALTER TABLE courses ADD COLUMN course_type VARCHAR(100) DEFAULT 'general' AFTER modality");
            $pdo->exec("ALTER TABLE courses ADD INDEX idx_course_type (course_type)");
        }
    } catch (Exception $e) {
        // Ignorar errores si la columna ya existe o hay otro problema
    }
    
    // Tabla de posts de blog
    $sql = "CREATE TABLE IF NOT EXISTS blog_posts (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        slug VARCHAR(220) UNIQUE NOT NULL,
        excerpt TEXT DEFAULT NULL,
        content TEXT NOT NULL,
        author_id INT UNSIGNED DEFAULT NULL,
        image_url VARCHAR(255) DEFAULT NULL,
        category VARCHAR(100) DEFAULT NULL,
        tags TEXT DEFAULT NULL,
        is_published BOOLEAN DEFAULT TRUE,
        published_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (slug),
        INDEX (is_published),
        INDEX (category),
        CONSTRAINT fk_blog_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    $pdo->exec($sql);
    
    // Tabla de videos de testimonios
    $sql = "CREATE TABLE IF NOT EXISTS testimonial_videos (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) DEFAULT NULL,
        video_url VARCHAR(255) NOT NULL,
        thumbnail_url VARCHAR(255) DEFAULT NULL,
        is_published BOOLEAN DEFAULT TRUE,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (is_published),
        INDEX (display_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    $pdo->exec($sql);

    // Tabla de modalidades por curso (cards adicionales por curso)
    $sql = "CREATE TABLE IF NOT EXISTS course_modalities (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        course_id INT UNSIGNED NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT DEFAULT NULL,
        image_url VARCHAR(255) DEFAULT NULL,
        is_published BOOLEAN DEFAULT TRUE,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (course_id),
        INDEX (is_published),
        INDEX (display_order),
        CONSTRAINT fk_course_modalities_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    $pdo->exec($sql);
    
    // Tabla de productos
    $sql = "CREATE TABLE IF NOT EXISTS products (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        image_url VARCHAR(500),
        category VARCHAR(100) DEFAULT 'general',
        stock INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX (is_active),
        INDEX (category)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    $pdo->exec($sql);
    
    // Insertar cursos de ejemplo si la tabla está vacía
    try {
        $stmt = $pdo->query("SELECT COUNT(*) FROM courses");
        $count = $stmt->fetchColumn();
        
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
        }
    } catch (Exception $e) {
        // Ignorar errores si los cursos ya existen
    }
}
