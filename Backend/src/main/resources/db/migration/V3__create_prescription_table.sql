-- Create prescription table
CREATE TABLE IF NOT EXISTS prescription (
    id INT AUTO_INCREMENT PRIMARY KEY,
    medicine VARCHAR(255) NOT NULL,
    advice TEXT,
    remark TEXT,
    status VARCHAR(50) DEFAULT 'Active',
    created_at DATE,
    p_id INT NOT NULL,
    ap_id INT NOT NULL,
    d_id INT,
    FOREIGN KEY (p_id) REFERENCES patient(p_id) ON DELETE CASCADE,
    FOREIGN KEY (ap_id) REFERENCES appointment(ap_id) ON DELETE CASCADE,
    FOREIGN KEY (d_id) REFERENCES doctor(dr_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add index for better performance on frequently queried columns
CREATE INDEX idx_prescription_patient ON prescription(p_id);
CREATE INDEX idx_prescription_appointment ON prescription(ap_id);
CREATE INDEX idx_prescription_doctor ON prescription(d_id);
