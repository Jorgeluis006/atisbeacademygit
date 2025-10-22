<?php
require_once __DIR__ . '/../_bootstrap.php';
require_auth();

// Genera slots para los próximos 14 días (ejemplo simple)
$now = new DateTime('now');
$slots = [];
for ($d = 0; $d < 14; $d++) {
    $date = (clone $now)->modify("+{$d} day");
    // Evitar domingos (opcional)
    $dow = (int)$date->format('N'); // 1..7
    if ($dow === 7) continue;
    foreach (['10:00','16:00','19:00'] as $t) {
        $dt = DateTime::createFromFormat('Y-m-d H:i', $date->format('Y-m-d') . ' ' . $t);
        if ($dt < $now) continue;
        $slots[] = [
            'datetime' => $dt->format(DateTime::ATOM),
            'tipo' => 'clase',
            'modalidad' => 'virtual',
        ];
    }
}

json_ok(['slots' => $slots]);
