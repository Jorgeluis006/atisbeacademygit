<?php
require_once __DIR__ . '/../_bootstrap.php';
require_admin();
ensure_cms_schema();

$pdo = get_pdo();

// GET: Listar todos los productos
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id'])) {
        $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        $product = $stmt->fetch();
        json_ok(['item' => $product]);
    } else {
        $stmt = $pdo->query("SELECT * FROM products ORDER BY created_at DESC");
        $items = $stmt->fetchAll();
        json_ok(['items' => $items]);
    }
}

// POST: Crear nuevo producto
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $name = trim($input['name'] ?? '');
    $description = trim($input['description'] ?? '');
    $price = isset($input['price']) ? (float)$input['price'] : 0;
    $image_url = trim($input['image_url'] ?? '');
    $category = trim($input['category'] ?? 'general');
    $stock = (int)($input['stock'] ?? 0);
    $is_active = isset($input['is_active']) ? (bool)$input['is_active'] : true;
    
    if (!$name || $price <= 0) {
        json_error('Nombre y precio son requeridos');
    }
    
    $stmt = $pdo->prepare("
        INSERT INTO products (name, description, price, image_url, category, stock, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$name, $description, $price, $image_url, $category, $stock, $is_active]);
    
    json_ok(['id' => (int)$pdo->lastInsertId()]);
}

// PUT: Actualizar producto
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $id = (int)($input['id'] ?? 0);
    if (!$id) {
        json_error('ID requerido');
    }
    
    $name = trim($input['name'] ?? '');
    $description = trim($input['description'] ?? '');
    $price = isset($input['price']) ? (float)$input['price'] : 0;
    $image_url = trim($input['image_url'] ?? '');
    $category = trim($input['category'] ?? 'general');
    $stock = (int)($input['stock'] ?? 0);
    $is_active = isset($input['is_active']) ? (bool)$input['is_active'] : true;
    
    if (!$name || $price <= 0) {
        json_error('Nombre y precio son requeridos');
    }
    
    $stmt = $pdo->prepare("
        UPDATE products 
        SET name = ?, description = ?, price = ?, image_url = ?, 
            category = ?, stock = ?, is_active = ?
        WHERE id = ?
    ");
    $stmt->execute([$name, $description, $price, $image_url, $category, $stock, $is_active, $id]);
    
    json_ok(['message' => 'Producto actualizado']);
}

// DELETE: Eliminar producto
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $id = (int)($input['id'] ?? 0);
    if (!$id) {
        json_error('ID requerido');
    }
    
    $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$id]);
    
    json_ok(['message' => 'Producto eliminado']);
}
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método no permitido']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
