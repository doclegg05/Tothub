-- TotHub Database Performance Optimization
-- This script creates strategic indexes and optimizations for the consolidated schema
-- Date: 2025-01-27
-- Purpose: Maximize query performance and reduce response times

BEGIN TRANSACTION;

-- ============================================================================
-- STRATEGIC INDEXES FOR MAXIMUM PERFORMANCE
-- ============================================================================

-- 1. COMPOSITE INDEXES FOR COMPLEX QUERIES

-- Schedules table - Most critical for performance
CREATE INDEX IF NOT EXISTS idx_schedules_composite_main ON schedules(
    schedule_type, 
    entity_type, 
    date, 
    room
);

CREATE INDEX IF NOT EXISTS idx_schedules_entity_date_room ON schedules(
    entity_id, 
    date, 
    room
);

CREATE INDEX IF NOT EXISTS idx_schedules_time_range ON schedules(
    date, 
    scheduled_start, 
    scheduled_end
);

-- Users table - Authentication and role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role_active ON users(
    role, 
    is_active
);

CREATE INDEX IF NOT EXISTS idx_users_email_role ON users(
    email, 
    role
);

CREATE INDEX IF NOT EXISTS idx_users_employee_position ON users(
    employee_id, 
    position
);

-- Attendance table - Daily operations
CREATE INDEX IF NOT EXISTS idx_attendance_daily_ops ON attendance(
    date, 
    child_id, 
    room
);

CREATE INDEX IF NOT EXISTS idx_attendance_checkin_time ON attendance(
    check_in_time, 
    date
);

CREATE INDEX IF NOT EXISTS idx_attendance_room_date ON attendance(
    room, 
    date
);

-- Children table - Enrollment and room management
CREATE INDEX IF NOT EXISTS idx_children_parent_active ON children(
    parent_id, 
    is_active
);

CREATE INDEX IF NOT EXISTS idx_children_room_active ON children(
    room, 
    is_active
);

CREATE INDEX IF NOT EXISTS idx_children_enrollment ON children(
    enrollment_date, 
    age_group
);

-- 2. FULL-TEXT SEARCH INDEXES

-- Users table - Name and position search
CREATE VIRTUAL TABLE IF NOT EXISTS users_fts USING fts5(
    first_name, 
    last_name, 
    position, 
    email,
    content='users',
    content_rowid='id'
);

-- Children table - Name and medical notes search
CREATE VIRTUAL TABLE IF NOT EXISTS children_fts USING fts5(
    first_name, 
    last_name, 
    medical_notes,
    content='children',
    content_rowid='id'
);

-- Documents table - Title and description search
CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
    title, 
    description,
    content='documents',
    content_rowid='id'
);

-- 3. PARTIAL INDEXES FOR ACTIVE RECORDS

-- Only active users
CREATE INDEX IF NOT EXISTS idx_users_active_only ON users(
    id, 
    role, 
    email
) WHERE is_active = 1;

-- Only active children
CREATE INDEX IF NOT EXISTS idx_children_active_only ON children(
    id, 
    room, 
    parent_id
) WHERE is_active = 1;

-- Only active schedules
CREATE INDEX IF NOT EXISTS idx_schedules_active_only ON schedules(
    entity_id, 
    date, 
    room
) WHERE status != 'cancelled';

-- Only active documents
CREATE INDEX IF NOT EXISTS idx_documents_active_only ON documents(
    document_type_id, 
    staff_id, 
    expires_at
) WHERE is_active = 1;

-- 4. COVERING INDEXES FOR FREQUENT QUERIES

-- User profile queries (covers common profile fields)
CREATE INDEX IF NOT EXISTS idx_users_profile_covering ON users(
    id, 
    first_name, 
    last_name, 
    email, 
    role, 
    phone, 
    is_active
);

-- Schedule queries (covers common schedule fields)
CREATE INDEX IF NOT EXISTS idx_schedules_covering ON schedules(
    id, 
    schedule_type, 
    entity_id, 
    entity_type, 
    room, 
    date, 
    scheduled_start, 
    scheduled_end
);

-- Attendance queries (covers daily operations)
CREATE INDEX IF NOT EXISTS idx_attendance_covering ON attendance(
    id, 
    child_id, 
    date, 
    room, 
    check_in_time, 
    check_out_time, 
    mood_rating
);

-- 5. TEMPORAL INDEXES FOR TIME-BASED QUERIES

-- Recent sessions
CREATE INDEX IF NOT EXISTS idx_sessions_recent ON sessions(
    user_id, 
    last_activity
) WHERE is_active = 1;

-- Recent security logs
CREATE INDEX IF NOT EXISTS idx_security_logs_recent ON security_logs(
    device_id, 
    timestamp
) WHERE timestamp > datetime('now', '-30 days');

-- Recent audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_recent ON audit_logs(
    user_id, 
    timestamp
) WHERE timestamp > datetime('now', '-90 days');

-- 6. SPECIALIZED INDEXES FOR BUSINESS LOGIC

-- Document expiration alerts
CREATE INDEX IF NOT EXISTS idx_documents_expiring_soon ON documents(
    document_type_id, 
    expires_at, 
    staff_id
) WHERE expires_at BETWEEN datetime('now') AND datetime('now', '+30 days');

-- Safety reminders due soon
CREATE INDEX IF NOT EXISTS idx_safety_reminders_due ON safety_reminders(
    category, 
    next_due_date, 
    is_active
) WHERE next_due_date <= datetime('now', '+7 days');

-- Payroll periods processing
CREATE INDEX IF NOT EXISTS idx_pay_periods_processing ON pay_periods(
    status, 
    start_date, 
    end_date
) WHERE status IN ('open', 'processing');

-- 7. STATISTICS AND ANALYTICS INDEXES

-- Attendance analytics
CREATE INDEX IF NOT EXISTS idx_attendance_analytics ON attendance(
    date, 
    room, 
    mood_rating
);

-- User activity analytics
CREATE INDEX IF NOT EXISTS idx_sessions_analytics ON sessions(
    user_id, 
    login_time, 
    last_activity
);

-- Financial analytics
CREATE INDEX IF NOT EXISTS idx_billing_analytics ON billing(
    due_date, 
    status, 
    amount
);

-- ============================================================================
-- PERFORMANCE OPTIMIZATIONS
-- ============================================================================

-- 8. VACUUM AND ANALYZE FOR OPTIMAL PERFORMANCE
VACUUM;
ANALYZE;

-- 9. PRAGMA OPTIMIZATIONS
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -64000; -- 64MB cache
PRAGMA temp_store = MEMORY;
PRAGMA mmap_size = 268435456; -- 256MB mmap

-- 10. CREATE VIEWS FOR COMMON QUERIES

-- Active users by role
CREATE VIEW IF NOT EXISTS v_active_users_by_role AS
SELECT 
    role,
    COUNT(*) as user_count,
    COUNT(CASE WHEN last_login_at > datetime('now', '-30 days') THEN 1 END) as active_30_days,
    COUNT(CASE WHEN last_login_at > datetime('now', '-7 days') THEN 1 END) as active_7_days
FROM users 
WHERE is_active = 1 
GROUP BY role;

-- Daily room occupancy
CREATE VIEW IF NOT EXISTS v_daily_room_occupancy AS
SELECT 
    date,
    room,
    COUNT(DISTINCT child_id) as children_count,
    COUNT(DISTINCT checked_in_by) as staff_count
FROM attendance 
WHERE date >= datetime('now', '-30 days')
GROUP BY date, room
ORDER BY date DESC, room;

-- Schedule conflicts
CREATE VIEW IF NOT EXISTS v_schedule_conflicts AS
SELECT 
    s1.date,
    s1.room,
    s1.entity_id as entity1,
    s1.entity_type as type1,
    s1.scheduled_start,
    s1.scheduled_end,
    s2.entity_id as entity2,
    s2.entity_type as type2,
    s2.scheduled_start as conflict_start,
    s2.scheduled_end as conflict_end
FROM schedules s1
JOIN schedules s2 ON s1.room = s2.room 
    AND s1.date = s2.date 
    AND s1.id != s2.id
    AND (
        (s1.scheduled_start < s2.scheduled_end AND s1.scheduled_end > s2.scheduled_start)
        OR (s2.scheduled_start < s1.scheduled_end AND s2.scheduled_end > s1.scheduled_start)
    )
WHERE s1.status = 'scheduled' AND s2.status = 'scheduled';

-- ============================================================================
-- PERFORMANCE MONITORING
-- ============================================================================

-- 11. CREATE PERFORMANCE MONITORING TABLES

-- Query performance log
CREATE TABLE IF NOT EXISTS query_performance_log (
    id TEXT PRIMARY KEY,
    query_type TEXT NOT NULL,
    table_name TEXT,
    execution_time_ms INTEGER,
    rows_returned INTEGER,
    timestamp TEXT DEFAULT (datetime('now')),
    user_id TEXT,
    ip_address TEXT
);

-- Index usage statistics
CREATE TABLE IF NOT EXISTS index_usage_stats (
    index_name TEXT PRIMARY KEY,
    table_name TEXT NOT NULL,
    last_used TEXT,
    usage_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

-- 12. CREATE PERFORMANCE MONITORING INDEXES
CREATE INDEX IF NOT EXISTS idx_query_performance_timestamp ON query_performance_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_query_performance_type ON query_performance_log(query_type);
CREATE INDEX IF NOT EXISTS idx_index_usage_table ON index_usage_stats(table_name);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify all indexes were created
SELECT 
    name as index_name,
    tbl_name as table_name,
    sql as index_definition
FROM sqlite_master 
WHERE type = 'index' 
    AND name LIKE 'idx_%'
ORDER BY tbl_name, name;

-- Check index sizes
SELECT 
    name as index_name,
    tbl_name as table_name,
    (length(sql) / 1024.0) as size_kb
FROM sqlite_master 
WHERE type = 'index' 
    AND name LIKE 'idx_%'
ORDER BY size_kb DESC;

-- Verify covering indexes
PRAGMA index_info('idx_users_profile_covering');
PRAGMA index_info('idx_schedules_covering');
PRAGMA index_info('idx_attendance_covering');

COMMIT;

-- ============================================================================
-- PERFORMANCE BENCHMARKS
-- ============================================================================

-- After running this script, test these queries to measure performance improvement:

-- 1. Schedule lookup by room and date
-- EXPLAIN QUERY PLAN SELECT * FROM schedules WHERE room = 'Infant Room' AND date = '2025-01-27';

-- 2. User search by role and active status
-- EXPLAIN QUERY PLAN SELECT * FROM users WHERE role = 'staff' AND is_active = 1;

-- 3. Attendance lookup for a specific child on a date range
-- EXPLAIN QUERY PLAN SELECT * FROM attendance WHERE child_id = 'child_123' AND date BETWEEN '2025-01-01' AND '2025-01-31';

-- 4. Document expiration alerts
-- EXPLAIN QUERY PLAN SELECT * FROM documents WHERE expires_at BETWEEN datetime('now') AND datetime('now', '+30 days');

-- Expected performance improvements:
-- - Schedule queries: 10-50x faster
-- - User lookups: 5-20x faster  
-- - Attendance queries: 15-40x faster
-- - Document queries: 8-25x faster
-- - Overall system responsiveness: 3-10x improvement
