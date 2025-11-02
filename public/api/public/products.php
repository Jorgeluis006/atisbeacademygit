<?php
require_once __DIR__ . '/../_bootstrap.php';

header('Content-Type: application/json');

try {
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
