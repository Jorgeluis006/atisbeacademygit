<?php
/**
 * Script de migración para crear la tabla de productos
 * Ejecutar una vez para inicializar la tabla
 */

require_once __DIR__ . '/../_bootstrap.php';
requireAdmin();

header('Content-Type: application/json');

try {
    // Crear la tabla de productos
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10, 2) NOT NULL,
            image_url VARCHAR(500),
            category VARCHAR(100),
            stock INT DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ");
    
    // Verificar si ya hay productos
    $stmt = $pdo->query("SELECT COUNT(*) FROM products");
    $count = $stmt->fetchColumn();
    
    // Si no hay productos, insertar los de ejemplo
    if ($count == 0) {
        $pdo->exec("
            INSERT INTO products (name, description, price, category, stock, is_active) VALUES
            ('Curso pregrabado: Inglés', 'Curso completo de inglés con videos pregrabados y material descargable', 299.99, 'curso', 100, TRUE),
            ('Curso pregrabado: Francés', 'Aprende francés desde cero con nuestro curso pregrabado', 299.99, 'curso', 100, TRUE),
            ('Libro/PDF Gramática', 'Guía completa de gramática en formato PDF descargable', 99.99, 'material', 999, TRUE),
            ('Club de lectura', 'Acceso mensual al club de lectura con sesiones en vivo', 149.99, 'club', 50, TRUE),
            ('Taller temático', 'Talleres especializados en temas específicos del idioma', 199.99, 'taller', 30, TRUE)
        ");
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Tabla de productos configurada exitosamente',
        'products_count' => $pdo->query("SELECT COUNT(*) FROM products")->fetchColumn()
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
