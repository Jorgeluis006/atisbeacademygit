<?php
require_once __DIR__ . '/../_bootstrap.php';
ensure_cms_schema();

$pdo = get_pdo();

try {
    // Solo productos activos para el público
    $stmt = $pdo->query("
        SELECT id, name, description, price, image_url, category, stock
        FROM products 
        WHERE is_active = TRUE 
        ORDER BY category, name
    ");
    
    json_ok(['items' => $stmt->fetchAll()]);
} catch (PDOException $e) {
    json_error($e->getMessage(), 500);
}
