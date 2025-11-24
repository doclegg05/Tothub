-- TotHub Database Schema Consolidation Migration
-- This migration consolidates redundant tables and implements the most efficient structure
-- Date: 2025-01-27
-- Purpose: Eliminate redundancies and improve performance

BEGIN TRANSACTION;

-- Step 1: Create new consolidated tables

-- Create new unified users table
CREATE TABLE IF NOT EXISTS users_new (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role TEXT NOT NULL,
    tenant_id TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    last_login_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    
    -- Staff-specific fields
    position TEXT,
    hourly_rate INTEGER,
    w4_allowances INTEGER DEFAULT 0,
    additional_tax_withholding INTEGER DEFAULT 0,
    face_descriptor TEXT,
    fingerprint_hash TEXT,
    employee_id TEXT UNIQUE,
    hire_date TEXT,
    certifications TEXT,
    qualifications TEXT,
    
    -- Contact fields
    phone TEXT,
    address TEXT,
    emergency_contact TEXT,
    
    -- Profile fields
    profile_picture_url TEXT,
    bio TEXT,
    preferred_language TEXT,
    notification_preferences TEXT
);

-- Create new unified schedules table
CREATE TABLE IF NOT EXISTS schedules_new (
    id TEXT PRIMARY KEY,
    schedule_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    room TEXT NOT NULL,
    date TEXT NOT NULL,
    scheduled_start TEXT NOT NULL,
    scheduled_end TEXT NOT NULL,
    actual_start TEXT,
    actual_end TEXT,
    is_present INTEGER DEFAULT 0,
    notes TEXT,
    status TEXT DEFAULT 'scheduled',
    
    -- Template-specific fields
    is_recurring INTEGER DEFAULT 0,
    recurring_pattern TEXT,
    recurring_days TEXT,
    recurring_until TEXT,
    
    -- Child-specific fields
    meal_plan TEXT,
    expected_arrival TEXT,
    expected_departure TEXT,
    
    -- Room-specific fields
    capacity INTEGER,
    assigned_staff INTEGER,
    enrolled_children INTEGER,
    activities TEXT,
    meal_times TEXT,
    
    created_at TEXT DEFAULT (datetime('now'))
);

-- Step 2: Migrate data from old tables to new consolidated tables

-- Migrate staff data to users table
INSERT INTO users_new (
    id, email, password_hash, first_name, last_name, role, tenant_id,
    position, hourly_rate, w4_allowances, additional_tax_withholding,
    face_descriptor, fingerprint_hash, employee_id, hire_date,
    is_active, created_at
)
SELECT 
    id, 
    COALESCE(email, 'staff_' || id || '@tothub.local') as email,
    'migrated_password_hash' as password_hash,
    first_name, 
    last_name, 
    'staff' as role,
    'default' as tenant_id,
    position,
    hourly_rate,
    w4_allowances,
    additional_tax_withholding,
    face_descriptor,
    fingerprint_hash,
    employee_id,
    hire_date,
    is_active,
    created_at
FROM staff
WHERE id IS NOT NULL;

-- Migrate parent data to users table (if parents table exists)
INSERT INTO users_new (
    id, email, password_hash, first_name, last_name, role, tenant_id,
    phone, address, emergency_contact, is_active, created_at
)
SELECT 
    id,
    COALESCE(email, 'parent_' || id || '@tothub.local') as email,
    COALESCE(password_hash, 'migrated_password_hash') as password_hash,
    first_name,
    last_name,
    'parent' as role,
    'default' as tenant_id,
    phone,
    address,
    emergency_contact,
    is_active,
    created_at
FROM parents
WHERE id IS NOT NULL AND id NOT IN (SELECT id FROM users_new);

-- Migrate staff schedules to unified schedules table
INSERT INTO schedules_new (
    id, schedule_type, entity_id, entity_type, room, date,
    scheduled_start, scheduled_end, actual_start, actual_end,
    is_present, notes, status, created_at
)
SELECT 
    id,
    'staff' as schedule_type,
    staff_id as entity_id,
    'staff' as entity_type,
    room,
    date,
    scheduled_start,
    scheduled_end,
    actual_start,
    actual_end,
    is_present,
    notes,
    COALESCE(status, 'scheduled') as status,
    created_at
FROM staff_schedules
WHERE id IS NOT NULL;

-- Migrate child schedules to unified schedules table (if child_schedules table exists)
INSERT INTO schedules_new (
    id, schedule_type, entity_id, entity_type, room, date,
    scheduled_start, scheduled_end, actual_start, actual_end,
    is_present, notes, status, created_at
)
SELECT 
    id,
    'child' as schedule_type,
    child_id as entity_id,
    'child' as entity_type,
    room,
    date,
    COALESCE(scheduled_arrival, '09:00:00') as scheduled_start,
    COALESCE(scheduled_departure, '17:00:00') as scheduled_end,
    actual_arrival as actual_start,
    actual_departure as actual_end,
    is_present,
    notes,
    'scheduled' as status,
    created_at
FROM child_schedules
WHERE id IS NOT NULL AND id NOT IN (SELECT id FROM schedules_new);

-- Migrate room schedules to unified schedules table (if room_schedules table exists)
INSERT INTO schedules_new (
    id, schedule_type, entity_id, entity_type, room, date,
    scheduled_start, scheduled_end, capacity, assigned_staff,
    enrolled_children, activities, meal_times, created_at
)
SELECT 
    id,
    'room' as schedule_type,
    room_name as entity_id,
    'room' as entity_type,
    room_name as room,
    date,
    '06:00:00' as scheduled_start,
    '18:00:00' as scheduled_end,
    capacity,
    assigned_staff,
    enrolled_children,
    activities,
    meal_times,
    created_at
FROM room_schedules
WHERE id IS NOT NULL AND id NOT IN (SELECT id FROM schedules_new);

-- Step 3: Update foreign key references

-- Update children table to reference users instead of parents
ALTER TABLE children ADD COLUMN parent_id_new TEXT REFERENCES users_new(id);
UPDATE children SET parent_id_new = parent_id WHERE parent_id IS NOT NULL;

-- Update attendance table to reference users
ALTER TABLE attendance ADD COLUMN checked_in_by_new TEXT REFERENCES users_new(id);
ALTER TABLE attendance ADD COLUMN checked_out_by_new TEXT REFERENCES users_new(id);
UPDATE attendance SET checked_in_by_new = checked_in_by WHERE checked_in_by IS NOT NULL;
UPDATE attendance SET checked_out_by_new = checked_out_by WHERE checked_out_by IS NOT NULL;

-- Update teacher_notes table to reference users
ALTER TABLE teacher_notes ADD COLUMN staff_id_new TEXT REFERENCES users_new(id);
UPDATE teacher_notes SET staff_id_new = staff_id WHERE staff_id IS NOT NULL;

-- Update pay_stubs table to reference users
ALTER TABLE pay_stubs ADD COLUMN staff_id_new TEXT REFERENCES users_new(id);
UPDATE pay_stubs SET staff_id_new = staff_id WHERE staff_id IS NOT NULL;

-- Update timesheet_entries table to reference users
ALTER TABLE timesheet_entries ADD COLUMN staff_id_new TEXT REFERENCES users_new(id);
ALTER TABLE timesheet_entries ADD COLUMN approved_by_new TEXT REFERENCES users_new(id);
UPDATE timesheet_entries SET staff_id_new = staff_id WHERE staff_id IS NOT NULL;
UPDATE timesheet_entries SET approved_by_new = approved_by WHERE approved_by IS NOT NULL;

-- Update safety_reminder_completions table to reference users
ALTER TABLE safety_reminder_completions ADD COLUMN completed_by_new TEXT REFERENCES users_new(id);
UPDATE safety_reminder_completions SET completed_by_new = completed_by WHERE completed_by IS NOT NULL;

-- Update security_credentials table to reference users
ALTER TABLE security_credentials ADD COLUMN assigned_to_new TEXT REFERENCES users_new(id);
UPDATE security_credentials SET assigned_to_new = assigned_to WHERE assigned_to IS NOT NULL;

-- Update security_logs table to reference users
ALTER TABLE security_logs ADD COLUMN user_id_new TEXT REFERENCES users_new(id);
UPDATE security_logs SET user_id_new = user_id WHERE user_id IS NOT NULL;

-- Update audit_logs table to reference users
ALTER TABLE audit_logs ADD COLUMN user_id_new TEXT REFERENCES users_new(id);
UPDATE audit_logs SET user_id_new = user_id WHERE user_id IS NOT NULL;

-- Update sessions table to reference users
ALTER TABLE sessions ADD COLUMN user_id_new TEXT REFERENCES users_new(id);
UPDATE sessions SET user_id_new = user_id WHERE user_id IS NOT NULL;

-- Update documents table to reference users
ALTER TABLE documents ADD COLUMN staff_id_new TEXT REFERENCES users_new(id);
ALTER TABLE documents ADD COLUMN created_by_new TEXT REFERENCES users_new(id);
UPDATE documents SET staff_id_new = staff_id WHERE staff_id IS NOT NULL;
UPDATE documents SET created_by_new = created_by WHERE created_by IS NOT NULL;

-- Update document_reminders table to reference users
ALTER TABLE document_reminders ADD COLUMN acknowledged_by_new TEXT REFERENCES users_new(id);
UPDATE document_reminders SET acknowledged_by_new = acknowledged_by WHERE acknowledged_by IS NOT NULL;

-- Update messages table to reference users
ALTER TABLE messages ADD COLUMN sender_id_new TEXT REFERENCES users_new(id);
ALTER TABLE messages ADD COLUMN recipient_id_new TEXT REFERENCES users_new(id);
UPDATE messages SET sender_id_new = sender_id WHERE sender_id IS NOT NULL;
UPDATE messages SET recipient_id_new = recipient_id WHERE recipient_id IS NOT NULL;

-- Update payroll_audit table to reference users
ALTER TABLE payroll_audit ADD COLUMN changed_by_new TEXT REFERENCES users_new(id);
UPDATE payroll_audit SET changed_by_new = changed_by WHERE changed_by IS NOT NULL;

-- Update alerts table to reference users
ALTER TABLE alerts ADD COLUMN staff_id_new TEXT REFERENCES users_new(id);
ALTER TABLE alerts ADD COLUMN acknowledged_by_new TEXT REFERENCES users_new(id);
UPDATE alerts SET staff_id_new = staff_id WHERE staff_id IS NOT NULL;
UPDATE alerts SET acknowledged_by_new = acknowledged_by WHERE acknowledged_by IS NOT NULL;

-- Update state_compliance table to reference users
ALTER TABLE state_compliance ADD COLUMN updated_by_new TEXT REFERENCES users_new(id);
UPDATE state_compliance SET updated_by_new = updated_by WHERE updated_by IS NOT NULL;

-- Step 4: Remove duplicate fields from documents table
ALTER TABLE documents DROP COLUMN type_id;
ALTER TABLE documents DROP COLUMN expiration_date;
ALTER TABLE documents DROP COLUMN paid_date;

-- Step 5: Remove duplicate fields from billing table
ALTER TABLE billing DROP COLUMN paid_date;

-- Step 6: Remove duplicate fields from document_types table
ALTER TABLE document_types DROP COLUMN required;

-- Step 7: Remove redundant time tracking fields from timesheet_entries
ALTER TABLE timesheet_entries DROP COLUMN start_time;
ALTER TABLE timesheet_entries DROP COLUMN end_time;
ALTER TABLE timesheet_entries DROP COLUMN hours;

-- Step 8: Create indexes for better performance

-- Index for schedules table
CREATE INDEX IF NOT EXISTS idx_schedules_entity_type_date ON schedules_new(entity_type, date);
CREATE INDEX IF NOT EXISTS idx_schedules_room_date ON schedules_new(room, date);
CREATE INDEX IF NOT EXISTS idx_schedules_type_entity ON schedules_new(schedule_type, entity_id);

-- Index for users table
CREATE INDEX IF NOT EXISTS idx_users_role ON users_new(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users_new(email);
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users_new(employee_id);

-- Index for attendance table
CREATE INDEX IF NOT EXISTS idx_attendance_child_date ON attendance(child_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_room_date ON attendance(room, date);

-- Index for documents table
CREATE INDEX IF NOT EXISTS idx_documents_type_expiry ON documents(document_type_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_documents_staff ON documents(staff_id);

-- Index for messages table
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- Index for security_logs table
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_logs_device ON security_logs(device_id);

-- Index for sessions table
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(is_active);

-- Step 9: Drop old redundant tables (after data migration)

-- Drop old staff table (data migrated to users)
-- DROP TABLE IF EXISTS staff;

-- Drop old staff_schedules table (data migrated to schedules)
-- DROP TABLE IF EXISTS staff_schedules;

-- Drop old child_schedules table (data migrated to schedules)
-- DROP TABLE IF EXISTS child_schedules;

-- Drop old room_schedules table (data migrated to schedules)
-- DROP TABLE IF EXISTS room_schedules;

-- Drop old schedule_templates table (functionality merged into schedules)
-- DROP TABLE IF EXISTS schedule_templates;

-- Drop old user_sessions table (redundant with sessions)
-- DROP TABLE IF EXISTS user_sessions;

-- Drop old user_profiles table (merged into users)
-- DROP TABLE IF EXISTS user_profiles;

-- Drop old user_roles table (role field in users table)
-- DROP TABLE IF EXISTS user_roles;

-- Step 10: Rename new tables to replace old ones

-- Rename new users table
-- ALTER TABLE users_new RENAME TO users;

-- Rename new schedules table
-- ALTER TABLE schedules_new RENAME TO schedules;

-- Step 11: Update foreign key constraints to use new column names

-- Update children table
-- ALTER TABLE children DROP COLUMN parent_id;
-- ALTER TABLE children RENAME COLUMN parent_id_new TO parent_id;

-- Update attendance table
-- ALTER TABLE attendance DROP COLUMN checked_in_by;
-- ALTER TABLE attendance DROP COLUMN checked_out_by;
-- ALTER TABLE attendance RENAME COLUMN checked_in_by_new TO checked_in_by;
-- ALTER TABLE attendance RENAME COLUMN checked_out_by_new TO checked_out_by;

-- Continue with other tables...

-- Step 12: Verify data integrity
-- This section would include SELECT statements to verify the migration was successful

-- Count records in new consolidated tables
SELECT 'users_new' as table_name, COUNT(*) as record_count FROM users_new
UNION ALL
SELECT 'schedules_new' as table_name, COUNT(*) as record_count FROM schedules_new;

-- Verify foreign key relationships
SELECT 'children with valid parent_id' as check_type, COUNT(*) as count 
FROM children c 
JOIN users_new u ON c.parent_id_new = u.id
UNION ALL
SELECT 'attendance with valid checked_in_by' as check_type, COUNT(*) as count 
FROM attendance a 
JOIN users_new u ON a.checked_in_by_new = u.id;

COMMIT;

-- Note: The DROP TABLE and RENAME operations are commented out for safety
-- Uncomment them after verifying the migration was successful
-- Run this migration in a test environment first
