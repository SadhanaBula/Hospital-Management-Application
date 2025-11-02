-- Check if table exists before creating it
SET @dbname = DATABASE();
SET @tablename = 'prescription';
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = @dbname
        AND TABLE_NAME = @tablename
    ) = 0,
    "CREATE TABLE prescription (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
    'SELECT 1'
));

PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add indexes if they don't exist
SET @index1 = (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = @tablename AND index_name = 'idx_prescription_patient');
SET @sql1 = IF(@index1 = 0, 'CREATE INDEX idx_prescription_patient ON prescription(p_id);', 'SELECT 1');
PREPARE stmt1 FROM @sql1;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

SET @index2 = (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = @tablename AND index_name = 'idx_prescription_appointment');
SET @sql2 = IF(@index2 = 0, 'CREATE INDEX idx_prescription_appointment ON prescription(ap_id);', 'SELECT 1');
PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

SET @index3 = (SELECT COUNT(1) FROM information_schema.statistics WHERE table_schema = @dbname AND table_name = @tablename AND index_name = 'idx_prescription_doctor');
SET @sql3 = IF(@index3 = 0, 'CREATE INDEX idx_prescription_doctor ON prescription(d_id);', 'SELECT 1');
PREPARE stmt3 FROM @sql3;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;
