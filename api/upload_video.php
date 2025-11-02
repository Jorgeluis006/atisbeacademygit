<?php
/**
 * Endpoint para subir videos
 * Límite: 100MB por archivo
 * Tipos permitidos: MP4, WEBM, MOV, AVI
 */
require_once __DIR__ . '/_bootstrap.php';
require_auth();
require_admin();

header('Content-Type: application/json');

// Verificar que se subió un archivo
if (!isset($_FILES['video'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No se recibió ningún archivo']);
    exit;
}

// Manejar errores de PHP
if ($_FILES['video']['error'] !== UPLOAD_ERR_OK) {
    $error_message = 'Error al subir el archivo';
    switch ($_FILES['video']['error']) {
        case UPLOAD_ERR_INI_SIZE:
        case UPLOAD_ERR_FORM_SIZE:
            $error_message = 'El archivo es demasiado grande. Verifica la configuración del servidor';
            break;
        case UPLOAD_ERR_NO_FILE:
            $error_message = 'No se seleccionó ningún archivo';
            break;
    }
    http_response_code(400);
    echo json_encode(['error' => $error_message]);
    exit;
}

$file = $_FILES['video'];
$allowed_types = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
$max_size = 100 * 1024 * 1024; // 100MB

// Validar tipo de archivo
if (!in_array($file['type'], $allowed_types)) {
    http_response_code(400);
    echo json_encode(['error' => 'Tipo de archivo no permitido. Solo se permiten: MP4, WEBM, MOV, AVI']);
    exit;
}

// Validar tamaño
if ($file['size'] > $max_size) {
    http_response_code(400);
    echo json_encode(['error' => 'El archivo es demasiado grande. Máximo 100MB']);
    exit;
}

// Crear directorio si no existe
$upload_dir = __DIR__ . '/../uploads/';
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

// Generar nombre único para el archivo
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('video_', true) . '.' . $extension;
$filepath = $upload_dir . $filename;

// Mover el archivo
if (!move_uploaded_file($file['tmp_name'], $filepath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al guardar el archivo']);
    exit;
}

// Retornar la URL pública del video
$public_url = '/uploads/' . $filename;
json_ok(['url' => $public_url, 'filename' => $filename]);
