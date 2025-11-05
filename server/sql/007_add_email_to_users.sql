-- Agregar campo email a la tabla users si no existe
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS email VARCHAR(255) DEFAULT NULL,
ADD UNIQUE KEY IF NOT EXISTS idx_email (email);
