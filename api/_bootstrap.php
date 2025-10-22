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
            $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
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
    get_pdo()->exec($sql);
}
