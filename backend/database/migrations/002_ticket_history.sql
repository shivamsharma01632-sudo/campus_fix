-- ===================================================================
-- Migration 002: Ticket History & Audit Trail Enhancements
-- ===================================================================

CREATE TABLE IF NOT EXISTS ticket_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    note TEXT NOT NULL,
    performed_by_user_id INT NULL,
    performed_by_name VARCHAR(150) NOT NULL DEFAULT 'System',
    action_type VARCHAR(50) NOT NULL DEFAULT 'STATUS_CHANGE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (performed_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_history_ticket (ticket_id),
    INDEX idx_history_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
