<?php
require_once __DIR__ . '/config.php';

/**
 * Envía correo por SMTP usando PHPMailer si está disponible (via Composer vendor/autoload.php),
 * de lo contrario intenta fallback a mail().
 */
function send_mail($to, $subject, $htmlBody) {
    // Intentar PHPMailer si existe vendor
    $vendorAutoload = __DIR__ . '/vendor/autoload.php';
    if (file_exists($vendorAutoload)) {
        require_once $vendorAutoload;
        try {
            $mail = new PHPMailer\PHPMailer\PHPMailer(true);
            if (defined('SMTP_HOST') && SMTP_HOST) {
                $mail->isSMTP();
                $mail->Host = SMTP_HOST;
                $mail->SMTPAuth = true;
                $mail->Username = SMTP_USER ?? '';
                $mail->Password = SMTP_PASS ?? '';
                $mail->SMTPSecure = SMTP_SECURE ?? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
                $mail->Port = SMTP_PORT ?? 587;
            }
            $from = defined('SMTP_FROM') && SMTP_FROM ? SMTP_FROM : ('notificador@' . ($_SERVER['HTTP_HOST'] ?? 'localhost'));
            $fromName = defined('SMTP_FROM_NAME') && SMTP_FROM_NAME ? SMTP_FROM_NAME : 'Atisbe Notificador';
            $mail->setFrom($from, $fromName);
            $mail->addAddress($to);
            $mail->isHTML(true);
            $mail->CharSet = 'UTF-8';
            $mail->Subject = $subject;
            $mail->Body = $htmlBody;
            $mail->AltBody = strip_tags(str_replace(['<br>','<br/>','<br />'], "\n", $htmlBody));
            $mail->send();
            return true;
        } catch (Throwable $e) {
            // Continúa al fallback
        }
    }

    // Fallback: mail()
    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
    $from = defined('SMTP_FROM') && SMTP_FROM ? SMTP_FROM : ('notificador@' . ($_SERVER['HTTP_HOST'] ?? 'localhost'));
    $headers .= 'From: ' . $from . "\r\n";
    return @mail($to, $subject, $htmlBody, $headers);
}
