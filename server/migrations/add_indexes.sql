-- Performance indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_children_age_group ON children(age_group);
CREATE INDEX IF NOT EXISTS idx_children_room ON children(room);
CREATE INDEX IF NOT EXISTS idx_children_is_active ON children(is_active);
-- Removed: children.enrollment_status does not exist in current schema

CREATE INDEX IF NOT EXISTS idx_staff_position ON staff(position);
CREATE INDEX IF NOT EXISTS idx_staff_is_active ON staff(is_active);

CREATE INDEX IF NOT EXISTS idx_attendance_child_id ON attendance(child_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_check_in ON attendance(check_in_time);
CREATE INDEX IF NOT EXISTS idx_attendance_check_out ON attendance(check_out_time);

CREATE INDEX IF NOT EXISTS idx_staff_schedules_staff_id ON staff_schedules(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_date ON staff_schedules(date);

CREATE INDEX IF NOT EXISTS idx_alerts_is_read ON alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);

CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_logs(timestamp);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_attendance_child_date ON attendance(child_id, date);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_staff_date ON staff_schedules(staff_id, date);