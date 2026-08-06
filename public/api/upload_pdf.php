<?php
/**
 * Endpoint para subir PDFs de estructura de clases
 * Límite: 30MB por archivo
 */
require_once __DIR__ . '/_bootstrap.php';
require_auth();
require_admin_or_coordinator();

header('Content-Type: application/json');

if (!isset($_FILES['pdf'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No se recibió ningún archivo']);
    exit;
}

if ($_FILES['pdf']['error'] !== UPLOAD_ERR_OK) {
    $error_message = 'Error al subir el archivo';
    switch ($_FILES['pdf']['error']) {
        case UPLOAD_ERR_INI_SIZE:
        case UPLOAD_ERR_FORM_SIZE:
            $error_message = 'El archivo es demasiado grande. Verifica upload_max_filesize y post_max_size en PHP';
            break;
        case UPLOAD_ERR_NO_FILE:
            $error_message = 'No se seleccionó ningún archivo';
            break;
    }
    http_response_code(400);
    echo json_encode(['error' => $error_message]);
    exit;
}

$file = $_FILES['pdf'];
$max_size = 30 * 1024 * 1024; // 30MB

$extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if ($extension !== 'pdf' || $file['type'] !== 'application/pdf') {
    http_response_code(400);
    echo json_encode(['error' => 'Solo se permiten archivos PDF']);
    exit;
}

if ($file['size'] > $max_size) {
    http_response_code(400);
    echo json_encode(['error' => 'El archivo es demasiado grande. Máximo 30MB']);
    exit;
}

$upload_dir = __DIR__ . '/../uploads/docs/';
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

$filename = uniqid('doc_', true) . '.pdf';
$filepath = $upload_dir . $filename;

if (!move_uploaded_file($file['tmp_name'], $filepath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al guardar el archivo']);
    exit;
}

$public_url = '/uploads/docs/' . $filename;
json_ok(['url' => $public_url, 'filename' => $filename]);
