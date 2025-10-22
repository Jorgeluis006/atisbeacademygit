-- Tabla de reservas de horario
CREATE TABLE IF NOT EXISTS schedule_reservations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  datetime DATETIME NOT NULL,
  tipo VARCHAR(40) DEFAULT 'clase',
  modalidad VARCHAR(40) DEFAULT 'virtual',
  notas VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (user_id),
  INDEX (datetime),
  CONSTRAINT fk_res_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
