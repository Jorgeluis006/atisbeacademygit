-- Crear tabla de usuarios básica para autenticación
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(150) DEFAULT NULL,
  role VARCHAR(50) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Usuario demo (credenciales demo/demo123)
INSERT INTO users (username, password_hash, name, role)
SELECT 'demo', '$2y$10$abcdefghijklmnopqrstuvwx0l9XrOqzqS4U2KQkI3xZJbq2J7p1Zr1kS', 'Usuario Demo', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users);
