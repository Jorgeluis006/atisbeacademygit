<?php
require_once __DIR__ . '/../_bootstrap.php';
requireAdmin();

header('Content-Type: application/json');

// Crear la tabla si no existe
try {
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
} catch (PDOException $e) {
    // Ignorar si la tabla ya existe
    error_log("Error creando tabla products: " . $e->getMessage());
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Listar productos (admin ve todos, incluidos inactivos)
            if (isset($_GET['id'])) {
                $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
                $stmt->execute([$_GET['id']]);
                $product = $stmt->fetch();
                echo json_encode($product ?: ['error' => 'Producto no encontrado']);
            } else {
                $stmt = $pdo->query("SELECT * FROM products ORDER BY created_at DESC");
                echo json_encode($stmt->fetchAll());
            }
            break;

        case 'POST':
            // Crear producto
            $data = json_decode(file_get_contents('php://input'), true);
            
            $stmt = $pdo->prepare("
                INSERT INTO products (name, description, price, image_url, category, stock, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $data['name'],
                $data['description'] ?? '',
                $data['price'],
                $data['image_url'] ?? null,
                $data['category'] ?? 'general',
                $data['stock'] ?? 0,
                $data['is_active'] ?? true
            ]);
            
            echo json_encode([
                'success' => true,
                'id' => $pdo->lastInsertId(),
                'message' => 'Producto creado exitosamente'
            ]);
            break;

        case 'PUT':
            // Actualizar producto
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'ID requerido']);
                exit;
            }
            
            $stmt = $pdo->prepare("
                UPDATE products 
                SET name = ?, description = ?, price = ?, image_url = ?, 
                    category = ?, stock = ?, is_active = ?
                WHERE id = ?
            ");
            
            $stmt->execute([
                $data['name'],
                $data['description'] ?? '',
                $data['price'],
                $data['image_url'] ?? null,
                $data['category'] ?? 'general',
                $data['stock'] ?? 0,
                $data['is_active'] ?? true,
                $data['id']
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Producto actualizado exitosamente'
            ]);
            break;

        case 'DELETE':
            // Eliminar producto
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'ID requerido']);
                exit;
            }
            
            $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
            $stmt->execute([$data['id']]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Producto eliminado exitosamente'
            ]);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método no permitido']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
