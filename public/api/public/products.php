<?php
require_once __DIR__ . '/../_bootstrap.php';

header('Content-Type: application/json');

try {
    // Crear la tabla si no existe
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10, 2) NOT NULL,
            image_url VARCHAR(500),
            category VARCHAR(100),
            stock INT DEFAULT 0,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ");
    
    // Solo productos activos para el público
    $stmt = $pdo->query("
        SELECT id, name, description, price, image_url, category, stock
        FROM products 
        WHERE is_active = TRUE 
        ORDER BY category, name
    ");
    
    echo json_encode($stmt->fetchAll());
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
