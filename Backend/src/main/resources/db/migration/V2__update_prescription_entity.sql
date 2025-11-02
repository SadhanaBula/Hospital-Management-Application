-- Drop the existing foreign key constraints if they exist
ALTER TABLE prescription DROP FOREIGN KEY IF EXISTS FK_PRESCRIPTION_DOCTOR;
ALTER TABLE prescription DROP FOREIGN KEY IF EXISTS FK_PRESCRIPTION_PATIENT;
ALTER TABLE prescription DROP FOREIGN KEY IF EXISTS FK_PRESCRIPTION_APPOINTMENT;

-- Drop the existing index if it exists
DROP INDEX IF EXISTS IDX_PRESCRIPTION_PATIENT_ID ON prescription;

-- Add new columns if they don't exist
ALTER TABLE prescription 
    ADD COLUMN IF NOT EXISTS medicine VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS advice TEXT NULL,
    ADD COLUMN IF NOT EXISTS remark TEXT NULL,
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active',
    ADD COLUMN IF NOT EXISTS p_id INT NULL,
    ADD COLUMN IF NOT EXISTS ap_id INT NULL,
    MODIFY COLUMN date DATE DEFAULT CURRENT_DATE;

-- Copy data from details to advice (if details existed and advice is empty)
UPDATE prescription SET advice = details WHERE (advice IS NULL OR advice = '') AND details IS NOT NULL;

-- Drop the old details column if it exists
ALTER TABLE prescription DROP COLUMN IF EXISTS details;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS IDX_PRESCRIPTION_PATIENT_ID ON prescription(p_id);
CREATE INDEX IF NOT EXISTS IDX_PRESCRIPTION_APPOINTMENT_ID ON prescription(ap_id);

-- Add foreign key constraints
ALTER TABLE prescription 
    ADD CONSTRAINT FK_PRESCRIPTION_DOCTOR FOREIGN KEY (doctor_id) REFERENCES doctor(dr_id) ON DELETE SET NULL,
    ADD CONSTRAINT FK_PRESCRIPTION_PATIENT FOREIGN KEY (patient_id) REFERENCES patient(p_id) ON DELETE CASCADE,
    ADD CONSTRAINT FK_PRESCRIPTION_APPOINTMENT FOREIGN KEY (appointment_id) REFERENCES appointment(ap_id) ON DELETE SET NULL;
