# TotHub Database Schema Documentation

## Overview
This document describes the complete database schema for TotHub daycare management system.
Last Updated: 2025-08-05

## Table of Contents
1. [Core Tables](#core-tables)
2. [Session Management](#session-management)
3. [Financial Tables](#financial-tables)
4. [Security Tables](#security-tables)
5. [Schedule Management](#schedule-management)
6. [Communication](#communication)
7. [Document Management](#document-management)
8. [Safety & Compliance](#safety-compliance)
9. [User Management](#user-management)

## Core Tables

### children
Stores information about children enrolled in the daycare.
- **id** (varchar, PK): Unique identifier
- **first_name** (text, NOT NULL): Child's first name
- **last_name** (text, NOT NULL): Child's last name
- **date_of_birth** (date, NOT NULL): Birth date
- **room** (text, NOT NULL): Assigned classroom
- **medical_info** (text): Medical conditions/allergies
- **emergency_contact** (text): Emergency contact info
- **parent_id** (varchar): Reference to parents table
- **photo_url** (text): Profile photo URL
- **enrollment_date** (date): When child enrolled
- **is_active** (boolean): Active enrollment status
- **created_at** (timestamp): Record creation time

### parents
Parent/guardian information.
- **id** (varchar, PK): Unique identifier
- **username** (text, UNIQUE, NOT NULL): Login username
- **password_hash** (text, NOT NULL): Hashed password
- **first_name** (text, NOT NULL): Parent's first name
- **last_name** (text, NOT NULL): Parent's last name
- **email** (text, UNIQUE): Email address
- **phone** (text): Phone number
- **address** (text): Home address
- **emergency_contact** (text): Additional emergency contact
- **children_ids** (text[]): Array of child IDs
- **is_active** (boolean): Account status
- **created_at** (timestamp): Account creation time
- **last_login** (timestamp): Last login time

### staff
Staff member information.
- **id** (varchar, PK): Unique identifier
- **first_name** (text, NOT NULL): Staff first name
- **last_name** (text, NOT NULL): Staff last name
- **role** (text, NOT NULL): Job role/title
- **room** (text, NOT NULL): Assigned classroom
- **email** (text, UNIQUE): Email address
- **phone** (text): Phone number
- **hire_date** (date): Employment start date
- **certifications** (text[]): Array of certifications
- **is_active** (boolean): Employment status
- **created_at** (timestamp): Record creation time
- **hourly_rate** (integer): Pay rate in cents
- **qualifications** (text[]): Array of qualifications
- **employee_id** (text, UNIQUE): Employee ID number

### attendance
Daily attendance records for children.
- **id** (varchar, PK): Unique identifier
- **child_id** (varchar, FK -> children.id, NOT NULL): Child reference
- **check_in_time** (timestamp, NOT NULL): Check-in time
- **check_out_time** (timestamp): Check-out time
- **checked_in_by** (text, NOT NULL): Who checked child in
- **checked_out_by** (text): Who checked child out
- **room** (text, NOT NULL): Room assignment for the day
- **date** (timestamp, NOT NULL): Attendance date
- **check_in_photo_url** (text): Check-in photo
- **check_out_photo_url** (text): Check-out photo
- **notes** (text): Daily notes
- **mood_rating** (integer): Child's mood (1-5)
- **activities_completed** (text[]): Activities done
- **biometric_method** (text): Biometric verification type
- **biometric_confidence** (text): Confidence score
- **created_at** (timestamp): Record creation time

## Session Management

### sessions
User login sessions.
- **id** (text, PK): Session ID
- **user_id** (text, NOT NULL): User identifier
- **username** (text, NOT NULL): Username
- **role** (text, NOT NULL): User role
- **login_time** (timestamp, NOT NULL): Login timestamp
- **last_activity** (timestamp, NOT NULL): Last activity time
- **end_time** (timestamp): Logout time
- **is_active** (boolean): Session active status
- **ip_address** (text): Client IP
- **user_agent** (text): Browser info
- **end_reason** (text): Logout/expire reason

### session_activity
Detailed session activity logging.
- **id** (text, PK): Activity ID
- **session_id** (text, FK -> sessions.id): Session reference
- **action** (text, NOT NULL): Action performed
- **path** (text, NOT NULL): URL path
- **timestamp** (timestamp, NOT NULL): Action time
- **details** (text): Additional JSON data

### user_sessions
Alternative session tracking (may be redundant).
- **id** (text, PK): Session ID
- **username** (text): Username
- **ip_address** (text): Client IP
- **user_agent** (text): Browser info
- **login_time** (timestamp): Login time
- **is_active** (boolean): Active status

## Financial Tables

### billing
Monthly billing records.
- **id** (varchar, PK): Unique identifier
- **child_id** (varchar, FK -> children.id, NOT NULL): Child reference
- **period_start** (timestamp, NOT NULL): Billing period start
- **period_end** (timestamp, NOT NULL): Billing period end
- **attendance_days** (integer, NOT NULL): Days attended
- **tuition_amount** (integer, NOT NULL): Base tuition (cents)
- **extra_fees** (integer): Additional fees
- **total_amount** (integer, NOT NULL): Total due
- **status** (text): Payment status
- **quickbooks_id** (text): QuickBooks reference
- **due_date** (timestamp, NOT NULL): Payment due date
- **created_at** (timestamp): Record creation time

### pay_periods
Payroll period definitions.
- **id** (varchar, PK): Period ID
- **start_date** (timestamp, NOT NULL): Period start
- **end_date** (timestamp, NOT NULL): Period end
- **status** (text): Processing status
- **processed_at** (timestamp): When processed
- **processed_by** (text): Who processed
- **total_gross** (integer): Total gross pay
- **total_net** (integer): Total net pay
- **total_taxes** (integer): Total taxes
- **quickbooks_journal_id** (text): QB reference
- **created_at** (timestamp): Creation time

### pay_stubs
Individual employee pay stubs.
- **id** (varchar, PK): Pay stub ID
- **pay_period_id** (varchar, FK): Pay period reference
- **staff_id** (varchar, FK): Staff member
- **regular_hours** (real): Regular hours worked
- **overtime_hours** (real): OT hours
- **gross_pay** (integer): Gross pay (cents)
- **federal_tax** (integer): Federal withholding
- **state_tax** (integer): State withholding
- **social_security** (integer): SS withholding
- **medicare** (integer): Medicare withholding
- **net_pay** (integer): Take-home pay
- **pay_date** (timestamp): Payment date
- **check_number** (text): Check/transfer number
- **created_at** (timestamp): Creation time

### timesheet_entries
Staff time tracking.
- **id** (varchar, PK): Entry ID
- **staff_id** (varchar, FK): Staff member
- **date** (timestamp, NOT NULL): Work date
- **clock_in** (timestamp): Clock in time
- **clock_out** (timestamp): Clock out time
- **break_minutes** (integer): Break duration
- **total_hours** (real): Total hours
- **approved** (boolean): Approval status
- **approved_by** (text): Approver
- **notes** (text): Time entry notes
- **created_at** (timestamp): Creation time

### payroll_reports
Generated payroll reports.
- **id** (varchar, PK): Report ID
- **pay_period_id** (varchar, FK): Pay period
- **report_type** (text): Report type
- **generated_at** (timestamp): Generation time
- **generated_by** (text): Generator
- **file_path** (text): Report file location
- **quickbooks_file** (text): QB export file

### payroll_audit
Payroll change audit trail.
- **id** (varchar, PK): Audit ID
- **pay_stub_id** (varchar, FK): Pay stub affected
- **changed_by** (text): Who made change
- **changed_at** (timestamp): When changed
- **field_name** (text): What changed
- **old_value** (text): Previous value
- **new_value** (text): New value
- **reason** (text): Change reason

## Security Tables

### security_zones
Physical security zones.
- **id** (text, PK): Zone ID
- **zone_name** (text, NOT NULL): Zone name
- **zone_type** (text): Zone type
- **location** (text): Physical location
- **access_level** (text): Required access level
- **is_active** (boolean): Zone active status
- **created_at** (timestamp): Creation time

### security_devices
Security device registry.
- **id** (text, PK): Device ID
- **device_type** (text, NOT NULL): Device type
- **device_name** (text): Device name
- **zone_id** (text, FK): Security zone
- **mac_address** (text, UNIQUE): MAC address
- **ip_address** (text): IP address
- **status** (text): Device status
- **last_seen** (timestamp): Last activity
- **firmware_version** (text): Firmware version
- **created_at** (timestamp): Registration time

### security_credentials
Access credentials (needs hashing!).
- **id** (text, PK): Credential ID
- **user_id** (text): User reference
- **credential_type** (text): Type (card/pin/bio)
- **credential_value** (text): Value (NEEDS HASH)
- **is_active** (boolean): Active status
- **expires_at** (timestamp): Expiration
- **created_at** (timestamp): Creation time

### security_logs
Security event logging.
- **id** (text, PK): Log ID
- **event_type** (text, NOT NULL): Event type
- **event_time** (timestamp, NOT NULL): Event time
- **zone_id** (text, FK): Zone affected
- **device_id** (text, FK): Device involved
- **user_id** (text): User involved
- **credential_id** (text, FK): Credential used
- **result** (text): Success/failure
- **details** (text): Additional info
- **alert_triggered** (boolean): Alert sent?

## Schedule Management

### staff_schedules
Staff work schedules.
- **id** (varchar, PK): Schedule ID
- **staff_id** (varchar, FK -> staff.id): Staff member
- **room** (text, NOT NULL): Assigned room
- **date** (timestamp, NOT NULL): Work date
- **scheduled_start** (timestamp, NOT NULL): Start time
- **scheduled_end** (timestamp, NOT NULL): End time
- **actual_start** (timestamp): Actual start
- **actual_end** (timestamp): Actual end
- **is_present** (boolean): Currently present
- **created_at** (timestamp): Creation time

### child_schedules
Child attendance schedules.
- **id** (varchar, PK): Schedule ID
- **child_id** (varchar, FK -> children.id): Child
- **room** (text, NOT NULL): Room assignment
- **date** (timestamp, NOT NULL): Schedule date
- **scheduled_arrival** (timestamp, NOT NULL): Expected arrival
- **scheduled_departure** (timestamp, NOT NULL): Expected departure
- **actual_arrival** (timestamp): Actual arrival
- **actual_departure** (timestamp): Actual departure
- **is_present** (boolean): Currently present
- **schedule_type** (text): Regular/special
- **is_recurring** (boolean): Recurring schedule
- **recurring_pattern** (text): Pattern type
- **recurring_days** (text[]): Days of week
- **recurring_until** (timestamp): End date
- **meal_plan** (text[]): Meal preferences

### room_schedules
Room-level schedules.
- **id** (varchar, PK): Schedule ID
- **room_name** (text, NOT NULL): Room name
- **date** (timestamp, NOT NULL): Schedule date
- **capacity** (integer): Max capacity
- **assigned_staff** (integer): Staff count
- **enrolled_children** (integer): Child count
- **activities** (text[]): Planned activities
- **meal_times** (text): Meal schedule JSON
- **created_at** (timestamp): Creation time

### schedule_templates
Reusable schedule templates.
- **id** (varchar, PK): Template ID
- **template_name** (text, NOT NULL): Template name
- **template_type** (text): Staff/child/room
- **room** (text): Room assignment
- **start_time** (time): Start time
- **end_time** (time): End time
- **days_of_week** (text[]): Active days
- **is_active** (boolean): Template active
- **created_at** (timestamp): Creation time

## Communication

### messages
Parent-staff messaging.
- **id** (varchar, PK): Message ID
- **parent_id** (varchar, FK): Parent sender
- **staff_id** (varchar, FK): Staff recipient
- **subject** (text): Message subject
- **content** (text, NOT NULL): Message body
- **is_read** (boolean): Read status
- **read_at** (timestamp): When read
- **priority** (text): Priority level
- **attachment_urls** (text[]): File attachments
- **created_at** (timestamp): Send time

### media_shares
Photo/video sharing.
- **id** (varchar, PK): Media ID
- **child_id** (varchar, FK): Child in media
- **media_type** (text, NOT NULL): photo/video
- **media_url** (text, NOT NULL): File URL
- **caption** (text): Description
- **shared_with_parents** (boolean): Parent visibility
- **uploaded_by** (text): Uploader
- **tags** (text[]): Media tags
- **created_at** (timestamp): Upload time

### daily_reports
Daily activity reports.
- **id** (varchar, PK): Report ID
- **child_id** (varchar, FK): Child
- **date** (timestamp, NOT NULL): Report date
- **activities** (text[]): Activities done
- **meals** (text): Meal details JSON
- **naps** (text): Nap times JSON
- **mood_summary** (text): Mood description
- **behavior_notes** (text): Behavior notes
- **learning_activities** (text[]): Learning done
- **photo_urls** (text[]): Daily photos
- **created_by** (text): Report author
- **sent_to_parents** (boolean): Email sent
- **created_at** (timestamp): Creation time

### teacher_notes
Teacher observations.
- **id** (varchar, PK): Note ID
- **child_id** (varchar, FK): Child observed
- **teacher_id** (varchar): Teacher author
- **date** (timestamp): Observation date
- **note_type** (text): Note category
- **content** (text, NOT NULL): Note content
- **is_private** (boolean): Staff-only note
- **follow_up_required** (boolean): Needs action
- **created_at** (timestamp): Creation time

## Document Management

### document_types
Document type definitions.
- **id** (text, PK): Type ID
- **name** (text, NOT NULL): Type name
- **category** (text, NOT NULL): Category
- **description** (text): Description
- **is_required** (boolean): Required doc
- **renewal_frequency** (text): Renewal period
- **custom_frequency_days** (integer): Custom days
- **alert_days_before** (integer): Alert timing
- **regulatory_body** (text): Regulator
- **compliance_notes** (text): Requirements
- **created_at** (timestamp): Creation time
- **updated_at** (timestamp): Last update

### documents
Document instances.
- **id** (text, PK): Document ID
- **document_type_id** (text, FK): Type reference
- **title** (text, NOT NULL): Document title
- **description** (text): Description
- **issue_date** (timestamp, NOT NULL): Issue date
- **expiration_date** (timestamp, NOT NULL): Expiry date
- **status** (text, NOT NULL): Current status
- **document_number** (text): Doc number
- **issuing_authority** (text): Issuer
- **contact_info** (text): Renewal contact
- **file_path** (text): File location
- **last_reminder_sent** (timestamp): Last alert
- **is_active** (boolean): Active status
- **created_by** (text, NOT NULL): Creator
- **updated_by** (text): Last updater
- **created_at** (timestamp): Creation time
- **updated_at** (timestamp): Last update

### document_reminders
Document expiry reminders.
- **id** (text, PK): Reminder ID
- **document_id** (text, FK): Document
- **reminder_type** (text, NOT NULL): Type
- **reminder_date** (timestamp, NOT NULL): When to send
- **message** (text, NOT NULL): Reminder text
- **sent_at** (timestamp): When sent
- **acknowledged_at** (timestamp): When ack'd
- **acknowledged_by** (text): Who ack'd
- **priority** (text): Priority level
- **is_active** (boolean): Active reminder
- **created_at** (timestamp): Creation time

### document_renewals
Document renewal history.
- **id** (text, PK): Renewal ID
- **document_id** (text, FK): Document
- **previous_expiration_date** (timestamp, NOT NULL): Old expiry
- **new_expiration_date** (timestamp, NOT NULL): New expiry
- **renewal_date** (timestamp, NOT NULL): When renewed
- **cost** (text): Renewal cost
- **processed_by** (text, NOT NULL): Processor
- **notes** (text): Renewal notes
- **file_path** (text): New doc file
- **created_at** (timestamp): Creation time

## Safety & Compliance

### safety_reminders
Safety check reminders.
- **id** (text, PK): Reminder ID
- **reminder_type** (text, NOT NULL): Type
- **title** (text, NOT NULL): Title
- **description** (text): Description
- **frequency** (text, NOT NULL): How often
- **assigned_to** (text): Assignee
- **last_completed** (timestamp): Last done
- **next_due** (timestamp): Next due
- **is_active** (boolean): Active status
- **priority** (text): Priority level
- **compliance_category** (text): Category
- **created_at** (timestamp): Creation time
- **updated_at** (timestamp): Last update

### safety_reminder_completions
Safety check completion log.
- **id** (text, PK): Completion ID
- **reminder_id** (text, FK): Reminder
- **completed_by** (text, NOT NULL): Who completed
- **completed_at** (timestamp, NOT NULL): When done
- **notes** (text): Completion notes
- **photo_urls** (text[]): Evidence photos
- **next_due_date** (timestamp): Next scheduled

### state_compliance
State regulatory compliance.
- **id** (varchar, PK): Compliance ID
- **state** (text, NOT NULL): US state
- **last_audit_date** (timestamp): Last audit
- **next_audit_date** (timestamp): Next audit
- **compliance_status** (text): Status
- **audit_notes** (text): Audit findings
- **created_at** (timestamp): Creation time
- **updated_at** (timestamp): Last update

### state_ratios
State-mandated staff:child ratios.
- **state** (text, PK): US state code
- **infant_ratio** (text): Infant ratio
- **toddler_ratio** (text): Toddler ratio
- **preschool_ratio** (text): Preschool ratio
- **school_age_ratio** (text): School age ratio
- **max_group_size_infant** (integer): Max infant group
- **max_group_size_toddler** (integer): Max toddler group
- **max_group_size_preschool** (integer): Max preschool
- **max_group_size_school_age** (integer): Max school age
- **notes** (text): Additional rules
- **updated_at** (timestamp): Last update

## User Management

### user_profiles
User profile information.
- **id** (varchar, PK): Profile ID
- **user_id** (varchar, UNIQUE, NOT NULL): User reference
- **username** (text, NOT NULL): Username
- **email** (text): Email address
- **role** (text, NOT NULL): User role
- **first_name** (text, NOT NULL): First name
- **last_name** (text, NOT NULL): Last name
- **phone_number** (text): Phone
- **date_of_birth** (timestamp): Birth date
- **street** (text): Street address
- **city** (text): City
- **state** (text): State
- **zip_code** (text): ZIP code
- **job_title** (text): Job title
- **department** (text): Department
- **employee_id** (text): Employee ID
- **hire_date** (timestamp): Hire date
- **children_ids** (text[]): Parent's children
- **emergency_contact** (text): Emergency info
- **profile_picture_url** (text): Profile photo
- **bio** (text): Bio text
- **preferred_language** (text): Language pref
- **notification_preferences** (text): Notif settings
- **is_active** (boolean): Active status
- **last_login_at** (timestamp): Last login
- **created_at** (timestamp): Creation time
- **updated_at** (timestamp): Last update

### user_roles
User role assignments.
- **id** (varchar, PK): Role ID
- **user_id** (varchar): User reference
- **role** (text, NOT NULL): Role name
- **permissions** (text[]): Permissions list
- **assigned_at** (timestamp): Assignment time
- **assigned_by** (text): Who assigned
- **is_active** (boolean): Active status

### settings
System configuration.
- **key** (text, PK): Setting key
- **value** (text, NOT NULL): Setting value
- **description** (text): What it does
- **updated_at** (timestamp): Last change
- **updated_by** (text): Who changed

### alerts
System alerts/notifications.
- **id** (varchar, PK): Alert ID
- **type** (text, NOT NULL): Alert type
- **message** (text, NOT NULL): Alert message
- **room** (text): Room affected
- **severity** (text, NOT NULL): Severity level
- **is_read** (boolean): Read status
- **created_at** (timestamp): Creation time

## Issues Identified

### Missing Foreign Keys
1. parents.children_ids should reference children.id
2. staff_schedules.staff_id needs FK to staff.id
3. messages tables need proper FKs
4. Many junction tables missing

### Security Issues
1. security_credentials.credential_value needs hashing
2. No audit trail for sensitive operations
3. Missing data encryption markers

### Performance Issues
1. No indexes on frequently queried fields
2. session_activity will grow large - needs indexing
3. attendance queries need date indexes

### Redundancy
1. sessions vs user_sessions - consolidate
2. Multiple schedule tables could be unified

### Empty/Unused Tables
Several tables appear empty and may need seeding or removal.