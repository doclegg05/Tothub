-- TotHub Database Schema Improvements - Step by Step
-- This approach runs each change separately to identify issues

-- Step 1: Add missing parent_id column to children
BEGIN;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'children' AND column_name = 'parent_id') THEN
        ALTER TABLE children ADD COLUMN parent_id VARCHAR;
        RAISE NOTICE 'Added parent_id column to children table';
    ELSE
        RAISE NOTICE 'parent_id column already exists in children table';
    END IF;
END $$;
COMMIT;

-- Step 2: Add foreign key from children to parents
BEGIN;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'children_parent_id_fkey' 
                   AND table_name = 'children') THEN
        ALTER TABLE children 
        ADD CONSTRAINT children_parent_id_fkey 
        FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key constraint children_parent_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint children_parent_id_fkey already exists';
    END IF;
END $$;
COMMIT;

-- Step 3: Check and fix staff_schedules foreign key
BEGIN;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'staff_schedules_staff_id_staff_id_fk' 
                   AND table_name = 'staff_schedules') THEN
        -- Check if the column exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'staff_schedules' AND column_name = 'staff_id') THEN
            RAISE NOTICE 'staff_id column missing in staff_schedules - cannot add FK';
        ELSE
            ALTER TABLE staff_schedules 
            ADD CONSTRAINT staff_schedules_staff_id_fkey 
            FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE;
            RAISE NOTICE 'Added foreign key constraint staff_schedules_staff_id_fkey';
        END IF;
    ELSE
        RAISE NOTICE 'Foreign key constraint for staff_schedules already exists';
    END IF;
END $$;
COMMIT;

-- Step 4: Add performance indexes for attendance
BEGIN;
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_child_date ON attendance(child_id, date);
RAISE NOTICE 'Created attendance indexes';
COMMIT;

-- Step 5: Add performance indexes for session_activity
BEGIN;
CREATE INDEX IF NOT EXISTS idx_session_activity_timestamp ON session_activity(timestamp);
CREATE INDEX IF NOT EXISTS idx_session_activity_session_id ON session_activity(session_id);
RAISE NOTICE 'Created session_activity indexes';
COMMIT;

-- Step 6: Add performance indexes for schedules
BEGIN;
CREATE INDEX IF NOT EXISTS idx_staff_schedules_date ON staff_schedules(date);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_staff_date ON staff_schedules(staff_id, date);
CREATE INDEX IF NOT EXISTS idx_child_schedules_date ON child_schedules(date);
CREATE INDEX IF NOT EXISTS idx_child_schedules_child_date ON child_schedules(child_id, date);
RAISE NOTICE 'Created schedule indexes';
COMMIT;

-- Step 7: Add security table indexes
BEGIN;
CREATE INDEX IF NOT EXISTS idx_security_logs_event_time ON security_logs(event_time);
RAISE NOTICE 'Created security_logs indexes';
COMMIT;

-- Step 8: Add other useful indexes
BEGIN;
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(date);
CREATE INDEX IF NOT EXISTS idx_daily_reports_child_date ON daily_reports(child_id, date);
CREATE INDEX IF NOT EXISTS idx_documents_expiration_date ON documents(expiration_date);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_alerts_is_read ON alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_billing_status ON billing(status);
CREATE INDEX IF NOT EXISTS idx_billing_due_date ON billing(due_date);
RAISE NOTICE 'Created additional indexes';
COMMIT;

-- Step 9: Add check constraints
BEGIN;
DO $$
BEGIN
    -- Check constraint for mood rating
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'chk_mood_rating') THEN
        ALTER TABLE attendance 
        ADD CONSTRAINT chk_mood_rating CHECK (mood_rating IS NULL OR (mood_rating >= 1 AND mood_rating <= 5));
        RAISE NOTICE 'Added mood_rating check constraint';
    END IF;
    
    -- Check constraint for alerts severity
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'chk_severity') THEN
        ALTER TABLE alerts 
        ADD CONSTRAINT chk_severity CHECK (severity IN ('low', 'medium', 'high', 'critical'));
        RAISE NOTICE 'Added severity check constraint';
    END IF;
END $$;
COMMIT;

-- Step 10: Add default values
BEGIN;
ALTER TABLE children ALTER COLUMN enrollment_date SET DEFAULT CURRENT_DATE;
ALTER TABLE staff ALTER COLUMN is_active SET DEFAULT true;
ALTER TABLE parents ALTER COLUMN is_active SET DEFAULT true;
RAISE NOTICE 'Added default values';
COMMIT;

-- Step 11: Add archive columns for soft deletes
BEGIN;
ALTER TABLE children ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;
ALTER TABLE parents ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;
RAISE NOTICE 'Added archive columns';
COMMIT;

-- Step 12: Create indexes for active records
BEGIN;
CREATE INDEX IF NOT EXISTS idx_children_active ON children(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_staff_active ON staff(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_parents_active ON parents(is_active) WHERE is_active = true;
RAISE NOTICE 'Created active record indexes';
COMMIT;

-- Step 13: Add security audit columns
BEGIN;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'security_credentials' AND column_name = 'last_modified') THEN
        ALTER TABLE security_credentials ADD COLUMN last_modified TIMESTAMP DEFAULT NOW();
        ALTER TABLE security_credentials ADD COLUMN modified_by TEXT;
        RAISE NOTICE 'Added security audit columns';
    END IF;
END $$;
COMMIT;

-- Step 14: Create update trigger for security tables
BEGIN;
CREATE OR REPLACE FUNCTION update_last_modified()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_security_credentials_last_modified ON security_credentials;
CREATE TRIGGER update_security_credentials_last_modified
BEFORE UPDATE ON security_credentials
FOR EACH ROW
EXECUTE FUNCTION update_last_modified();
RAISE NOTICE 'Created last_modified trigger';
COMMIT;

-- Verification queries
SELECT 'Foreign Keys Created:' as info;
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('children', 'staff_schedules', 'child_schedules', 'attendance', 'billing')
ORDER BY tc.table_name;

SELECT 'Indexes Created:' as info;
SELECT 
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;