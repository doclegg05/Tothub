-- TotHub Database Schema Improvements
-- Generated: 2025-08-05
-- This migration adds missing foreign keys, indexes, and constraints

BEGIN;

-- ============================================
-- 0. Add Missing Columns First
-- ============================================

-- Add parent_id to children table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'children' AND column_name = 'parent_id') THEN
        ALTER TABLE children ADD COLUMN parent_id VARCHAR;
    END IF;
END $$;

-- ============================================
-- 1. Add Missing Foreign Keys
-- ============================================

-- Add foreign key from children to parents
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'children_parent_id_fkey' 
                   AND table_name = 'children') THEN
        ALTER TABLE children 
        ADD CONSTRAINT children_parent_id_fkey 
        FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add foreign key from child_schedules to children (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'child_schedules_child_id_fkey' 
                   AND table_name = 'child_schedules') THEN
        ALTER TABLE child_schedules 
        ADD CONSTRAINT child_schedules_child_id_fkey 
        FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key from messages to parents
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'messages_parent_id_fkey' 
                   AND table_name = 'messages') THEN
        ALTER TABLE messages 
        ADD CONSTRAINT messages_parent_id_fkey 
        FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key from messages to staff
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'messages_staff_id_fkey' 
                   AND table_name = 'messages') THEN
        ALTER TABLE messages 
        ADD CONSTRAINT messages_staff_id_fkey 
        FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key from media_shares to children
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'media_shares_child_id_fkey' 
                   AND table_name = 'media_shares') THEN
        ALTER TABLE media_shares 
        ADD CONSTRAINT media_shares_child_id_fkey 
        FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key from daily_reports to children
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'daily_reports_child_id_fkey' 
                   AND table_name = 'daily_reports') THEN
        ALTER TABLE daily_reports 
        ADD CONSTRAINT daily_reports_child_id_fkey 
        FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key from teacher_notes to children
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'teacher_notes_child_id_fkey' 
                   AND table_name = 'teacher_notes') THEN
        ALTER TABLE teacher_notes 
        ADD CONSTRAINT teacher_notes_child_id_fkey 
        FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key from security_devices to security_zones
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'security_devices_zone_id_fkey' 
                   AND table_name = 'security_devices') THEN
        ALTER TABLE security_devices 
        ADD CONSTRAINT security_devices_zone_id_fkey 
        FOREIGN KEY (zone_id) REFERENCES security_zones(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add foreign key from security_logs to security_zones
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'security_logs_zone_id_fkey' 
                   AND table_name = 'security_logs') THEN
        ALTER TABLE security_logs 
        ADD CONSTRAINT security_logs_zone_id_fkey 
        FOREIGN KEY (zone_id) REFERENCES security_zones(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add foreign key from security_logs to security_devices
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'security_logs_device_id_fkey' 
                   AND table_name = 'security_logs') THEN
        ALTER TABLE security_logs 
        ADD CONSTRAINT security_logs_device_id_fkey 
        FOREIGN KEY (device_id) REFERENCES security_devices(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add foreign key from document_reminders to documents
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'document_reminders_document_id_fkey' 
                   AND table_name = 'document_reminders') THEN
        ALTER TABLE document_reminders 
        ADD CONSTRAINT document_reminders_document_id_fkey 
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key from document_renewals to documents
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'document_renewals_document_id_fkey' 
                   AND table_name = 'document_renewals') THEN
        ALTER TABLE document_renewals 
        ADD CONSTRAINT document_renewals_document_id_fkey 
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key from safety_reminder_completions to safety_reminders
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'safety_reminder_completions_reminder_id_fkey' 
                   AND table_name = 'safety_reminder_completions') THEN
        ALTER TABLE safety_reminder_completions 
        ADD CONSTRAINT safety_reminder_completions_reminder_id_fkey 
        FOREIGN KEY (reminder_id) REFERENCES safety_reminders(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key from pay_stubs to pay_periods
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'pay_stubs_pay_period_id_fkey' 
                   AND table_name = 'pay_stubs') THEN
        ALTER TABLE pay_stubs 
        ADD CONSTRAINT pay_stubs_pay_period_id_fkey 
        FOREIGN KEY (pay_period_id) REFERENCES pay_periods(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key from pay_stubs to staff
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'pay_stubs_staff_id_fkey' 
                   AND table_name = 'pay_stubs') THEN
        ALTER TABLE pay_stubs 
        ADD CONSTRAINT pay_stubs_staff_id_fkey 
        FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key from timesheet_entries to staff
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'timesheet_entries_staff_id_fkey' 
                   AND table_name = 'timesheet_entries') THEN
        ALTER TABLE timesheet_entries 
        ADD CONSTRAINT timesheet_entries_staff_id_fkey 
        FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key from payroll_reports to pay_periods
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'payroll_reports_pay_period_id_fkey' 
                   AND table_name = 'payroll_reports') THEN
        ALTER TABLE payroll_reports 
        ADD CONSTRAINT payroll_reports_pay_period_id_fkey 
        FOREIGN KEY (pay_period_id) REFERENCES pay_periods(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key from payroll_audit to pay_stubs
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'payroll_audit_pay_stub_id_fkey' 
                   AND table_name = 'payroll_audit') THEN
        ALTER TABLE payroll_audit 
        ADD CONSTRAINT payroll_audit_pay_stub_id_fkey 
        FOREIGN KEY (pay_stub_id) REFERENCES pay_stubs(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================
-- 2. Add Performance Indexes
-- ============================================

-- Index for attendance queries by date
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_child_date ON attendance(child_id, date);

-- Index for session activity queries
CREATE INDEX IF NOT EXISTS idx_session_activity_timestamp ON session_activity(timestamp);
CREATE INDEX IF NOT EXISTS idx_session_activity_session_id ON session_activity(session_id);

-- Index for staff schedules by date
CREATE INDEX IF NOT EXISTS idx_staff_schedules_date ON staff_schedules(date);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_staff_date ON staff_schedules(staff_id, date);

-- Index for child schedules by date
CREATE INDEX IF NOT EXISTS idx_child_schedules_date ON child_schedules(date);
CREATE INDEX IF NOT EXISTS idx_child_schedules_child_date ON child_schedules(child_id, date);

-- Index for security logs by time
CREATE INDEX IF NOT EXISTS idx_security_logs_event_time ON security_logs(event_time);

-- Index for messages by read status
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_parent_id ON messages(parent_id);

-- Index for daily reports by date
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(date);
CREATE INDEX IF NOT EXISTS idx_daily_reports_child_date ON daily_reports(child_id, date);

-- Index for documents by expiration
CREATE INDEX IF NOT EXISTS idx_documents_expiration_date ON documents(expiration_date);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);

-- Index for alerts by read status
CREATE INDEX IF NOT EXISTS idx_alerts_is_read ON alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);

-- Index for billing by status and due date
CREATE INDEX IF NOT EXISTS idx_billing_status ON billing(status);
CREATE INDEX IF NOT EXISTS idx_billing_due_date ON billing(due_date);

-- ============================================
-- 3. Add Constraints and Validations
-- ============================================

-- Add check constraints for valid values
ALTER TABLE attendance 
ADD CONSTRAINT chk_mood_rating CHECK (mood_rating >= 1 AND mood_rating <= 5);

ALTER TABLE alerts 
ADD CONSTRAINT chk_severity CHECK (severity IN ('low', 'medium', 'high', 'critical'));

ALTER TABLE documents 
ADD CONSTRAINT chk_document_status CHECK (status IN ('active', 'expired', 'pending_renewal', 'suspended'));

ALTER TABLE billing 
ADD CONSTRAINT chk_billing_status CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled'));

-- Ensure email format
ALTER TABLE parents 
ADD CONSTRAINT chk_parent_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');

ALTER TABLE staff 
ADD CONSTRAINT chk_staff_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$');

-- ============================================
-- 4. Add Missing Columns for Better Relationships
-- ============================================

-- Add parent_id to children table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'children' AND column_name = 'parent_id') THEN
        ALTER TABLE children ADD COLUMN parent_id VARCHAR;
        ALTER TABLE children ADD CONSTRAINT children_parent_id_fkey 
        FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================
-- 5. Security Improvements
-- ============================================

-- Add audit columns to sensitive tables
DO $$ 
BEGIN
    -- Add last_modified columns to security tables
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'security_credentials' AND column_name = 'last_modified') THEN
        ALTER TABLE security_credentials ADD COLUMN last_modified TIMESTAMP DEFAULT NOW();
        ALTER TABLE security_credentials ADD COLUMN modified_by TEXT;
    END IF;
END $$;

-- Create trigger for updating last_modified
CREATE OR REPLACE FUNCTION update_last_modified()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to security tables
DROP TRIGGER IF EXISTS update_security_credentials_last_modified ON security_credentials;
CREATE TRIGGER update_security_credentials_last_modified
BEFORE UPDATE ON security_credentials
FOR EACH ROW
EXECUTE FUNCTION update_last_modified();

-- ============================================
-- 6. Data Quality Improvements
-- ============================================

-- Set NOT NULL constraints where appropriate
ALTER TABLE children ALTER COLUMN enrollment_date SET DEFAULT CURRENT_DATE;
ALTER TABLE staff ALTER COLUMN is_active SET DEFAULT true;
ALTER TABLE parents ALTER COLUMN is_active SET DEFAULT true;

-- Add unique constraints
ALTER TABLE staff ADD CONSTRAINT staff_email_unique UNIQUE (email);
ALTER TABLE security_devices ADD CONSTRAINT security_devices_mac_unique UNIQUE (mac_address);

-- ============================================
-- 7. Archive/Soft Delete Support
-- ============================================

-- Add archived_at columns for soft deletes
ALTER TABLE children ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;
ALTER TABLE staff ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;
ALTER TABLE parents ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP;

-- Create indexes for active records
CREATE INDEX IF NOT EXISTS idx_children_active ON children(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_staff_active ON staff(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_parents_active ON parents(is_active) WHERE is_active = true;

COMMIT;

-- ============================================
-- Post-Migration Verification Queries
-- ============================================

-- Verify foreign keys were created
/*
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
WHERE constraint_type = 'FOREIGN KEY';

-- Verify indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
*/