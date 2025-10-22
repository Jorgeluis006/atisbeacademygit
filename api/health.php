<?php
require_once __DIR__ . '/_bootstrap.php';

try {
    $pdo = get_pdo();
    // Garantiza que las tablas base existan (idempotente)
    ensure_schema();
    ensure_users_schema();
    ensure_schedule_schema();

    $version = null;
    try { $version = $pdo->getAttribute(PDO::ATTR_SERVER_VERSION); } catch (Throwable $e) {}

    json_ok([
        'health'   => 'ok',
        'db'       => 'connected',
        'mysql'    => $version,
        'database' => defined('DB_NAME') ? DB_NAME : null,
        'host'     => defined('DB_HOST') ? DB_HOST : null,
        'port'     => defined('DB_PORT') ? DB_PORT : null,
    ]);
} catch (Throwable $e) {
    json_error('Health check failed', 500, ['details' => $e->getMessage()]);
}
