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
    $sql = "CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(80) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(150) DEFAULT NULL,
        role VARCHAR(50) DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
    get_pdo()->exec($sql);
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
}
