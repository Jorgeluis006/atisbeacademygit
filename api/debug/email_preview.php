<?php
/**
 * Script de prueba para visualizar el email de recordatorio de clase
 */

// Simular los datos de una clase
$studentName = 'Luisito';
$curso = 'Inglés';
$nivel = 'Intermedio';
$modalidad = 'virtual';
$tipo = 'clase grupal';
$meetingLink = 'https://meet.google.com/abc-defg-hij';
$fechaFormateada = '16/11/2025 a las 14:30';

// Generar el HTML del email
$html = '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; color: #333; line-height: 1.5; margin: 0; padding: 0; background: #f0f0f0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .email-wrapper { background: #fff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #791eba, #bfa6a4); color: #fff; padding: 25px; text-align: center; }
        .header h2 { margin: 0; font-size: 24px; }
        .content { padding: 25px; background: #f9f9f9; }
        .button { display: inline-block; background: #791eba; color: #fff !important; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; text-align: center; }
        .info-box { background: #fff; border-left: 4px solid #791eba; padding: 15px; margin: 20px 0; border-radius: 6px; }
        .info-box p { margin: 8px 0; }
        .info-box strong { color: #791eba; }
        .footer { text-align: center; font-size: 12px; color: #999; margin-top: 25px; padding-top: 15px; border-top: 1px solid #eee; }
        .warning-box { background: #fff3cd; padding: 12px; border-radius: 6px; color: #856404; margin: 20px 0; border-left: 4px solid #ffc107; }
        p { margin: 12px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-wrapper">
            <div class="header">
                <h2>⏰ Recordatorio de Clase</h2>
            </div>
            <div class="content">
                <p>Hola <strong>' . htmlspecialchars($studentName) . '</strong>,</p>
                <p>Tu <strong>' . htmlspecialchars($tipo) . '</strong> comienza en aproximadamente <strong>1 hora</strong>.</p>
                
                <div class="info-box">
                    <p><strong>📚 Curso:</strong> ' . htmlspecialchars($curso . ' - Nivel ' . $nivel) . '</p>
                    <p><strong>📆 Fecha y hora:</strong> ' . htmlspecialchars($fechaFormateada) . '</p>
                    <p><strong>💻 Modalidad:</strong> ' . htmlspecialchars(ucfirst($modalidad)) . '</p>
                </div>
                
                ' . ($meetingLink ? '<div style="text-align: center;"><a href="' . htmlspecialchars($meetingLink) . '" class="button">🔗 Unirse a la clase</a></div>' : '<div class="warning-box">El enlace de la videollamada será agregado por el profesor.</div>') . '
                
                <p>Prepárate con tu material y verifica cámara/micrófono.</p>
                <p style="font-size: 12px; color: #666;">Si la clase ya inició o este mensaje no aplica, puedes ignorarlo.</p>
                
                <div class="footer">
                    Este es un correo automático. &copy; ' . date('Y') . ' Atisbe Academy.
                </div>
            </div>
        </div>
    </div>
</body>
</html>';

// Mostrar el HTML
echo $html;
?>
