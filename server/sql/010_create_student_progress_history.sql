CREATE TABLE IF NOT EXISTS student_progress_history (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    student_id INT UNSIGNED NOT NULL,
    changed_by_user_id INT UNSIGNED NULL,
    actor_role VARCHAR(50) DEFAULT NULL,
    action_type VARCHAR(20) NOT NULL DEFAULT 'update',
    previous_data JSON DEFAULT NULL,
    new_data JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_progress_history_student_created (student_id, created_at),
    INDEX idx_progress_history_actor (changed_by_user_id),
    CONSTRAINT fk_progress_history_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_progress_history_actor FOREIGN KEY (changed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;