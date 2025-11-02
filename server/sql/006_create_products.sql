CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500),
    category VARCHAR(100),
    stock INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar productos de ejemplo
INSERT INTO products (name, description, price, category, stock, is_active) VALUES
('Curso pregrabado: Inglés', 'Curso completo de inglés con videos pregrabados y material descargable', 299.99, 'curso', 100, TRUE),
('Curso pregrabado: Francés', 'Aprende francés desde cero con nuestro curso pregrabado', 299.99, 'curso', 100, TRUE),
('Libro/PDF Gramática', 'Guía completa de gramática en formato PDF descargable', 99.99, 'material', 999, TRUE),
('Club de lectura', 'Acceso mensual al club de lectura con sesiones en vivo', 149.99, 'club', 50, TRUE),
('Taller temático', 'Talleres especializados en temas específicos del idioma', 199.99, 'taller', 30, TRUE);
