<?php
/**
 * Endpoint para subir imágenes
 * Límite: 20MB por archivo
 * Tipos permitidos: JPG, PNG, GIF, WEBP
 * Nota: Si necesitas subir archivos más grandes, ajusta también:
 * - upload_max_filesize en .htaccess o php.ini
 * - post_max_size en .htaccess o php.ini
 */
require_once __DIR__ . '/_bootstrap.php';
require_auth();
require_admin();

header('Content-Type: application/json');

// Verificar que se subió un archivo
if (!isset($_FILES['image'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No se recibió ningún archivo']);
    exit;
}

// Manejar errores de PHP
if ($_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $error_message = 'Error al subir el archivo';
    switch ($_FILES['image']['error']) {
        case UPLOAD_ERR_INI_SIZE:
        case UPLOAD_ERR_FORM_SIZE:
            $error_message = 'El archivo es demasiado grande. Verifica la configuración del servidor (upload_max_filesize y post_max_size en PHP)';
            break;
        case UPLOAD_ERR_NO_FILE:
            $error_message = 'No se seleccionó ningún archivo';
            break;
    }
    http_response_code(400);
    echo json_encode(['error' => $error_message]);
    exit;
}

$file = $_FILES['image'];
$allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$max_size = 20 * 1024 * 1024; // 20MB

// Validar tipo de archivo
if (!in_array($file['type'], $allowed_types)) {
    http_response_code(400);
    echo json_encode(['error' => 'Tipo de archivo no permitido. Solo se permiten: JPG, PNG, GIF, WEBP']);
    exit;
}

// Validar tamaño
if ($file['size'] > $max_size) {
    http_response_code(400);
    echo json_encode(['error' => 'El archivo es demasiado grande. Máximo 20MB']);
    exit;
}

// Crear directorio si no existe
$upload_dir = __DIR__ . '/../uploads/';
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

// Generar nombre único para el archivo
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('img_', true) . '.' . $extension;
$filepath = $upload_dir . $filename;

// Mover el archivo
if (!move_uploaded_file($file['tmp_name'], $filepath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al guardar el archivo']);
    exit;
}

// Retornar la URL pública de la imagen
$public_url = '/uploads/' . $filename;
json_ok(['url' => $public_url, 'filename' => $filename]);
