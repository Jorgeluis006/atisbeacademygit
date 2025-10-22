<?php
// CONFIGURACIÓN — No guardes secretos en Git. En producción, crea un archivo no versionado
// public_html/api/config.local.php con las constantes; este archivo lo incluirá si existe.

// 1) Cargar overrides locales si existen (para que puedan sobreescribir defaults)
$local = __DIR__ . '/config.local.php';
if (file_exists($local)) {
	require_once $local;
}

// 2) Defaults de ejemplo (solo si no fueron definidos en config.local.php)
if (!defined('DB_HOST')) define('DB_HOST', 'localhost');
if (!defined('DB_NAME')) define('DB_NAME', 'TUNOMBRE_DB');
if (!defined('DB_USER')) define('DB_USER', 'TUNOMBRE_USER');
if (!defined('DB_PASS')) define('DB_PASS', 'TU_PASSWORD');
if (!defined('DB_PORT')) define('DB_PORT', 3306);

if (!defined('MAIL_TO')) define('MAIL_TO', '');
if (!defined('ALLOW_ORIGIN')) define('ALLOW_ORIGIN', '');

if (!defined('SMTP_HOST')) define('SMTP_HOST', '');
if (!defined('SMTP_USER')) define('SMTP_USER', '');
if (!defined('SMTP_PASS')) define('SMTP_PASS', '');
if (!defined('SMTP_SECURE')) define('SMTP_SECURE', 'tls');
if (!defined('SMTP_PORT')) define('SMTP_PORT', 587);
if (!defined('SMTP_FROM')) define('SMTP_FROM', '');
if (!defined('SMTP_FROM_NAME')) define('SMTP_FROM_NAME', 'Atisbe Notificador');

// Controla si se siembra el usuario demo al iniciar (por defecto: permitir)
if (!defined('DISABLE_DEMO_SEED')) define('DISABLE_DEMO_SEED', false);
