-- Add indexes for performance optimization

-- Children table indexes
CREATE INDEX IF NOT EXISTS idx_children_parent_email ON children(parent_email);
-- Removed: children.state does not exist in current schema
CREATE INDEX IF NOT EXISTS idx_children_date_of_birth ON children(date_of_birth);
CREATE INDEX IF NOT EXISTS idx_children_created_at ON children(created_at);

-- Staff table indexes
-- Removed: staff.username and staff.role do not exist in current schema
CREATE INDEX IF NOT EXISTS idx_staff_created_at ON staff(created_at);

-- Attendance table indexes
CREATE INDEX IF NOT EXISTS idx_attendance_child_id ON attendance(child_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_check_in_time ON attendance(check_in_time);
CREATE INDEX IF NOT EXISTS idx_attendance_check_out_time ON attendance(check_out_time);
CREATE INDEX IF NOT EXISTS idx_attendance_child_date ON attendance(child_id, date);

-- Alerts table indexes
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);
-- Removed: alerts.acknowledged does not exist in current schema; using is_acknowledged instead
CREATE INDEX IF NOT EXISTS idx_alerts_is_acknowledged ON alerts(is_acknowledged);

-- Staff schedules indexes
CREATE INDEX IF NOT EXISTS idx_staff_schedules_staff_id ON staff_schedules(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_date ON staff_schedules(date);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_staff_date ON staff_schedules(staff_id, date);

-- Settings indexes
-- Removed: settings table not present in current schema