--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: neondb_owner
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO neondb_owner;

--
-- Name: age_group; Type: TYPE; Schema: public; Owner: neondb_owner
--

CREATE TYPE public.age_group AS ENUM (
    'infant',
    'young_toddler',
    'toddler',
    'preschool',
    'school_age',
    'older_school_age'
);


ALTER TYPE public.age_group OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: neondb_owner
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO neondb_owner;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: neondb_owner
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO neondb_owner;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: neondb_owner
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: alerts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.alerts (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    type text NOT NULL,
    message text NOT NULL,
    room text,
    severity text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.alerts OWNER TO neondb_owner;

--
-- Name: attendance; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.attendance (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    child_id character varying NOT NULL,
    check_in_time timestamp without time zone NOT NULL,
    check_out_time timestamp without time zone,
    checked_in_by text NOT NULL,
    checked_out_by text,
    room text NOT NULL,
    date timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    check_in_photo_url text,
    check_out_photo_url text,
    notes text,
    mood_rating integer,
    activities_completed text[] DEFAULT '{}'::text[],
    biometric_method text,
    biometric_confidence text
);


ALTER TABLE public.attendance OWNER TO neondb_owner;

--
-- Name: billing; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.billing (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    child_id character varying NOT NULL,
    period_start timestamp without time zone NOT NULL,
    period_end timestamp without time zone NOT NULL,
    attendance_days integer NOT NULL,
    tuition_amount integer NOT NULL,
    extra_fees integer DEFAULT 0,
    total_amount integer NOT NULL,
    status text DEFAULT 'pending'::text,
    quickbooks_id text,
    due_date timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.billing OWNER TO neondb_owner;

--
-- Name: child_schedules; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.child_schedules (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    child_id character varying NOT NULL,
    room text NOT NULL,
    date timestamp without time zone NOT NULL,
    scheduled_arrival timestamp without time zone NOT NULL,
    scheduled_departure timestamp without time zone NOT NULL,
    actual_arrival timestamp without time zone,
    actual_departure timestamp without time zone,
    is_present boolean DEFAULT false,
    schedule_type text DEFAULT 'regular'::text,
    is_recurring boolean DEFAULT true,
    recurring_pattern text DEFAULT 'weekly'::text,
    recurring_days text[] DEFAULT '{}'::text[],
    recurring_until timestamp without time zone,
    meal_plan text[] DEFAULT '{}'::text[],
    nap_time text,
    special_needs text,
    notes text,
    parent_approved boolean DEFAULT false,
    status text DEFAULT 'scheduled'::text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.child_schedules OWNER TO neondb_owner;

--
-- Name: children; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.children (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    date_of_birth timestamp without time zone NOT NULL,
    age_group public.age_group NOT NULL,
    room text NOT NULL,
    parent_name text NOT NULL,
    parent_email text,
    parent_phone text,
    emergency_contact_name text,
    emergency_contact_phone text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    allergies text[] DEFAULT '{}'::text[],
    medical_notes text,
    immunizations text[] DEFAULT '{}'::text[],
    profile_photo_url text,
    enrollment_date timestamp without time zone DEFAULT now(),
    tuition_rate integer,
    face_descriptor text,
    fingerprint_hash text,
    biometric_enrolled_at timestamp without time zone,
    biometric_enabled boolean DEFAULT false,
    medical_conditions text[] DEFAULT '{}'::text[],
    blood_type text,
    primary_physician text,
    current_medications text,
    dietary_restrictions text[] DEFAULT '{}'::text[],
    food_allergies text[] DEFAULT '{}'::text[],
    special_care_instructions text,
    physical_limitations text,
    emergency_medical_authorization boolean DEFAULT false,
    epi_pen_required boolean DEFAULT false,
    inhaler_required boolean DEFAULT false,
    physician_phone text,
    pediatrician_name text,
    pediatrician_phone text,
    preferred_hospital text,
    insurance_provider text,
    insurance_policy_number text,
    insurance_group_number text,
    medical_action_plan text,
    immunization_records text,
    immunization_exemptions text[] DEFAULT '{}'::text[],
    next_immunization_due timestamp without time zone,
    last_health_check timestamp without time zone,
    health_check_notes text,
    unenrollment_date timestamp without time zone,
    enrollment_status text DEFAULT 'enrolled'::text,
    unenrollment_reason text,
    stripe_customer_id text,
    stripe_subscription_id text,
    subscription_status text
);


ALTER TABLE public.children OWNER TO neondb_owner;

--
-- Name: daily_reports; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.daily_reports (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    child_id character varying NOT NULL,
    date timestamp without time zone NOT NULL,
    attendance_status text NOT NULL,
    meals text[] DEFAULT '{}'::text[],
    nap_notes text,
    activities text[] DEFAULT '{}'::text[],
    behavior_notes text,
    photo_urls text[] DEFAULT '{}'::text[],
    is_generated boolean DEFAULT false,
    sent_to_parent boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.daily_reports OWNER TO neondb_owner;

--
-- Name: document_reminders; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.document_reminders (
    id text DEFAULT gen_random_uuid() NOT NULL,
    document_id text NOT NULL,
    reminder_type text NOT NULL,
    reminder_date timestamp without time zone NOT NULL,
    message text NOT NULL,
    sent_at timestamp without time zone,
    acknowledged_at timestamp without time zone,
    acknowledged_by text,
    priority text DEFAULT 'medium'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.document_reminders OWNER TO neondb_owner;

--
-- Name: document_renewals; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.document_renewals (
    id text DEFAULT gen_random_uuid() NOT NULL,
    document_id text NOT NULL,
    previous_expiration_date timestamp without time zone NOT NULL,
    new_expiration_date timestamp without time zone NOT NULL,
    renewal_date timestamp without time zone DEFAULT now() NOT NULL,
    cost text,
    processed_by text NOT NULL,
    notes text,
    file_path text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.document_renewals OWNER TO neondb_owner;

--
-- Name: document_types; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.document_types (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    category text NOT NULL,
    description text,
    is_required boolean DEFAULT true NOT NULL,
    renewal_frequency text NOT NULL,
    custom_frequency_days integer,
    alert_days_before integer DEFAULT 30 NOT NULL,
    regulatory_body text,
    compliance_notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.document_types OWNER TO neondb_owner;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.documents (
    id text DEFAULT gen_random_uuid() NOT NULL,
    document_type_id text NOT NULL,
    title text NOT NULL,
    description text,
    issue_date timestamp without time zone NOT NULL,
    expiration_date timestamp without time zone NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    document_number text,
    issuing_authority text,
    contact_info text,
    file_path text,
    last_reminder_sent timestamp without time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_by text NOT NULL,
    updated_by text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.documents OWNER TO neondb_owner;

--
-- Name: media_shares; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.media_shares (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    child_id character varying NOT NULL,
    staff_id character varying NOT NULL,
    media_url text NOT NULL,
    media_type text NOT NULL,
    caption text,
    is_visible boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.media_shares OWNER TO neondb_owner;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.messages (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    sender_id character varying NOT NULL,
    recipient_type text NOT NULL,
    recipient_id character varying,
    subject text,
    content text NOT NULL,
    attachment_urls text[] DEFAULT '{}'::text[],
    is_read boolean DEFAULT false,
    priority text DEFAULT 'normal'::text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.messages OWNER TO neondb_owner;

--
-- Name: parents; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.parents (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    username character varying(255) NOT NULL,
    password_hash text NOT NULL,
    email text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text,
    children_ids text[] DEFAULT '{}'::text[],
    last_login timestamp without time zone,
    email_verified boolean DEFAULT false,
    reset_token text,
    reset_token_expiry timestamp without time zone,
    notification_preferences text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.parents OWNER TO neondb_owner;

--
-- Name: pay_periods; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.pay_periods (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    pay_date date NOT NULL,
    status text DEFAULT 'open'::text,
    total_gross_pay integer DEFAULT 0,
    total_net_pay integer DEFAULT 0,
    total_taxes integer DEFAULT 0,
    processed_by text,
    processed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.pay_periods OWNER TO neondb_owner;

--
-- Name: pay_stubs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.pay_stubs (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    staff_id text NOT NULL,
    pay_period_id text NOT NULL,
    regular_hours integer DEFAULT 0,
    overtime_hours integer DEFAULT 0,
    total_hours integer DEFAULT 0,
    regular_pay integer DEFAULT 0,
    overtime_pay integer DEFAULT 0,
    gross_pay integer DEFAULT 0,
    federal_tax integer DEFAULT 0,
    state_tax integer DEFAULT 0,
    social_security_tax integer DEFAULT 0,
    medicare_tax integer DEFAULT 0,
    health_insurance integer DEFAULT 0,
    retirement_401k integer DEFAULT 0,
    other_deductions integer DEFAULT 0,
    total_deductions integer DEFAULT 0,
    net_pay integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.pay_stubs OWNER TO neondb_owner;

--
-- Name: payroll_audit; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.payroll_audit (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    table_name text NOT NULL,
    record_id text NOT NULL,
    action text NOT NULL,
    old_values jsonb,
    new_values jsonb,
    changed_by text,
    changed_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.payroll_audit OWNER TO neondb_owner;

--
-- Name: payroll_reports; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.payroll_reports (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    pay_period_id text NOT NULL,
    report_type text NOT NULL,
    report_data jsonb,
    generated_by text,
    generated_at timestamp without time zone DEFAULT now(),
    report_pdf_url text
);


ALTER TABLE public.payroll_reports OWNER TO neondb_owner;

--
-- Name: room_schedules; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.room_schedules (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    room text NOT NULL,
    date timestamp without time zone NOT NULL,
    time_slot text NOT NULL,
    max_capacity integer NOT NULL,
    current_occupancy integer DEFAULT 0,
    staff_required integer NOT NULL,
    staff_assigned integer DEFAULT 0,
    is_available boolean DEFAULT true,
    activities text[] DEFAULT '{}'::text[],
    special_requirements text,
    notes text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.room_schedules OWNER TO neondb_owner;

--
-- Name: safety_reminder_completions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.safety_reminder_completions (
    id text DEFAULT gen_random_uuid() NOT NULL,
    reminder_id text NOT NULL,
    completed_at timestamp without time zone DEFAULT now() NOT NULL,
    completed_by text NOT NULL,
    notes text,
    next_scheduled_date timestamp without time zone,
    attachments text[] DEFAULT '{}'::text[]
);


ALTER TABLE public.safety_reminder_completions OWNER TO neondb_owner;

--
-- Name: safety_reminders; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.safety_reminders (
    id text DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    category text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    frequency text NOT NULL,
    custom_interval integer,
    next_due_date timestamp without time zone NOT NULL,
    last_completed_date timestamp without time zone,
    is_active boolean DEFAULT true NOT NULL,
    is_paused boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    created_by text NOT NULL,
    assigned_to text,
    completion_notes text,
    alert_days_before integer DEFAULT 3 NOT NULL
);


ALTER TABLE public.safety_reminders OWNER TO neondb_owner;

--
-- Name: schedule_templates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.schedule_templates (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    entity_type text NOT NULL,
    template_data text NOT NULL,
    is_active boolean DEFAULT true,
    created_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.schedule_templates OWNER TO neondb_owner;

--
-- Name: security_credentials; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.security_credentials (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    device_id character varying NOT NULL,
    credential_type text NOT NULL,
    credential_data text NOT NULL,
    is_active boolean DEFAULT true,
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.security_credentials OWNER TO neondb_owner;

--
-- Name: security_devices; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.security_devices (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    location text NOT NULL,
    connection_type text NOT NULL,
    connection_config text NOT NULL,
    is_enabled boolean DEFAULT true,
    unlock_duration integer DEFAULT 5,
    fail_safe_mode text DEFAULT 'secure'::text,
    last_ping timestamp without time zone,
    status text DEFAULT 'offline'::text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.security_devices OWNER TO neondb_owner;

--
-- Name: security_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.security_logs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    device_id character varying NOT NULL,
    user_id text,
    action text NOT NULL,
    method text,
    success boolean NOT NULL,
    details text,
    ip_address text,
    "timestamp" timestamp without time zone DEFAULT now()
);


ALTER TABLE public.security_logs OWNER TO neondb_owner;

--
-- Name: security_zones; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.security_zones (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    device_ids text[] DEFAULT '{}'::text[],
    access_rules text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.security_zones OWNER TO neondb_owner;

--
-- Name: session_activity; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.session_activity (
    id text DEFAULT gen_random_uuid() NOT NULL,
    session_id text NOT NULL,
    action text NOT NULL,
    path text,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL,
    details text
);


ALTER TABLE public.session_activity OWNER TO neondb_owner;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sessions (
    id text NOT NULL,
    user_id text NOT NULL,
    username text NOT NULL,
    role text NOT NULL,
    login_time timestamp without time zone DEFAULT now() NOT NULL,
    last_activity timestamp without time zone DEFAULT now() NOT NULL,
    end_time timestamp without time zone,
    ip_address text,
    user_agent text,
    is_active boolean DEFAULT true NOT NULL,
    end_reason text
);


ALTER TABLE public.sessions OWNER TO neondb_owner;

--
-- Name: settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.settings (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.settings OWNER TO neondb_owner;

--
-- Name: staff; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.staff (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text,
    phone text,
    "position" text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    face_descriptor text,
    fingerprint_hash text,
    biometric_enrolled_at timestamp without time zone,
    biometric_enabled boolean DEFAULT false,
    employee_number text,
    hourly_rate integer,
    salary_amount integer,
    pay_type text DEFAULT 'hourly'::text,
    tax_filing_status text DEFAULT 'single'::text,
    w4_allowances integer DEFAULT 0,
    additional_tax_withholding integer DEFAULT 0,
    direct_deposit_account text,
    direct_deposit_routing text
);


ALTER TABLE public.staff OWNER TO neondb_owner;

--
-- Name: staff_schedules; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.staff_schedules (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    staff_id character varying NOT NULL,
    room text NOT NULL,
    scheduled_start timestamp without time zone NOT NULL,
    scheduled_end timestamp without time zone NOT NULL,
    actual_start timestamp without time zone,
    actual_end timestamp without time zone,
    date timestamp without time zone NOT NULL,
    is_present boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    schedule_type text DEFAULT 'regular'::text,
    is_recurring boolean DEFAULT false,
    recurring_pattern text,
    recurring_until timestamp without time zone,
    notes text,
    approved_by character varying,
    status text DEFAULT 'scheduled'::text
);


ALTER TABLE public.staff_schedules OWNER TO neondb_owner;

--
-- Name: state_compliance; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.state_compliance (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    state text DEFAULT 'West Virginia'::text NOT NULL,
    ratios_data text NOT NULL,
    federal_compliance text[] DEFAULT '{COPPA,HIPAA,FERPA}'::text[],
    additional_rules text,
    is_active boolean DEFAULT true,
    last_updated timestamp without time zone DEFAULT now(),
    audit_log text[] DEFAULT '{}'::text[],
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.state_compliance OWNER TO neondb_owner;

--
-- Name: state_ratios; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.state_ratios (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    state text NOT NULL,
    six_weeks text NOT NULL,
    nine_months text NOT NULL,
    eighteen_months text NOT NULL,
    twenty_seven_months text NOT NULL,
    three_years text NOT NULL,
    four_years text NOT NULL,
    five_years text NOT NULL,
    six_years text NOT NULL,
    seven_years text NOT NULL,
    eight_nine_years text NOT NULL,
    ten_plus_years text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.state_ratios OWNER TO neondb_owner;

--
-- Name: teacher_notes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.teacher_notes (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    child_id character varying NOT NULL,
    staff_id character varying NOT NULL,
    date timestamp without time zone NOT NULL,
    note text NOT NULL,
    category text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.teacher_notes OWNER TO neondb_owner;

--
-- Name: timesheet_entries; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.timesheet_entries (
    id text DEFAULT (gen_random_uuid())::text NOT NULL,
    staff_id text NOT NULL,
    pay_period_id text,
    date date NOT NULL,
    clock_in_time timestamp without time zone,
    clock_out_time timestamp without time zone,
    break_minutes integer DEFAULT 0,
    regular_hours integer DEFAULT 0,
    overtime_hours integer DEFAULT 0,
    total_hours integer DEFAULT 0,
    hourly_rate integer,
    notes text,
    is_approved boolean DEFAULT false,
    approved_by text,
    approved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.timesheet_entries OWNER TO neondb_owner;

--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_profiles (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    username text NOT NULL,
    email text,
    role text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone_number text,
    date_of_birth timestamp without time zone,
    street text,
    city text,
    state text,
    zip_code text,
    job_title text,
    department text,
    employee_id text,
    hire_date timestamp without time zone,
    children_ids text[] DEFAULT '{}'::text[],
    emergency_contact text,
    profile_picture_url text,
    bio text,
    preferred_language text DEFAULT 'en'::text,
    notification_preferences text,
    is_active boolean DEFAULT true,
    last_login_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_profiles OWNER TO neondb_owner;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_roles (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    staff_id character varying NOT NULL,
    role text NOT NULL,
    permissions text[] DEFAULT '{}'::text[],
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_roles OWNER TO neondb_owner;

--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_sessions (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.user_sessions OWNER TO neondb_owner;

--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: neondb_owner
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: neondb_owner
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
\.


--
-- Data for Name: alerts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.alerts (id, type, message, room, severity, is_read, created_at) FROM stdin;
cf2e9902-ecba-41c6-88ee-1f77515ad2bf	general	Updated compliance settings for West Virginia - review for compliance.	\N	medium	f	2025-07-25 14:11:44.550527
3f2ccfde-4a30-44c6-a611-6f240c9eecfd	general	Updated compliance settings for California - review for compliance.	\N	medium	f	2025-07-25 14:11:56.322808
96dce9cf-db21-4ae6-8049-7c725b0d83e6	general	Updated compliance settings for New York - review for compliance.	\N	medium	f	2025-07-25 14:12:35.350315
de918b77-7482-4716-88f6-37e16b9d9486	general	Updated compliance settings for California - review for compliance.	\N	medium	f	2025-07-25 14:13:09.786368
71bc7b36-fa4c-417d-a108-998f6698d375	RATIO_VIOLATION	Additional staff needed in School Age to meet required ratios	\N	HIGH	f	2025-07-29 13:39:08.235862
cfb5b46d-a03e-44f2-b5d3-358fe2ec4dd9	High Memory Usage	Alert: High Memory Usage	\N	critical	f	2025-08-01 14:24:34.463033
01c5954c-6730-4eb9-8da0-84a0c9ef7937	High Memory Usage	Alert: High Memory Usage	\N	critical	f	2025-08-01 14:27:18.486846
2cda27de-c2ad-4204-b63b-c825e19ea379	High Memory Usage	Alert: High Memory Usage	\N	critical	f	2025-08-01 15:56:03.502722
b5ee902d-ba94-4b35-877d-66d6bae915be	High Memory Usage	Alert: High Memory Usage	\N	critical	f	2025-08-01 16:56:21.573011
7f410275-61cd-4217-8282-10f8329ee2a6	High Memory Usage	Alert: High Memory Usage	\N	critical	f	2025-08-01 16:57:36.640512
c65aef82-26ee-4e57-b8e6-a7037c5e334c	High Memory Usage	Alert: High Memory Usage	\N	critical	f	2025-08-01 16:58:25.581304
c583a88e-fc30-49ff-a3b2-0bb6ece68a09	High Memory Usage	Alert: High Memory Usage	\N	critical	f	2025-08-01 17:23:18.406011
13a9cdcc-0dd7-4f0d-8649-88a8cd24bd61	High Memory Usage	Alert: High Memory Usage	\N	critical	f	2025-08-05 16:06:22.430786
bdc171c7-f808-4d09-b88e-cc4b30925c65	High Memory Usage	Alert: High Memory Usage	\N	critical	f	2025-08-05 16:22:47.409781
90d9d1fd-2000-49ee-9a06-c9bf7c3602b8	High Memory Usage	Alert: High Memory Usage	\N	critical	f	2025-08-05 16:29:18.514737
b121d94f-270d-4463-b45c-53d0b46bbb11	High Memory Usage	Alert: High Memory Usage	\N	critical	f	2025-08-05 16:30:34.226064
3266915c-1385-499c-a7bb-71083f57d764	High Memory Usage	Alert: High Memory Usage	\N	critical	f	2025-08-05 16:35:23.645474
45c7101c-e9b9-4cad-a4d6-b26de0898222	High Memory Usage	Alert: High Memory Usage	\N	critical	f	2025-08-05 16:37:04.49365
9424e6f3-d527-4cd1-a737-ad8cc95b57b2	High Memory Usage	Alert: High Memory Usage	\N	critical	f	2025-08-05 16:48:32.070743
\.


--
-- Data for Name: attendance; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.attendance (id, child_id, check_in_time, check_out_time, checked_in_by, checked_out_by, room, date, created_at, check_in_photo_url, check_out_photo_url, notes, mood_rating, activities_completed, biometric_method, biometric_confidence) FROM stdin;
cc5331e6-5d45-4b08-b89b-c55bb2f0e1d0	07353fbc-9669-4522-95e6-b5b2153da684	2025-07-25 08:15:00	\N	Sarah Johnson	\N	Infant Room A	2025-07-25 14:11:57.326	2025-07-25 14:11:57.344993	\N	\N	Check-in for Emma	1	{}	\N	\N
886eface-55da-4ed0-817b-c2e80115d8e9	81fe4c07-3299-4237-a903-9ce07f2353f2	2025-07-25 08:46:00	\N	David Chen	\N	Infant Room A	2025-07-25 14:11:57.37	2025-07-25 14:11:57.390047	\N	\N	Check-in for Liam	5	{}	\N	\N
119bdcb2-9748-452a-9f14-64e3257e9944	f4bba2af-d83d-4501-8b75-2c0cddacf494	2025-07-25 08:32:00	\N	Maria Rodriguez	\N	Infant Room B	2025-07-25 14:11:57.411	2025-07-25 14:11:57.430399	\N	\N	Check-in for Olivia	4	{}	\N	\N
f2ef95f6-67b2-4fc6-8741-e1e131396e80	92ae80b0-bf5d-44f9-b016-124514804c86	2025-07-25 08:01:00	\N	Jennifer Williams	\N	Toddler Room A	2025-07-25 14:11:57.451	2025-07-25 14:11:57.470606	\N	\N	Check-in for Noah	2	{}	\N	\N
1bb720b3-e3ba-494c-9513-fec7a5e2dc91	84fb8168-5dfe-428f-9e2f-82a2561e4557	2025-07-25 08:33:00	\N	Michael Brown	\N	Toddler Room A	2025-07-25 14:11:57.491	2025-07-25 14:11:57.511305	\N	\N	Check-in for Ava	2	{}	\N	\N
42c2d54e-4781-4790-9904-939e3e4b76e8	82962ebb-c647-49d0-aca0-df3be65b10aa	2025-07-25 08:52:00	\N	Lisa Davis	\N	Toddler Room B	2025-07-25 14:11:57.532	2025-07-25 14:11:57.551674	\N	\N	Check-in for Ethan	5	{}	\N	\N
682dc0a6-1f79-43ea-b1f5-eea0acf1eb55	6514305d-d631-4228-a932-e5db94dfd86d	2025-07-25 08:37:00	\N	James Miller	\N	Toddler Room B	2025-07-25 14:11:57.573	2025-07-25 14:11:57.592401	\N	\N	Check-in for Sophia	3	{}	\N	\N
1b855831-ce0c-4736-b228-f1b51e3af1d1	55b7bab0-d52d-477f-aa50-c06962d00d6c	2025-07-25 08:33:00	\N	Amanda Wilson	\N	Preschool Room A	2025-07-25 14:11:57.613	2025-07-25 14:11:57.632529	\N	\N	Check-in for Mason	1	{}	\N	\N
8a9e591f-7109-4d12-9f14-fc5bda50197d	ab35d3d5-2309-4a2f-959e-c1f0838f5549	2025-07-25 08:15:00	\N	Robert Moore	\N	Preschool Room A	2025-07-25 14:11:57.653	2025-07-25 14:11:57.673676	\N	\N	Check-in for Isabella	5	{}	\N	\N
6a80834d-3ec3-4f87-b3d2-235aa21b6ea2	991ea18a-06c3-4966-a5ac-5aaffd3dc4d0	2025-07-25 08:29:00	\N	Christina Taylor	\N	School Age Room	2025-07-25 14:11:57.694	2025-07-25 14:11:57.713879	\N	\N	Check-in for Lucas	4	{}	\N	\N
ffb339be-f1b8-45da-b928-d49efb699634	212d3d2d-978f-406c-8d59-999501ffe2c0	2025-07-29 13:04:40.968	2025-07-29 13:05:01.29	Della Legg	Della Legg	Toddler B	2025-07-29 13:04:40.968	2025-07-29 13:04:43.429161	\N	\N	\N	\N	{}	\N	\N
ee228bb6-5dfb-4220-a2f7-9babebc6009b	7de31f66-b306-40e1-93ca-dd30afc608cf	2025-07-29 13:37:42.67	\N	Mrs Smith	\N	School Age	2025-07-29 13:37:42.67	2025-07-29 13:37:44.817191	\N	\N	\N	\N	{}	\N	\N
\.


--
-- Data for Name: billing; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.billing (id, child_id, period_start, period_end, attendance_days, tuition_amount, extra_fees, total_amount, status, quickbooks_id, due_date, created_at) FROM stdin;
\.


--
-- Data for Name: child_schedules; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.child_schedules (id, child_id, room, date, scheduled_arrival, scheduled_departure, actual_arrival, actual_departure, is_present, schedule_type, is_recurring, recurring_pattern, recurring_days, recurring_until, meal_plan, nap_time, special_needs, notes, parent_approved, status, created_at) FROM stdin;
\.


--
-- Data for Name: children; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.children (id, first_name, last_name, date_of_birth, age_group, room, parent_name, parent_email, parent_phone, emergency_contact_name, emergency_contact_phone, is_active, created_at, allergies, medical_notes, immunizations, profile_photo_url, enrollment_date, tuition_rate, face_descriptor, fingerprint_hash, biometric_enrolled_at, biometric_enabled, medical_conditions, blood_type, primary_physician, current_medications, dietary_restrictions, food_allergies, special_care_instructions, physical_limitations, emergency_medical_authorization, epi_pen_required, inhaler_required, physician_phone, pediatrician_name, pediatrician_phone, preferred_hospital, insurance_provider, insurance_policy_number, insurance_group_number, medical_action_plan, immunization_records, immunization_exemptions, next_immunization_due, last_health_check, health_check_notes, unenrollment_date, enrollment_status, unenrollment_reason, stripe_customer_id, stripe_subscription_id, subscription_status) FROM stdin;
07353fbc-9669-4522-95e6-b5b2153da684	Emma	Johnson	2024-11-25 14:11:56.916	infant	Infant Room A	Sarah Johnson	sarah.j@email.com	(555) 123-4567	Emergency for Sarah Johnson	(555) 123-4567	t	2025-07-25 14:11:56.936587	{}		{}	\N	2025-07-25 14:11:56.936587	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	\N	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
81fe4c07-3299-4237-a903-9ce07f2353f2	Liam	Chen	2024-07-25 14:11:56.965	infant	Infant Room A	David Chen	david.chen@email.com	(555) 234-5678	Emergency for David Chen	(555) 234-5678	t	2025-07-25 14:11:56.984068	{}		{}	\N	2025-07-25 14:11:56.984068	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	\N	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
f4bba2af-d83d-4501-8b75-2c0cddacf494	Olivia	Rodriguez	2024-04-25 14:11:57.004	infant	Infant Room B	Maria Rodriguez	maria.r@email.com	(555) 345-6789	Emergency for Maria Rodriguez	(555) 345-6789	t	2025-07-25 14:11:57.024022	{}		{}	\N	2025-07-25 14:11:57.024022	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	\N	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
92ae80b0-bf5d-44f9-b016-124514804c86	Noah	Williams	2024-01-25 14:11:57.044	young_toddler	Toddler Room A	Jennifer Williams	jen.w@email.com	(555) 456-7890	Emergency for Jennifer Williams	(555) 456-7890	t	2025-07-25 14:11:57.064374	{}		{}	\N	2025-07-25 14:11:57.064374	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	\N	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
84fb8168-5dfe-428f-9e2f-82a2561e4557	Ava	Brown	2023-09-25 14:11:57.085	young_toddler	Toddler Room A	Michael Brown	mike.brown@email.com	(555) 567-8901	Emergency for Michael Brown	(555) 567-8901	t	2025-07-25 14:11:57.104121	{}		{}	\N	2025-07-25 14:11:57.104121	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	\N	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
82962ebb-c647-49d0-aca0-df3be65b10aa	Ethan	Davis	2023-06-25 14:11:57.124	toddler	Toddler Room B	Lisa Davis	lisa.davis@email.com	(555) 678-9012	Emergency for Lisa Davis	(555) 678-9012	t	2025-07-25 14:11:57.144364	{}		{}	\N	2025-07-25 14:11:57.144364	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	\N	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
6514305d-d631-4228-a932-e5db94dfd86d	Sophia	Miller	2023-03-25 14:11:57.165	toddler	Toddler Room B	James Miller	james.m@email.com	(555) 789-0123	Emergency for James Miller	(555) 789-0123	t	2025-07-25 14:11:57.184689	{}		{}	\N	2025-07-25 14:11:57.184689	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	\N	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
55b7bab0-d52d-477f-aa50-c06962d00d6c	Mason	Wilson	2022-01-25 14:11:57.205	preschool	Preschool Room A	Amanda Wilson	amanda.w@email.com	(555) 890-1234	Emergency for Amanda Wilson	(555) 890-1234	t	2025-07-25 14:11:57.224682	{}		{}	\N	2025-07-25 14:11:57.224682	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	\N	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
ab35d3d5-2309-4a2f-959e-c1f0838f5549	Isabella	Moore	2021-07-25 14:11:57.245	preschool	Preschool Room A	Robert Moore	robert.moore@email.com	(555) 901-2345	Emergency for Robert Moore	(555) 901-2345	t	2025-07-25 14:11:57.265002	{}		{}	\N	2025-07-25 14:11:57.265002	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	\N	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
991ea18a-06c3-4966-a5ac-5aaffd3dc4d0	Lucas	Taylor	2019-07-25 14:11:57.285	school_age	School Age Room	Christina Taylor	chris.taylor@email.com	(555) 012-3456	Emergency for Christina Taylor	(555) 012-3456	t	2025-07-25 14:11:57.305801	{}		{}	\N	2025-07-25 14:11:57.305801	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	\N	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
5b95abda-60d6-4ee0-9608-d21bcfd57d72	Emma	Johnson	2021-03-15 00:00:00	preschool	Sunshine Room	Sarah Johnson	sarah.johnson@email.com	(304) 555-0101	Mike Johnson	(304) 555-0102	t	2025-07-28 16:22:28.054005	{None}	No known allergies	{DTaP,IPV,MMR,Varicella}	\N	2025-07-28 16:22:28.054005	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	\N	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
c9174fdb-224f-48ad-82d2-0d276e196f27	Liam	Smith	2020-07-22 00:00:00	preschool	Rainbow Room	Jennifer Smith	jen.smith@email.com	(304) 555-0201	Robert Smith	(304) 555-0202	t	2025-07-28 16:22:28.10204	{Peanuts}	Mild peanut allergy - EpiPen in nurse's office	{DTaP,IPV,MMR,Varicella,"Hepatitis B"}	\N	2025-07-28 16:22:28.10204	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{Peanuts}	\N	\N	f	t	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
b517a24d-02d0-4b76-a34f-10f2e7a44654	Olivia	Brown	2022-11-08 00:00:00	toddler	Butterfly Room	Michael Brown	michael.brown@email.com	(304) 555-0301	Lisa Brown	(304) 555-0302	t	2025-07-28 16:22:28.141695	{}	Lactose intolerant	{DTaP,IPV,"Hepatitis B",Hib}	\N	2025-07-28 16:22:28.141695	\N	\N	\N	\N	f	{}	\N	\N	\N	{Lactose-free}	{Dairy}	Naps from 12:30-2:30pm	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
de55c11a-2bec-46ba-b081-bd0bd6432764	Noah	Davis	2023-05-30 00:00:00	infant	Nursery	Amanda Davis	amanda.davis@email.com	(304) 555-0401	James Davis	(304) 555-0402	t	2025-07-28 16:22:28.180818	{None}	No medical concerns	{DTaP,IPV,"Hepatitis B"}	\N	2025-07-28 16:22:28.180818	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	New to the center, still adjusting	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
26bf2751-5328-406c-83c4-3aac31b90745	Sophia	Wilson	2019-09-12 00:00:00	school_age	Discovery Room	David Wilson	david.wilson@email.com	(304) 555-0501	Emma Wilson	(304) 555-0502	t	2025-07-28 16:22:28.219067	{Dust,Pollen}	Asthma - inhaler in backpack	{DTaP,IPV,MMR,Varicella,"Hepatitis B",Flu}	\N	2025-07-28 16:22:28.219067	\N	\N	\N	\N	f	{Asthma}	\N	\N	\N	{}	{}	Advanced reader, enjoys challenging activities	\N	f	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
65d4d176-c6f3-49a8-96a5-f3fe6702fbc0	Emma	Johnson	2021-03-15 00:00:00	preschool	Sunshine Room	Sarah Johnson	sarah.johnson@email.com	(304) 555-0101	Mike Johnson	(304) 555-0102	t	2025-07-28 16:23:13.569831	{None}	No known allergies	{DTaP,IPV,MMR,Varicella}	\N	2025-07-28 16:23:13.569831	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	\N	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
5ad8a079-2c09-42fd-b391-1bf881b2c3b3	Liam	Smith	2020-07-22 00:00:00	preschool	Rainbow Room	Jennifer Smith	jen.smith@email.com	(304) 555-0201	Robert Smith	(304) 555-0202	t	2025-07-28 16:23:13.617417	{Peanuts}	Mild peanut allergy - EpiPen in nurse's office	{DTaP,IPV,MMR,Varicella,"Hepatitis B"}	\N	2025-07-28 16:23:13.617417	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{Peanuts}	\N	\N	f	t	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
23295615-db87-4b4b-ae26-4f26593b68da	Olivia	Brown	2022-11-08 00:00:00	toddler	Butterfly Room	Michael Brown	michael.brown@email.com	(304) 555-0301	Lisa Brown	(304) 555-0302	t	2025-07-28 16:23:13.657885	{}	Lactose intolerant	{DTaP,IPV,"Hepatitis B",Hib}	\N	2025-07-28 16:23:13.657885	\N	\N	\N	\N	f	{}	\N	\N	\N	{Lactose-free}	{Dairy}	Naps from 12:30-2:30pm	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
15954623-a4cf-484a-a2c8-e0d5c34a92f1	Noah	Davis	2023-05-30 00:00:00	infant	Nursery	Amanda Davis	amanda.davis@email.com	(304) 555-0401	James Davis	(304) 555-0402	t	2025-07-28 16:23:13.698532	{None}	No medical concerns	{DTaP,IPV,"Hepatitis B"}	\N	2025-07-28 16:23:13.698532	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	New to the center, still adjusting	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
10cd5eb7-ac63-486a-be6d-4c3f2aae888e	Sophia	Wilson	2019-09-12 00:00:00	school_age	Discovery Room	David Wilson	david.wilson@email.com	(304) 555-0501	Emma Wilson	(304) 555-0502	t	2025-07-28 16:23:13.737253	{Dust,Pollen}	Asthma - inhaler in backpack	{DTaP,IPV,MMR,Varicella,"Hepatitis B",Flu}	\N	2025-07-28 16:23:13.737253	\N	\N	\N	\N	f	{Asthma}	\N	\N	\N	{}	{}	Advanced reader, enjoys challenging activities	\N	f	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
25d28689-dbdb-4e9c-98cf-5875ff3bda23	Emma	Johnson	2021-03-15 00:00:00	preschool	Sunshine Room	Sarah Johnson	sarah.johnson@email.com	(304) 555-0101	Mike Johnson	(304) 555-0102	t	2025-07-28 16:23:43.124899	{None}	No known allergies	{DTaP,IPV,MMR,Varicella}	\N	2025-07-28 16:23:43.124899	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	\N	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
a8713c84-3e12-4302-819e-0d7b311d6cd7	Liam	Smith	2020-07-22 00:00:00	preschool	Rainbow Room	Jennifer Smith	jen.smith@email.com	(304) 555-0201	Robert Smith	(304) 555-0202	t	2025-07-28 16:23:43.174677	{Peanuts}	Mild peanut allergy - EpiPen in nurse's office	{DTaP,IPV,MMR,Varicella,"Hepatitis B"}	\N	2025-07-28 16:23:43.174677	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{Peanuts}	\N	\N	f	t	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
0f014957-4d30-4df2-90d3-e70ba9e6f747	Olivia	Brown	2022-11-08 00:00:00	toddler	Butterfly Room	Michael Brown	michael.brown@email.com	(304) 555-0301	Lisa Brown	(304) 555-0302	t	2025-07-28 16:23:43.215063	{}	Lactose intolerant	{DTaP,IPV,"Hepatitis B",Hib}	\N	2025-07-28 16:23:43.215063	\N	\N	\N	\N	f	{}	\N	\N	\N	{Lactose-free}	{Dairy}	Naps from 12:30-2:30pm	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
8b5c2db4-6f3c-4fc3-945c-66e510862081	Noah	Davis	2023-05-30 00:00:00	infant	Nursery	Amanda Davis	amanda.davis@email.com	(304) 555-0401	James Davis	(304) 555-0402	t	2025-07-28 16:23:43.259787	{None}	No medical concerns	{DTaP,IPV,"Hepatitis B"}	\N	2025-07-28 16:23:43.259787	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	New to the center, still adjusting	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
204d370c-30f1-46f0-9758-c78affc49831	Sophia	Wilson	2019-09-12 00:00:00	school_age	Discovery Room	David Wilson	david.wilson@email.com	(304) 555-0501	Emma Wilson	(304) 555-0502	t	2025-07-28 16:23:43.299096	{Dust,Pollen}	Asthma - inhaler in backpack	{DTaP,IPV,MMR,Varicella,"Hepatitis B",Flu}	\N	2025-07-28 16:23:43.299096	\N	\N	\N	\N	f	{Asthma}	\N	\N	\N	{}	{}	Advanced reader, enjoys challenging activities	\N	f	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
2d305c2e-a543-474b-a051-6bb8988ab3d0	Emma	Johnson	2021-03-15 00:00:00	preschool	Sunshine Room	Sarah Johnson	sarah.johnson@email.com	(304) 555-0101	Mike Johnson	(304) 555-0102	t	2025-07-28 16:23:57.858638	{None}	No known allergies	{DTaP,IPV,MMR,Varicella}	\N	2025-07-28 16:23:57.858638	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	\N	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
22f4bdfe-0e1c-4fe3-91bd-415840d5f062	Liam	Smith	2020-07-22 00:00:00	preschool	Rainbow Room	Jennifer Smith	jen.smith@email.com	(304) 555-0201	Robert Smith	(304) 555-0202	t	2025-07-28 16:23:57.897475	{Peanuts}	Mild peanut allergy - EpiPen in nurse's office	{DTaP,IPV,MMR,Varicella,"Hepatitis B"}	\N	2025-07-28 16:23:57.897475	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{Peanuts}	\N	\N	f	t	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
19eb687c-09ac-48d6-aabf-519ded5c8b82	Olivia	Brown	2022-11-08 00:00:00	toddler	Butterfly Room	Michael Brown	michael.brown@email.com	(304) 555-0301	Lisa Brown	(304) 555-0302	t	2025-07-28 16:23:57.935924	{}	Lactose intolerant	{DTaP,IPV,"Hepatitis B",Hib}	\N	2025-07-28 16:23:57.935924	\N	\N	\N	\N	f	{}	\N	\N	\N	{Lactose-free}	{Dairy}	Naps from 12:30-2:30pm	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
b928779a-0b0a-4e7b-bb65-1f9058fdbebf	Noah	Davis	2023-05-30 00:00:00	infant	Nursery	Amanda Davis	amanda.davis@email.com	(304) 555-0401	James Davis	(304) 555-0402	t	2025-07-28 16:23:57.975059	{None}	No medical concerns	{DTaP,IPV,"Hepatitis B"}	\N	2025-07-28 16:23:57.975059	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	New to the center, still adjusting	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
d27abecd-31e9-411c-b962-1e6e80579209	Sophia	Wilson	2019-09-12 00:00:00	school_age	Discovery Room	David Wilson	david.wilson@email.com	(304) 555-0501	Emma Wilson	(304) 555-0502	t	2025-07-28 16:23:58.014287	{Dust,Pollen}	Asthma - inhaler in backpack	{DTaP,IPV,MMR,Varicella,"Hepatitis B",Flu}	\N	2025-07-28 16:23:58.014287	\N	\N	\N	\N	f	{Asthma}	\N	\N	\N	{}	{}	Advanced reader, enjoys challenging activities	\N	f	f	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
5e6542a6-2408-43f4-adb2-37b4d57b6f3b	Britt	Legg	2022-01-10 00:00:00	preschool	Preschool A	Della Legg	doclegg05@yahoo.com	3048267400	Della Legg	3048267400	t	2025-07-28 16:54:41.407255	{}	\N	{}	\N	2025-07-28 16:54:41.407255	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	\N	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
17e754bc-4d51-4767-b44b-d99dc1d01e92	Britt	Legg	2022-01-10 00:00:00	preschool	Preschool A	Della Legg	doclegg05@yahoo.com	3048267400	Della Legg	3048267400	t	2025-07-28 17:02:57.905541	{}	\N	{}	\N	2025-07-28 17:02:57.905541	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	\N	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
e6afea57-e0e0-4d09-a125-105269611240	Britt	Legg	2022-01-10 00:00:00	preschool	Preschool A	Della Legg	doclegg05@yahoo.com	3048267400	Della Legg	3048267400	t	2025-07-28 17:08:02.644787	{}	\N	{}	\N	2025-07-28 17:08:02.644787	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	\N	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
a31048c4-7235-421e-a7dd-09acc87c82a0	Britt	Legg	2022-01-10 00:00:00	preschool	Preschool A	Della Legg	doclegg05@yahoo.com	3048267400	Della Legg	3048267400	t	2025-07-28 17:14:30.882486	{}	\N	{}	\N	2025-07-28 17:14:30.882486	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	\N	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
945aef94-bfce-4060-a62d-a62da1ebdffe	Britt	Legg	2022-01-10 00:00:00	preschool	Preschool A	Della Legg	doclegg05@yahoo.com	3048267400	Della Legg	3048267400	t	2025-07-28 17:23:15.45305	{}	\N	{}	\N	2025-07-28 17:23:15.45305	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	\N	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
4531845b-e005-41e1-8d2b-3fa000e49fa0	Britt	Legg	2022-01-10 00:00:00	preschool	Preschool A	Della Legg	doclegg05@yahoo.com	3048267400	Della Legg	3048267400	t	2025-07-28 17:23:52.64724	{}	\N	{}	\N	2025-07-28 17:23:52.64724	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	\N	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
212d3d2d-978f-406c-8d59-999501ffe2c0	Bart 	Legg	2023-06-08 00:00:00	toddler	Toddler B	Della Legg	doclegg05@yahoo.com	3048267400	Della Legg	3048267400	t	2025-07-28 17:35:13.870362	{}	\N	{}	\N	2025-07-28 17:35:13.870362	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	\N	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
38b33617-416f-44dc-a562-d2106a2b8f18	Rebecca 	Hammons	2024-07-06 00:00:00	infant	Infant Room	Robin Hammons	hammonsrobin@gmail.com	5558683021	Robin	Hammons	t	2025-07-28 17:37:08.285289	{}	\N	{}	\N	2025-07-28 17:37:08.285289	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	\N	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
1389352d-7cd0-4d05-b5ac-997de7e60340	Tammy	Lemaster	2025-06-30 00:00:00	infant	Infant Room	Christina Lemaster	doclegg05@yahoo.com	3048267400	Christina Lemaster	888-888-8888	t	2025-07-28 17:41:28.700403	{}	\N	{}	\N	2025-07-28 17:41:28.700403	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	\N	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
0c12f726-63dc-4f21-a376-8cf000fbf235	Tori	Propps	2020-02-14 00:00:00	school_age	Preschool B	Ms Propps	proppsmrs@gmail.com	888-666-2222	Mrs Propps	888-666-2222	t	2025-07-28 17:42:45.85378	{}	\N	{}	\N	2025-07-28 17:42:45.85378	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	\N	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
7de31f66-b306-40e1-93ca-dd30afc608cf	David 	Smith	2019-05-24 00:00:00	school_age	School Age	Mrs Smith	SmithMrs@gmail.com	777-522-8023	\N	\N	t	2025-07-28 17:47:42.3772	{}	\N	{}	\N	2025-07-28 17:47:42.3772	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	\N	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
8f7323d3-6ff1-4fab-9043-b31683624c36	Jennifer	Holcomb	2022-12-24 00:00:00	toddler	Toddler B	Mrs Holcomb	holcomb@gmail.com	\N	\N	\N	t	2025-07-28 17:49:53.289165	{}	\N	{}	\N	2025-07-28 17:49:53.289165	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	\N	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
3d3138b4-1a25-48a2-99a1-86088ba26e7f	Heather 	Tharp	2025-02-17 00:00:00	infant	Infant Room	Mrs. Tharp	\N	\N	\N	\N	t	2025-07-28 17:52:26.070599	{}	\N	{}	\N	2025-07-28 17:52:26.070599	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	\N	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
2d7abd49-9ad5-409d-ada8-d01658e83c57	Dale	Stone	2021-09-10 00:00:00	preschool	Preschool A	Mrs Stone	\N	\N	\N	\N	t	2025-07-28 17:56:39.914386	{}	\N	{}	\N	2025-07-28 17:56:39.914386	\N	\N	\N	\N	f	{}	\N	\N	\N	{}	{}	\N	\N	f	f	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	{}	\N	\N	\N	\N	enrolled	\N	\N	\N	\N
\.


--
-- Data for Name: daily_reports; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.daily_reports (id, child_id, date, attendance_status, meals, nap_notes, activities, behavior_notes, photo_urls, is_generated, sent_to_parent, created_at) FROM stdin;
\.


--
-- Data for Name: document_reminders; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.document_reminders (id, document_id, reminder_type, reminder_date, message, sent_at, acknowledged_at, acknowledged_by, priority, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: document_renewals; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.document_renewals (id, document_id, previous_expiration_date, new_expiration_date, renewal_date, cost, processed_by, notes, file_path, created_at) FROM stdin;
\.


--
-- Data for Name: document_types; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.document_types (id, name, category, description, is_required, renewal_frequency, custom_frequency_days, alert_days_before, regulatory_body, compliance_notes, created_at, updated_at) FROM stdin;
8010440e-7503-4ad8-b2c7-49493fbe156b	General Liability Insurance	insurance	Comprehensive general liability coverage for daycare operations	t	yearly	\N	60	Insurance Provider	Minimum $2M coverage required for childcare facilities	2025-07-25 18:14:16.969065	2025-07-25 18:14:16.969065
d5c7184e-4b0f-44ad-b24b-b338bffb0500	Fire Safety Certificate	certification	Annual fire department safety inspection certificate	t	yearly	\N	45	Local Fire Department	Annual fire safety inspection required	2025-07-25 18:14:16.969065	2025-07-25 18:14:16.969065
118d4604-e95e-4b1f-a824-41cf6c3403a4	COPPA Privacy Policy	legal	Children Online Privacy Protection Act compliance documentation	t	yearly	\N	30	Federal Trade Commission	Must be reviewed and updated annually for legal compliance	2025-07-25 18:14:16.969065	2025-07-25 18:14:16.969065
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.documents (id, document_type_id, title, description, issue_date, expiration_date, status, document_number, issuing_authority, contact_info, file_path, last_reminder_sent, is_active, created_by, updated_by, created_at, updated_at) FROM stdin;
c6a607b3-aa8d-49fe-a5f7-9e71c0a7ca91	8010440e-7503-4ad8-b2c7-49493fbe156b	General Liability Insurance	Primary liability coverage for daycare operations	2024-01-01 00:00:00	2025-08-15 00:00:00	active	POL-2024-001	ABC Insurance Company	renewals@abcinsurance.com	\N	\N	t	admin	\N	2025-07-25 18:15:24.982241	2025-07-25 18:15:24.982241
6d72b18a-5b00-4dad-a75d-05802d41e1e0	d5c7184e-4b0f-44ad-b24b-b338bffb0500	Fire Safety Certificate - Expires Soon	Annual fire department inspection certificate	2024-06-01 00:00:00	2025-08-01 00:00:00	active	FIRE-2024-003	City Fire Department	inspections@cityfire.gov	\N	\N	t	admin	\N	2025-07-25 18:15:24.982241	2025-07-25 18:15:24.982241
ba17f1b3-80d8-4b33-b21c-d93d404fe11f	118d4604-e95e-4b1f-a824-41cf6c3403a4	COPPA Privacy Policy - EXPIRED	Children Online Privacy Protection Act compliance document	2023-01-15 00:00:00	2024-01-15 00:00:00	expired	LEGAL-2024-001	Legal Department	legal@tothub.com	\N	\N	t	admin	\N	2025-07-25 18:15:24.982241	2025-07-25 18:15:24.982241
\.


--
-- Data for Name: media_shares; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.media_shares (id, child_id, staff_id, media_url, media_type, caption, is_visible, created_at) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.messages (id, sender_id, recipient_type, recipient_id, subject, content, attachment_urls, is_read, priority, created_at) FROM stdin;
\.


--
-- Data for Name: parents; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.parents (id, username, password_hash, email, first_name, last_name, phone, children_ids, last_login, email_verified, reset_token, reset_token_expiry, notification_preferences, is_active, created_at, updated_at) FROM stdin;
6e407ab9-0ac0-49c9-9365-73ee14bdbcaf	parent1	$2b$10$6FVoF6YjTsQvIBXGLSq8Z.IAlfz47tt5Raalu/tnAN9iV9M.qa.q6	john.doe@email.com	John	Doe	(555) 123-4567	{84fb8168-5dfe-428f-9e2f-82a2561e4557,07353fbc-9669-4522-95e6-b5b2153da684}	\N	t	\N	\N	{"email":{"attendance":true,"messages":true,"reports":true,"emergencies":true},"push":{"attendance":true,"messages":true,"emergencies":true}}	t	2025-07-28 16:34:29.010457	2025-07-28 16:34:29.010457
f5d81ae1-586f-4c2f-bea5-9b657023b177	parent2	$2b$10$eA7bRGwaVvim8i0MM3La0.NIXMiPBdrBaMJLkqvdiupe7sXuS6.0y	jane.smith@email.com	Jane	Smith	(555) 234-5678	{2d305c2e-a543-474b-a051-6bb8988ab3d0}	\N	t	\N	\N	{"email":{"attendance":true,"messages":true,"reports":true,"emergencies":true},"push":{"attendance":true,"messages":true,"emergencies":true}}	t	2025-07-28 16:34:29.224015	2025-07-28 16:34:29.224015
226b640c-bf2f-42fe-b3e4-f4997ae388af	parent3	$2b$10$4zVJ8hLkVpfkRczensxrBOsW8vBRtdwIRjgkdxv8ohZiCMSpJ.DyW	robert.johnson@email.com	Robert	Johnson	(555) 345-6789	{65d4d176-c6f3-49a8-96a5-f3fe6702fbc0,25d28689-dbdb-4e9c-98cf-5875ff3bda23}	\N	t	\N	\N	{"email":{"attendance":true,"messages":true,"reports":true,"emergencies":true},"push":{"attendance":true,"messages":true,"emergencies":true}}	t	2025-07-28 16:34:29.403661	2025-07-28 16:34:29.403661
\.


--
-- Data for Name: pay_periods; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.pay_periods (id, start_date, end_date, pay_date, status, total_gross_pay, total_net_pay, total_taxes, processed_by, processed_at, created_at, updated_at) FROM stdin;
71539eb2-aa78-4c7c-a06d-3be3315657b0	2025-07-01	2025-07-15	2025-07-22	open	0	0	0	\N	\N	2025-07-25 15:27:03.269528	2025-07-25 15:27:03.269528
cf4d497f-927d-4c58-b662-808bcc25d865	2025-06-15	2025-06-30	2025-07-07	closed	0	0	0	\N	\N	2025-07-25 15:27:03.269528	2025-07-25 15:27:03.269528
fdb0d850-24bf-45f1-be8a-d215e5d3d098	2025-07-25	2025-07-25	2025-07-26	open	0	0	0	\N	\N	2025-07-25 15:29:41.845905	2025-07-25 15:29:41.845905
\.


--
-- Data for Name: pay_stubs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.pay_stubs (id, staff_id, pay_period_id, regular_hours, overtime_hours, total_hours, regular_pay, overtime_pay, gross_pay, federal_tax, state_tax, social_security_tax, medicare_tax, health_insurance, retirement_401k, other_deductions, total_deductions, net_pay, created_at, updated_at) FROM stdin;
95b0ea99-0fc5-48ca-87c1-31503777f75a	b544e53c-8d58-4eff-a4b9-cee4d3ee085e	71539eb2-aa78-4c7c-a06d-3be3315657b0	180	0	180	5400	0	5400	810	324	335	78	0	0	0	0	3853	2025-07-25 15:36:56.842464	2025-07-25 15:36:56.842464
\.


--
-- Data for Name: payroll_audit; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.payroll_audit (id, table_name, record_id, action, old_values, new_values, changed_by, changed_at) FROM stdin;
\.


--
-- Data for Name: payroll_reports; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.payroll_reports (id, pay_period_id, report_type, report_data, generated_by, generated_at, report_pdf_url) FROM stdin;
\.


--
-- Data for Name: room_schedules; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.room_schedules (id, room, date, time_slot, max_capacity, current_occupancy, staff_required, staff_assigned, is_available, activities, special_requirements, notes, created_at) FROM stdin;
\.


--
-- Data for Name: safety_reminder_completions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.safety_reminder_completions (id, reminder_id, completed_at, completed_by, notes, next_scheduled_date, attachments) FROM stdin;
152c1f17-7be1-4d3a-a03a-a48e6f961631	66d27941-5e16-4201-9430-4282b2b3c205	2025-07-25 17:58:54.235815	admin	Fire extinguishers checked - all in good condition	2025-08-25 17:58:54.216	{}
\.


--
-- Data for Name: safety_reminders; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.safety_reminders (id, title, description, category, priority, frequency, custom_interval, next_due_date, last_completed_date, is_active, is_paused, created_at, updated_at, created_by, assigned_to, completion_notes, alert_days_before) FROM stdin;
28e450fc-dc2d-4b6f-8c78-c0baaacea5f0	Fire Drill Practice	Conduct fire evacuation drill with all children and staff	drills	critical	monthly	\N	2025-07-30 09:00:00	\N	t	f	2025-07-25 17:58:38.033846	2025-07-25 17:58:38.033846	admin	\N	\N	7
6f61b273-aa99-493c-b6a4-409786005031	Playground Equipment Inspection	Weekly safety check of playground equipment for damage or wear	equipment	high	weekly	\N	2025-07-27 14:00:00	\N	t	t	2025-07-25 17:58:42.56132	2025-07-25 17:58:52.077	admin	\N	\N	2
66d27941-5e16-4201-9430-4282b2b3c205	Fire Extinguisher Check	Monthly inspection of fire extinguishers	fire_safety	high	monthly	\N	2025-08-25 17:58:54.216	2025-07-25 17:58:54.258	t	f	2025-07-25 17:58:24.411217	2025-07-25 17:58:54.258	admin	\N	\N	3
\.


--
-- Data for Name: schedule_templates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.schedule_templates (id, name, description, entity_type, template_data, is_active, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: security_credentials; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.security_credentials (id, user_id, device_id, credential_type, credential_data, is_active, expires_at, created_at, updated_at) FROM stdin;
44dd7b11-74f5-4338-8257-c112a01df16b	parent_001	f29439c4-d3eb-4b55-925e-748cca403cfe	pin	e6d50ce2a6151fb35976e74391578b38	t	2025-07-26 13:48:48.345	2025-07-25 13:48:48.365857	2025-07-25 13:48:48.365857
95ad756c-2946-40c1-8906-d62f780268d5	staff_001	e25e3b0d-f656-4c1d-a2c2-3412156890f1	rfid	0x1234ABCD	t	\N	2025-07-25 13:48:48.491769	2025-07-25 13:48:48.491769
d32f3f39-356f-4152-9633-07c6a62010f4	admin_001	1880caa4-0c4e-4a91-9166-5358db895374	biometric	d35b5693a24090cc5547708559947f261ec2b19873c397e164a6e2cb9440451f	t	\N	2025-07-25 13:48:48.610712	2025-07-25 13:48:48.610712
395ffba5-f34a-447e-892d-536a741e727e	parent_001	c1e1fa1e-7ae2-439e-93ed-af7b369c4be5	pin	fdc47a34ea8dd082399f426ef3fd59ba	t	2025-07-26 13:48:50.262	2025-07-25 13:48:50.282186	2025-07-25 13:48:50.282186
ba2099a7-890d-4542-9a4d-4a75542bffde	staff_001	98cc0730-98f7-4b6e-a047-cb2c234dca89	rfid	0x1234ABCD	t	\N	2025-07-25 13:48:50.402633	2025-07-25 13:48:50.402633
2f318d70-d95e-43ab-a1c0-9f3c3f9d9f4d	admin_001	9b6d8ea1-2a47-4373-8836-ecb738eaded1	biometric	d35b5693a24090cc5547708559947f261ec2b19873c397e164a6e2cb9440451f	t	\N	2025-07-25 13:48:50.521952	2025-07-25 13:48:50.521952
\.


--
-- Data for Name: security_devices; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.security_devices (id, name, type, location, connection_type, connection_config, is_enabled, unlock_duration, fail_safe_mode, last_ping, status, created_at, updated_at) FROM stdin;
b545b5b5-00a0-4b3c-a35d-a280d7b95c0e	Test Keypad	keypad	Main Entrance	serial	"{\\"port\\":\\"COM1\\",\\"baudRate\\":9600}"	t	5	secure	2025-07-25 13:48:41.174	online	2025-07-25 13:48:41.017746	2025-07-25 13:48:41.174
f29439c4-d3eb-4b55-925e-748cca403cfe	Main Entrance Keypad	keypad	Main Entrance	serial	{"port":"COM3","baudRate":9600,"timeout":5,"pinLength":4}	t	8	secure	2025-07-25 13:48:47.455	online	2025-07-25 13:48:47.393323	2025-07-25 13:48:47.455
e25e3b0d-f656-4c1d-a2c2-3412156890f1	Staff RFID Reader	rfid	Staff Entrance	network	{"ipAddress":"192.168.1.100","port":8080,"protocol":"wiegand","apiKey":"RFID_API_KEY_2025"}	t	5	secure	2025-07-25 13:48:47.574	online	2025-07-25 13:48:47.513959	2025-07-25 13:48:47.574
1880caa4-0c4e-4a91-9166-5358db895374	Admin Biometric Scanner	biometric	Office	network	{"sdkEndpoint":"https://api.zkteco.com/v1","deviceId":"BIO_001","apiKey":"BIOMETRIC_API_KEY","templateFormat":"ISO19794"}	t	6	secure	2025-07-25 13:48:47.701	online	2025-07-25 13:48:47.634707	2025-07-25 13:48:47.701
b2d56f6a-7066-40a9-ab64-bb3def84f3f9	Parent Mobile Access	mobile	Main Entrance	bluetooth	{"bluetoothId":"MOBILE_BT_001","nfcEnabled":true,"qrCodeEnabled":true,"appId":"KidSignPro"}	t	7	secure	2025-07-25 13:48:47.822	online	2025-07-25 13:48:47.760268	2025-07-25 13:48:47.822
e9705690-27eb-4f5a-a9a6-5e83eae10706	Front Door Video Intercom	intercom	Main Entrance	network	{"apiEndpoint":"https://api.ring.com/v1","deviceId":"RING_DOORBELL_001","apiKey":"RING_API_KEY","videoQuality":"1080p"}	t	10	secure	2025-07-25 13:48:47.942	online	2025-07-25 13:48:47.880767	2025-07-25 13:48:47.942
aa214d36-f23c-40d7-a061-12070c0c6987	Emergency Exit Magnetic Lock	magnetic	Emergency Exit	gpio	{"relayPin":18,"voltage":"12V","holdingForce":"1200lbs","failSafeWiring":true}	t	0	unlock	2025-07-25 13:48:48.063	online	2025-07-25 13:48:48.001964	2025-07-25 13:48:48.063
c1e1fa1e-7ae2-439e-93ed-af7b369c4be5	Main Entrance Keypad	keypad	Main Entrance	serial	{"port":"COM3","baudRate":9600,"timeout":5,"pinLength":4}	t	8	secure	2025-07-25 13:48:49.388	online	2025-07-25 13:48:49.321966	2025-07-25 13:48:49.388
98cc0730-98f7-4b6e-a047-cb2c234dca89	Staff RFID Reader	rfid	Staff Entrance	network	{"ipAddress":"192.168.1.100","port":8080,"protocol":"wiegand","apiKey":"RFID_API_KEY_2025"}	t	5	secure	2025-07-25 13:48:49.508	online	2025-07-25 13:48:49.446941	2025-07-25 13:48:49.508
9b6d8ea1-2a47-4373-8836-ecb738eaded1	Admin Biometric Scanner	biometric	Office	network	{"sdkEndpoint":"https://api.zkteco.com/v1","deviceId":"BIO_001","apiKey":"BIOMETRIC_API_KEY","templateFormat":"ISO19794"}	t	6	secure	2025-07-25 13:48:49.627	online	2025-07-25 13:48:49.567171	2025-07-25 13:48:49.627
7916f2f0-0f77-41a6-b296-3cd58f238562	Parent Mobile Access	mobile	Main Entrance	bluetooth	{"bluetoothId":"MOBILE_BT_001","nfcEnabled":true,"qrCodeEnabled":true,"appId":"KidSignPro"}	t	7	secure	2025-07-25 13:48:49.745	online	2025-07-25 13:48:49.685943	2025-07-25 13:48:49.745
36404d7f-f9d6-4d86-bda4-df2f25d8c34c	Front Door Video Intercom	intercom	Main Entrance	network	{"apiEndpoint":"https://api.ring.com/v1","deviceId":"RING_DOORBELL_001","apiKey":"RING_API_KEY","videoQuality":"1080p"}	t	10	secure	2025-07-25 13:48:49.864	online	2025-07-25 13:48:49.804079	2025-07-25 13:48:49.864
4dca8d40-5b21-4809-8c73-a3a4dc6ccae9	Emergency Exit Magnetic Lock	magnetic	Emergency Exit	gpio	{"relayPin":18,"voltage":"12V","holdingForce":"1200lbs","failSafeWiring":true}	t	0	unlock	2025-07-25 13:48:49.984	online	2025-07-25 13:48:49.92292	2025-07-25 13:48:49.984
\.


--
-- Data for Name: security_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.security_logs (id, device_id, user_id, action, method, success, details, ip_address, "timestamp") FROM stdin;
c6727ee3-9e43-4ff6-9968-0ad0a549edec	b545b5b5-00a0-4b3c-a35d-a280d7b95c0e	\N	system_connect	\N	t	Simulated connection established	system	2025-07-25 13:48:41.130783
d840d864-6989-4c0f-abb8-ecad227f93d6	f29439c4-d3eb-4b55-925e-748cca403cfe	\N	system_connect	\N	t	Simulated connection established	system	2025-07-25 13:48:47.434053
c0199454-cdce-4c6c-9780-de8348a252f6	e25e3b0d-f656-4c1d-a2c2-3412156890f1	\N	system_connect	\N	t	Simulated RFID reader connected	system	2025-07-25 13:48:47.553836
d9d0ab42-c2a6-4e61-90d8-c9e1648aae83	1880caa4-0c4e-4a91-9166-5358db895374	\N	system_connect	\N	t	Simulated biometric scanner connected	system	2025-07-25 13:48:47.679819
8cf64e89-368e-4a71-a1ed-a39ac4a3af19	b2d56f6a-7066-40a9-ab64-bb3def84f3f9	\N	system_connect	\N	t	Simulated mobile/NFC reader connected	system	2025-07-25 13:48:47.8018
7386105d-162d-45f9-a1ac-ea7544cdba4f	e9705690-27eb-4f5a-a9a6-5e83eae10706	\N	system_connect	\N	t	Simulated intercom/video doorbell connected	system	2025-07-25 13:48:47.920849
41bbb48c-e7c8-4870-b3b9-f5ce9716b721	aa214d36-f23c-40d7-a061-12070c0c6987	\N	system_connect	\N	t	Simulated magnetic lock connected	system	2025-07-25 13:48:48.042263
bc0775ff-4e9e-4bfd-8446-a2f96496877f	f29439c4-d3eb-4b55-925e-748cca403cfe	\N	unlock	\N	t	Door unlocked for 8s (simulated)	system	2025-07-25 13:48:48.122989
8b1b1796-61d3-4ee9-9abd-bc76b07b0d54	e25e3b0d-f656-4c1d-a2c2-3412156890f1	\N	unlock	\N	t	RFID unlock for 5s (simulated)	system	2025-07-25 13:48:48.1642
99448803-ed83-48dc-acf9-6d4cc53bbdf1	1880caa4-0c4e-4a91-9166-5358db895374	\N	unlock	\N	t	Biometric unlock for 6s (simulated)	system	2025-07-25 13:48:48.204319
786fb7df-b136-4bd9-b5e7-bbfc68d33917	b2d56f6a-7066-40a9-ab64-bb3def84f3f9	\N	unlock	\N	t	Mobile unlock for 7s (simulated)	system	2025-07-25 13:48:48.244412
92387c26-5a93-490e-9b9d-d83cffe96bf7	e9705690-27eb-4f5a-a9a6-5e83eae10706	admin	unlock	remote	t	Remote unlock for 10s (simulated)	system	2025-07-25 13:48:48.28448
1ce0ee73-8495-4159-89c2-2afb60f88e1b	aa214d36-f23c-40d7-a061-12070c0c6987	\N	unlock	\N	t	Magnetic lock de-energized for 0s (simulated)	system	2025-07-25 13:48:48.324529
9e2265d2-b2df-41f6-9a60-893497f97cee	f29439c4-d3eb-4b55-925e-748cca403cfe	parent_001	unlock	pin	t	PIN validated	system	2025-07-25 13:48:48.451429
bac402a7-6bb6-4ef2-8a50-45c264b7a0c8	e25e3b0d-f656-4c1d-a2c2-3412156890f1	staff_001	unlock	rfid	t	RFID card validated	system	2025-07-25 13:48:48.570207
5ae96f4d-fc02-4f0a-878a-7a5c0038a68b	1880caa4-0c4e-4a91-9166-5358db895374	admin_001	system_update	biometric	t	Biometric enrolled	system	2025-07-25 13:48:48.650761
77bc16f4-f2a7-4e75-b8c2-7c944ce9c875	1880caa4-0c4e-4a91-9166-5358db895374	admin_001	unlock	biometric	t	Biometric validated	system	2025-07-25 13:48:48.735434
1e9031e0-e88e-4c1a-a470-f7576eba4861	b545b5b5-00a0-4b3c-a35d-a280d7b95c0e	\N	unlock	\N	t	Door unlocked for 0s (simulated)	system	2025-07-25 13:48:48.776249
e0e1d761-316b-4f3f-8a4f-bbb04fcf0214	f29439c4-d3eb-4b55-925e-748cca403cfe	\N	unlock	\N	t	Door unlocked for 0s (simulated)	system	2025-07-25 13:48:48.815876
5cd4ae03-2ca3-4e3a-8726-f4c60f7936e6	e25e3b0d-f656-4c1d-a2c2-3412156890f1	\N	unlock	\N	t	RFID unlock for 0s (simulated)	system	2025-07-25 13:48:48.856023
bd363b8e-c2bc-4d2b-bc1a-cca9ca423f36	1880caa4-0c4e-4a91-9166-5358db895374	\N	unlock	\N	t	Biometric unlock for 0s (simulated)	system	2025-07-25 13:48:48.895923
9c12800d-d02f-4d64-aed1-38659b3f18b1	b2d56f6a-7066-40a9-ab64-bb3def84f3f9	\N	unlock	\N	t	Mobile unlock for 0s (simulated)	system	2025-07-25 13:48:48.936403
60dcd88e-ce6b-4c3e-88f1-91fbf84dba93	e9705690-27eb-4f5a-a9a6-5e83eae10706	admin	unlock	remote	t	Remote unlock for 0s (simulated)	system	2025-07-25 13:48:48.976188
5960f22b-90e6-4c72-8f03-eb501830675e	aa214d36-f23c-40d7-a061-12070c0c6987	system	unlock	emergency	t	Emergency de-energization (simulated)	system	2025-07-25 13:48:49.016416
36ca0210-350b-4e68-8497-c2eec5de907d	f29439c4-d3eb-4b55-925e-748cca403cfe	\N	lock	\N	t	Door locked (simulated)	system	2025-07-25 13:48:49.163746
a00353d3-defd-4eeb-bef0-5cc67b728ff5	e25e3b0d-f656-4c1d-a2c2-3412156890f1	\N	lock	\N	t	RFID door locked (simulated)	system	2025-07-25 13:48:49.204747
4984845c-d9d1-4198-a469-56969fec803b	b2d56f6a-7066-40a9-ab64-bb3def84f3f9	\N	lock	\N	t	Mobile door locked (simulated)	system	2025-07-25 13:48:49.284739
e1786592-8b76-46c6-adbc-07d7c178c064	e9705690-27eb-4f5a-a9a6-5e83eae10706	admin	lock	remote	t	Remote door locked (simulated)	system	2025-07-25 13:48:49.324503
aa3df3ac-918f-4bf2-855f-f703d46472d6	aa214d36-f23c-40d7-a061-12070c0c6987	\N	lock	\N	t	Magnetic lock energized (simulated)	system	2025-07-25 13:48:49.364065
c19d0463-5a95-4fa4-8432-d0ab3fd2e8fe	c1e1fa1e-7ae2-439e-93ed-af7b369c4be5	\N	system_connect	\N	t	Simulated connection established	system	2025-07-25 13:48:49.366396
c350ec97-7c07-4831-8e93-a77856cf0b4b	1880caa4-0c4e-4a91-9166-5358db895374	\N	lock	\N	t	Biometric door locked (simulated)	system	2025-07-25 13:48:49.364861
479e6a66-3c87-42ea-a5a9-36dfd661c5ee	98cc0730-98f7-4b6e-a047-cb2c234dca89	\N	system_connect	\N	t	Simulated RFID reader connected	system	2025-07-25 13:48:49.487845
3f13e8b7-9da0-4ad4-ad14-d47e18c3b80b	9b6d8ea1-2a47-4373-8836-ecb738eaded1	\N	system_connect	\N	t	Simulated biometric scanner connected	system	2025-07-25 13:48:49.607136
74a00864-01cd-4dfa-887a-02ebb3071c20	7916f2f0-0f77-41a6-b296-3cd58f238562	\N	system_connect	\N	t	Simulated mobile/NFC reader connected	system	2025-07-25 13:48:49.724654
857ed752-b871-4158-8579-4602e201819e	36404d7f-f9d6-4d86-bda4-df2f25d8c34c	\N	system_connect	\N	t	Simulated intercom/video doorbell connected	system	2025-07-25 13:48:49.844021
32a5efb4-a544-4ac0-8708-0300507d2816	4dca8d40-5b21-4809-8c73-a3a4dc6ccae9	\N	system_connect	\N	t	Simulated magnetic lock connected	system	2025-07-25 13:48:49.963599
a6b24ca0-b88d-4734-92c6-a9c0438640bf	c1e1fa1e-7ae2-439e-93ed-af7b369c4be5	\N	unlock	\N	t	Door unlocked for 8s (simulated)	system	2025-07-25 13:48:50.043545
6c29e5ec-c203-4d36-8af0-c58c1cf2e98c	98cc0730-98f7-4b6e-a047-cb2c234dca89	\N	unlock	\N	t	RFID unlock for 5s (simulated)	system	2025-07-25 13:48:50.082674
057c6e4a-8c96-4aa3-8023-5ec0cd84387e	9b6d8ea1-2a47-4373-8836-ecb738eaded1	\N	unlock	\N	t	Biometric unlock for 6s (simulated)	system	2025-07-25 13:48:50.12246
33303452-c257-4097-ad4f-8bb2661b1ba9	7916f2f0-0f77-41a6-b296-3cd58f238562	\N	unlock	\N	t	Mobile unlock for 7s (simulated)	system	2025-07-25 13:48:50.162648
ab02e3cc-5166-4b6a-b550-6ee417b6c517	36404d7f-f9d6-4d86-bda4-df2f25d8c34c	admin	unlock	remote	t	Remote unlock for 10s (simulated)	system	2025-07-25 13:48:50.202225
7c30c8db-d67e-4fa1-9f7e-235024273d4c	4dca8d40-5b21-4809-8c73-a3a4dc6ccae9	\N	unlock	\N	t	Magnetic lock de-energized for 0s (simulated)	system	2025-07-25 13:48:50.242151
bf33e0d0-3a49-4f17-b6bd-d8c68bab2867	c1e1fa1e-7ae2-439e-93ed-af7b369c4be5	parent_001	unlock	pin	t	PIN validated	system	2025-07-25 13:48:50.362665
c9d7e1e6-1c77-4845-a654-b868f845fee9	98cc0730-98f7-4b6e-a047-cb2c234dca89	staff_001	unlock	rfid	t	RFID card validated	system	2025-07-25 13:48:50.482174
88837e47-b916-436f-abf6-2ae4c8a60d2f	9b6d8ea1-2a47-4373-8836-ecb738eaded1	admin_001	system_update	biometric	t	Biometric enrolled	system	2025-07-25 13:48:50.560719
66cb15c1-91fc-4b8d-9977-f23b8e11905a	9b6d8ea1-2a47-4373-8836-ecb738eaded1	admin_001	unlock	biometric	t	Biometric validated	system	2025-07-25 13:48:50.642401
e86d6f1d-fe42-4954-8dc1-e29db9d17cdd	b545b5b5-00a0-4b3c-a35d-a280d7b95c0e	\N	unlock	\N	t	Door unlocked for 0s (simulated)	system	2025-07-25 13:48:50.682672
54f291fc-3c46-460d-abbb-0425a2ca1e83	f29439c4-d3eb-4b55-925e-748cca403cfe	\N	unlock	\N	t	Door unlocked for 0s (simulated)	system	2025-07-25 13:48:50.722748
a98d8827-2356-489e-9b4f-a8a6b7a9e18b	e25e3b0d-f656-4c1d-a2c2-3412156890f1	\N	unlock	\N	t	RFID unlock for 0s (simulated)	system	2025-07-25 13:48:50.766042
b1a49ef4-2924-4f10-a997-d5ac5cbe689b	1880caa4-0c4e-4a91-9166-5358db895374	\N	unlock	\N	t	Biometric unlock for 0s (simulated)	system	2025-07-25 13:48:50.80626
abb5fed2-3f7d-4535-8e6e-6c8455fa19be	b2d56f6a-7066-40a9-ab64-bb3def84f3f9	\N	unlock	\N	t	Mobile unlock for 0s (simulated)	system	2025-07-25 13:48:50.848393
2ff63089-acb3-42bb-8945-c25ab243c996	e9705690-27eb-4f5a-a9a6-5e83eae10706	admin	unlock	remote	t	Remote unlock for 0s (simulated)	system	2025-07-25 13:48:50.888819
906fac9d-3dc4-4327-ac5a-e5187be61d74	aa214d36-f23c-40d7-a061-12070c0c6987	system	unlock	emergency	t	Emergency de-energization (simulated)	system	2025-07-25 13:48:50.930564
be73ff2a-20b2-42f3-b327-ebb77a0a837d	c1e1fa1e-7ae2-439e-93ed-af7b369c4be5	\N	unlock	\N	t	Door unlocked for 0s (simulated)	system	2025-07-25 13:48:50.972269
d9b97ba6-e82b-40d7-a0cd-d52f98cd3696	98cc0730-98f7-4b6e-a047-cb2c234dca89	\N	unlock	\N	t	RFID unlock for 0s (simulated)	system	2025-07-25 13:48:51.015724
e39fa2b6-3d88-4e9a-80d9-1654c0b3608a	9b6d8ea1-2a47-4373-8836-ecb738eaded1	\N	unlock	\N	t	Biometric unlock for 0s (simulated)	system	2025-07-25 13:48:51.056788
e838faf3-96c5-4ca5-b1a4-4edd2221ecef	7916f2f0-0f77-41a6-b296-3cd58f238562	\N	unlock	\N	t	Mobile unlock for 0s (simulated)	system	2025-07-25 13:48:51.122115
595dd7c9-2746-4571-a4d8-2e67e22bb125	36404d7f-f9d6-4d86-bda4-df2f25d8c34c	admin	unlock	remote	t	Remote unlock for 0s (simulated)	system	2025-07-25 13:48:51.169156
37ad67d4-b854-4cc9-b93a-ed4e99824cc6	4dca8d40-5b21-4809-8c73-a3a4dc6ccae9	system	unlock	emergency	t	Emergency de-energization (simulated)	system	2025-07-25 13:48:51.214203
8307451e-8865-413a-aa8a-15c4cb8b465d	c1e1fa1e-7ae2-439e-93ed-af7b369c4be5	\N	lock	\N	t	Door locked (simulated)	system	2025-07-25 13:48:51.086581
21a5ef4f-56c6-42f9-9a41-a38e40d6d0a4	7916f2f0-0f77-41a6-b296-3cd58f238562	\N	lock	\N	t	Mobile door locked (simulated)	system	2025-07-25 13:48:51.206474
f895ec09-36e0-4800-a0cc-b0c76499d041	4dca8d40-5b21-4809-8c73-a3a4dc6ccae9	\N	lock	\N	t	Magnetic lock energized (simulated)	system	2025-07-25 13:48:51.281797
5e52bc91-5900-4959-a224-f49427e49dd9	98cc0730-98f7-4b6e-a047-cb2c234dca89	\N	lock	\N	t	RFID door locked (simulated)	system	2025-07-25 13:48:51.122966
c7076eae-87e4-4629-9657-396e3bdaa4fb	9b6d8ea1-2a47-4373-8836-ecb738eaded1	\N	lock	\N	t	Biometric door locked (simulated)	system	2025-07-25 13:48:51.168639
81f60a31-c693-4105-9271-19b3e57964ba	36404d7f-f9d6-4d86-bda4-df2f25d8c34c	admin	lock	remote	t	Remote door locked (simulated)	system	2025-07-25 13:48:51.246879
\.


--
-- Data for Name: security_zones; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.security_zones (id, name, description, device_ids, access_rules, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: session_activity; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.session_activity (id, session_id, action, path, "timestamp", details) FROM stdin;
475c427b-c2aa-4c39-9fbb-b2be6e156f95	65440e8edb3d5e6a35518730753baa1328531f95201beafc2b9019b9108d9b14	login	/api/auth/login	2025-07-25 19:57:12.741882	\N
04418a84-2326-404f-87ec-586c32966c7c	1f264121e90bc2498853d7c965788ab621bc440873dcb8a5220b9e9a08bcbdaf	login	/api/auth/login	2025-07-25 23:01:23.891289	\N
788b9df0-b64a-46e9-8112-92fe07a1a749	5cb495f2584933082e54d33491e840b029fa1d66b7d1351eea06da4dc64d17e0	login	/api/auth/login	2025-07-25 23:14:20.887626	\N
0ae25278-35df-4550-9fb2-86dd71e20a85	5cb495f2584933082e54d33491e840b029fa1d66b7d1351eea06da4dc64d17e0	get	/alerts/unread	2025-07-25 23:18:11.068847	{"body":{}}
cf9ab588-be90-40a5-9ea5-c3d86edf9ac7	5cb495f2584933082e54d33491e840b029fa1d66b7d1351eea06da4dc64d17e0	get	/dashboard/stats	2025-07-25 23:18:11.069095	{"body":{}}
6fd1af5c-7d75-43b6-a7ac-e4a2eaca0836	5cb495f2584933082e54d33491e840b029fa1d66b7d1351eea06da4dc64d17e0	get	/ratios	2025-07-25 23:18:11.095352	{"body":{}}
5c7c3d76-9c6d-458c-a95c-729acf8b3450	5cb495f2584933082e54d33491e840b029fa1d66b7d1351eea06da4dc64d17e0	get	/children	2025-07-25 23:18:11.103455	{"body":{}}
f08b17be-fc5e-449f-a1f5-0fcec51cb6a1	5cb495f2584933082e54d33491e840b029fa1d66b7d1351eea06da4dc64d17e0	get	/staff-schedules/today	2025-07-25 23:18:11.201828	{"body":{}}
e077324c-a84d-4404-b032-f275640b5706	5cb495f2584933082e54d33491e840b029fa1d66b7d1351eea06da4dc64d17e0	get	/attendance/present	2025-07-25 23:18:11.253042	{"body":{}}
5c2286f6-8322-4998-b86d-29251d7ec1df	5cb495f2584933082e54d33491e840b029fa1d66b7d1351eea06da4dc64d17e0	get	/settings	2025-07-25 23:18:11.480918	{"body":{}}
5291fdfe-246c-4149-b4f5-c695b9c2f220	5cb495f2584933082e54d33491e840b029fa1d66b7d1351eea06da4dc64d17e0	get	/alerts/unread	2025-07-25 23:21:43.916197	{"body":{}}
d4e6ed63-5baf-4865-8c70-81aa4ddda3f3	5cb495f2584933082e54d33491e840b029fa1d66b7d1351eea06da4dc64d17e0	get	/ratios	2025-07-25 23:21:43.916589	{"body":{}}
b92db1da-5d3c-4676-a4d7-02741abff904	5cb495f2584933082e54d33491e840b029fa1d66b7d1351eea06da4dc64d17e0	get	/children	2025-07-25 23:21:43.911777	{"body":{}}
85124500-3abe-43bb-bbee-31bf7b24bc41	5cb495f2584933082e54d33491e840b029fa1d66b7d1351eea06da4dc64d17e0	get	/dashboard/stats	2025-07-25 23:21:43.913601	{"body":{}}
d3778e0e-02fe-4eae-8378-3b1bcab857c1	5cb495f2584933082e54d33491e840b029fa1d66b7d1351eea06da4dc64d17e0	get	/settings	2025-07-25 23:21:44.027817	{"body":{}}
40926c51-4992-450c-8d81-e6233057fdf6	5cb495f2584933082e54d33491e840b029fa1d66b7d1351eea06da4dc64d17e0	get	/attendance/present	2025-07-25 23:21:44.04329	{"body":{}}
e52ca816-e62b-4c76-a619-c7d47231a338	5cb495f2584933082e54d33491e840b029fa1d66b7d1351eea06da4dc64d17e0	get	/staff-schedules/today	2025-07-25 23:21:44.220737	{"body":{}}
a2b4b5d7-5939-4a89-b4a9-62cbd3080c36	5cb495f2584933082e54d33491e840b029fa1d66b7d1351eea06da4dc64d17e0	get	/dashboard/stats	2025-07-25 23:27:00.442738	{"body":{}}
c7414b6c-009a-4fcb-9347-2a6d5bc290de	5cb495f2584933082e54d33491e840b029fa1d66b7d1351eea06da4dc64d17e0	get	/children	2025-07-25 23:27:00.447447	{"body":{}}
ae880b6a-c12c-4814-b767-3023bc35f220	5cb495f2584933082e54d33491e840b029fa1d66b7d1351eea06da4dc64d17e0	get	/alerts/unread	2025-07-25 23:27:00.441298	{"body":{}}
35be9813-5751-443e-aafd-050b678a2550	5cb495f2584933082e54d33491e840b029fa1d66b7d1351eea06da4dc64d17e0	get	/attendance/present	2025-07-25 23:27:00.460301	{"body":{}}
1cd85ae8-f01c-4371-bc65-4269ac70a3c4	5cb495f2584933082e54d33491e840b029fa1d66b7d1351eea06da4dc64d17e0	get	/ratios	2025-07-25 23:27:00.591186	{"body":{}}
db73bff7-f5c8-474b-b60d-07721ad8cfba	5cb495f2584933082e54d33491e840b029fa1d66b7d1351eea06da4dc64d17e0	get	/settings	2025-07-25 23:27:00.665351	{"body":{}}
e8e9fe5e-8083-4d6e-b4ba-a8d67e4a9361	5cb495f2584933082e54d33491e840b029fa1d66b7d1351eea06da4dc64d17e0	get	/staff-schedules/today	2025-07-25 23:27:00.759155	{"body":{}}
1b22bfc9-d9c1-4333-9a5f-2d998284b53d	5cb495f2584933082e54d33491e840b029fa1d66b7d1351eea06da4dc64d17e0	get	/alerts/unread	2025-07-25 23:27:49.156884	{"body":{}}
e6e7de8e-6a08-4524-b69e-4728fac63892	5cb495f2584933082e54d33491e840b029fa1d66b7d1351eea06da4dc64d17e0	get	/dashboard/stats	2025-07-25 23:27:49.160058	{"body":{}}
c1af0452-84bf-410e-a4f3-676d9f64871f	5cb495f2584933082e54d33491e840b029fa1d66b7d1351eea06da4dc64d17e0	get	/children	2025-07-25 23:27:49.290654	{"body":{}}
42ae5e31-9c43-4f0b-9e9e-fef574b9c2ff	5cb495f2584933082e54d33491e840b029fa1d66b7d1351eea06da4dc64d17e0	get	/attendance/present	2025-07-25 23:27:49.300288	{"body":{}}
465964ba-5114-4128-969c-7f9a88f7901c	5cb495f2584933082e54d33491e840b029fa1d66b7d1351eea06da4dc64d17e0	get	/ratios	2025-07-25 23:27:49.302668	{"body":{}}
c52bc79b-a8e8-474f-b146-1722682b5fa3	5cb495f2584933082e54d33491e840b029fa1d66b7d1351eea06da4dc64d17e0	get	/staff-schedules/today	2025-07-25 23:27:49.408841	{"body":{}}
1d099f91-3d60-4510-84a5-6407e2bdebc0	5cb495f2584933082e54d33491e840b029fa1d66b7d1351eea06da4dc64d17e0	get	/settings	2025-07-25 23:27:49.567369	{"body":{}}
e106486a-559e-45a2-b489-97ab277f3ffc	83264ab879a39f4c42ab6887b7d6d723e81fb20c639ac7f33aa805014ca7ebb0	login	/api/auth/login	2025-07-26 22:57:59.835505	\N
eaba7e13-858e-48b6-892e-04e02e9a2bc9	6a543d166e9fda5b76b35e7b828f1447a171f91417d2d3514d246b57b4b79a96	login	/api/auth/login	2025-07-26 22:58:24.475336	\N
23596736-6b05-4d17-890e-2d16d101ab5f	87cde6d23f703e1ead7dc3b96f6a29b928e9b46a5a7c6861d4b67a7ea58417d0	login	/api/auth/login	2025-07-26 23:02:47.717587	\N
212fde4d-dc1d-4993-91b3-0c0ca342ad45	e09f50443252fb806bb3a5f608743dfc67ba8b0670382e054441e27979d709c2	login	/api/auth/login	2025-07-26 23:06:59.32961	\N
4d5d7fae-75d9-4cc0-987f-ea9d992d34e5	c28c586cf979e179ab3ff19f4b5cc6db3511898a59184fabe9ba4daddff5255e	login	/api/auth/login	2025-07-26 23:07:26.576248	\N
41e01d95-a5be-4f7c-9880-d31518b8362c	f57a5db9180069d7028e9aa80aa30c6dd7d73288adf54ca0566cc240c5e6ffeb	login	/api/auth/login	2025-07-26 23:11:10.377926	\N
883a4c93-8fc9-4515-a582-1bae7103c440	58c9baf7aa23bc14cd7f35e6a58bec8f7c63546081313b85f9c4268227a37205	login	/api/auth/login	2025-07-26 23:16:05.254642	\N
51c96b4d-d07f-44e7-8122-df530d2c50dc	be94ddc633b03b24ed7056242b46eefb032b608a4d543531b469ba2b9dbddabb	login	/api/auth/login	2025-07-26 23:23:33.404766	\N
3eb43982-e4fe-4f1e-81fa-110fecf21d63	e8f0997d32f0d5626e4b8e44b6bfb60a8f8838bbb9608b879eabd67c9f91efb5	login	/api/auth/login	2025-07-28 13:01:53.044065	\N
bff989bb-6919-4b7f-b6b7-58e8abd8c4f7	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	login	/api/auth/login	2025-07-28 15:38:19.44792	\N
24df35ca-60ac-4b3e-9bd1-d8bffa0ce506	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/ratios	2025-07-28 15:38:22.194135	{"body":{}}
17fa9a60-1497-4a74-9c8c-7c3e7b607441	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/alerts/unread	2025-07-28 15:38:22.188741	{"body":{}}
1ab15b15-0d4a-4ba5-a28f-359073ee0115	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/attendance/present	2025-07-28 15:38:22.192807	{"body":{}}
0cae74c1-a18a-45f9-ade0-7c36bfeaf51d	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children	2025-07-28 15:38:22.193858	{"body":{}}
1b8f8c23-edba-4394-9ba6-c2e527930f43	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/dashboard/stats	2025-07-28 15:38:22.196312	{"body":{}}
61ba0dc8-56cc-4a1a-99e3-4ee0aabdef41	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/settings	2025-07-28 15:38:22.430255	{"body":{}}
5a7b3d48-e2ea-4c93-bb9d-e940c5372a23	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/staff-schedules/today	2025-07-28 15:38:22.280388	{"body":{}}
c1feb37b-2274-4141-ab53-49a7ddae5c09	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/dashboard/stats	2025-07-28 15:41:08.262473	{"body":{}}
42ba328d-d24d-4c4e-b332-306789f9d7cc	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/ratios	2025-07-28 15:41:08.258608	{"body":{}}
763c535f-898d-4d17-bfb9-0d7e9bbba6bd	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children	2025-07-28 15:41:08.262311	{"body":{}}
f67447b8-f2bf-4843-9890-4ba06cdaed42	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/alerts/unread	2025-07-28 15:41:08.258703	{"body":{}}
6c7bcd45-9764-4228-b75b-b20810d9e79a	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/attendance/present	2025-07-28 15:41:08.393238	{"body":{}}
d9d4c342-0c94-428b-bea8-8e9fbc4e53af	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/staff-schedules/today	2025-07-28 15:41:08.430058	{"body":{}}
94a00c8e-9efa-45c0-889e-9ae691f194a0	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/settings	2025-07-28 15:41:08.523204	{"body":{}}
c4ffff7f-a1db-409e-8e27-bcd24870d987	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/alerts/unread	2025-07-28 15:42:05.752251	{"body":{}}
d0ff6444-4274-458b-b3f4-9c2d621a5d25	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/dashboard/stats	2025-07-28 15:42:05.757704	{"body":{}}
3f8f7273-fb85-4dbf-95a8-067a8c203278	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children	2025-07-28 15:42:05.758518	{"body":{}}
f0915e24-f9d8-4d8c-93c1-4065227aa5df	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/staff-schedules/today	2025-07-28 15:42:05.759214	{"body":{}}
481d5f7c-b456-4f8f-967a-7ec49f902f22	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/attendance/present	2025-07-28 15:42:05.759835	{"body":{}}
11ca63a8-531f-4ed5-8f6c-45bbc13dc839	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/ratios	2025-07-28 15:42:05.76107	{"body":{}}
7ff60fd3-8fd8-41a5-9105-053e3d930094	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/settings	2025-07-28 15:42:05.951789	{"body":{}}
21b6cbaf-efb1-4540-a88a-d085bde7f86b	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/ratios	2025-07-28 15:43:55.577116	{"body":{}}
eadd7e7c-77d4-4f74-91eb-58f0d9495e9e	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/dashboard/stats	2025-07-28 15:43:55.572615	{"body":{}}
4256632e-dfab-47fb-b358-14f8ce7fced7	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/alerts/unread	2025-07-28 15:43:55.569498	{"body":{}}
e5558450-05a6-435c-9d55-bb996d94e69e	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children	2025-07-28 15:43:55.577436	{"body":{}}
4d72f1bb-35f3-4067-99e8-3f8902f59646	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/staff-schedules/today	2025-07-28 15:43:55.572414	{"body":{}}
f3ad47f1-5f3f-4929-8a2a-ce6c54303527	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/attendance/present	2025-07-28 15:43:55.577648	{"body":{}}
277b6756-2980-4e3b-9c58-ad09ba227712	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/settings	2025-07-28 15:43:55.792711	{"body":{}}
27c5b577-1857-4b09-80f2-c3fa8522da4b	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children	2025-07-28 15:47:27.453092	{"body":{}}
b7cf420a-e50c-4756-9bca-1503f4a5dc1e	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/dashboard/stats	2025-07-28 15:47:27.453886	{"body":{}}
3ed17e03-ec0c-4fee-8e7c-c3c3f6a5b9e7	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/attendance/present	2025-07-28 15:47:27.453988	{"body":{}}
07ce3dce-9eb2-4323-bd3c-50c8d42dd349	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/staff-schedules/today	2025-07-28 15:47:27.472063	{"body":{}}
c2612065-9137-4a03-a592-00b29efed975	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/ratios	2025-07-28 15:47:27.454826	{"body":{}}
bf6b00ae-0514-4620-a34c-c0db78a40307	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/alerts/unread	2025-07-28 15:47:27.45571	{"body":{}}
258b2e15-04cb-4485-b74f-08f046438999	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/settings	2025-07-28 15:47:27.724406	{"body":{}}
9626ec5a-9758-421c-86bb-c854cc328236	f871a304215279dbf58c1df51b4784c5436f362e213e947e1eb0aed8d9739400	login	/api/auth/login	2025-07-28 15:50:02.479464	\N
0cd0345a-0bd0-464f-874b-d1c8b2b4fb7d	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children	2025-07-28 15:51:45.946062	{"body":{}}
59e348a9-3abe-4639-bab7-875706ecc048	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/dashboard/stats	2025-07-28 15:51:45.946186	{"body":{}}
9a1a5deb-6107-4752-ac43-c780e9299d42	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/alerts/unread	2025-07-28 15:51:45.939419	{"body":{}}
0a5fa8ad-f3b9-4602-9b4d-faabb51aac0b	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/attendance/present	2025-07-28 15:51:45.944793	{"body":{}}
80e2e2fc-2e13-407c-a705-fd8372ea25f6	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/ratios	2025-07-28 15:51:45.945224	{"body":{}}
72993460-f942-4d04-96ed-acf79da9476d	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/staff-schedules/today	2025-07-28 15:51:45.948566	{"body":{}}
be3f90c4-bce5-4fdb-94b2-76a06b30c937	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/settings	2025-07-28 15:51:46.285122	{"body":{}}
981fdf26-b322-4e07-8c93-a36023dd7669	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children	2025-07-28 16:02:38.617524	{"body":{}}
37849ad9-1c0c-4f0b-a314-44503328e6b3	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/alerts/unread	2025-07-28 16:02:38.618671	{"body":{}}
55dd780f-790c-4dfc-9b23-d0024ac7bb55	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/attendance/present	2025-07-28 16:02:38.61561	{"body":{}}
29448f5b-8a64-410f-ab64-326e0f011c38	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/ratios	2025-07-28 16:02:38.615503	{"body":{}}
78e3b624-b71e-4b1f-8952-df06d10ebc09	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/dashboard/stats	2025-07-28 16:02:38.614355	{"body":{}}
20d526c3-0b13-4c7a-9615-fda9f91689c2	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/settings	2025-07-28 16:02:38.617672	{"body":{}}
ac076b0c-113e-4ed7-bd61-eb1d005d206f	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/staff-schedules/today	2025-07-28 16:02:38.902528	{"body":{}}
95a98e3d-f262-412e-b995-46b204d4c5ae	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children	2025-07-28 16:08:46.845362	{"body":{}}
423d36f3-f5ea-4336-83bb-bd08170e8031	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/attendance/present	2025-07-28 16:08:46.844406	{"body":{}}
f3f72faf-e7d3-4ff6-8ea9-5f56bd730efc	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/ratios	2025-07-28 16:08:46.840666	{"body":{}}
a3cdc9be-5b16-4fde-abad-d5b7f1cc5b3f	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/alerts/unread	2025-07-28 16:08:46.840769	{"body":{}}
72beab47-7c24-4af5-b826-d750893422b4	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/dashboard/stats	2025-07-28 16:08:46.839886	{"body":{}}
1baaaf24-fd94-4b92-adf8-7018156a1248	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/staff-schedules/today	2025-07-28 16:08:46.843748	{"body":{}}
a7c2734a-00e6-495d-b1a3-619842cc516f	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/settings	2025-07-28 16:08:47.122588	{"body":{}}
f5bb1f0f-d321-4b6e-ad11-ba6696ae9bc6	31d7349908d4f1a72925bd7273b32c7ac414d2e56c598dceb951f18c4dd63e55	login	/api/auth/login	2025-07-28 16:24:23.73993	\N
9525c831-2c35-49dc-a8a7-2cdd1d6a15be	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/alerts/unread	2025-07-28 16:40:20.55197	{"body":{}}
d4ba4610-7ae1-4540-874e-2dcb72372803	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/attendance/present	2025-07-28 16:40:20.551316	{"body":{}}
471f60ed-e0fd-4697-99a6-b226425eb279	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/dashboard/stats	2025-07-28 16:40:20.55054	{"body":{}}
cfd59497-08c5-4ee3-8f8f-e35e53e83820	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children	2025-07-28 16:40:20.551395	{"body":{}}
06bfdc94-84ab-40dc-8483-afd6bfbba089	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/ratios	2025-07-28 16:40:20.552112	{"body":{}}
5534250f-b06d-45c4-854f-2b891a772cd6	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/staff-schedules/today	2025-07-28 16:40:20.552052	{"body":{}}
2da7080c-cc93-42bb-a489-db80c153bf90	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/settings	2025-07-28 16:40:20.837437	{"body":{}}
64b889b5-d99e-4b7e-bbe5-125bef283fd1	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	post	/children	2025-07-28 16:41:53.480741	{"body":{"firstName":"Britt","lastName":"Legg","dateOfBirth":"2020-01-10T00:00:00.000Z","room":"Preschool A","parentName":"Della Legg","parentEmail":"doclegg05@yahoo.com","parentPhone":"3048267400","emergencyContactName":"Della Legg","emergencyContactPhone":"304872-4747","allergies":[],"medicalNotes":"","immunizations":[],"tuitionRate":"","medicalConditions":[],"currentMedications":"","dietaryRestrictions":[],"foodAllergies":[],"specialCareInstructions":"","physicalLimitations":"","bloodType":"","primaryPhysician":"","physicianPhone":"","pediatricianName":"","pediatricianPhone":"","preferredHospital":"","insuranceProvider":"","insurancePolicyNumber":"","insuranceGroupNumber":"","emergencyMedicalAuthorization":false,"medicalActionPlan":"","epiPenRequired":false,"inhalerRequired":false,"immunizationRecords":"","immunizationExemptions":[],"nextImmunizationDue":"","ageGroup":"school_age"}}
642bd361-ff43-4b63-88f4-eec933f8a401	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	post	/children	2025-07-28 16:41:55.988635	{"body":{"firstName":"Britt","lastName":"Legg","dateOfBirth":"2020-01-10T00:00:00.000Z","room":"Preschool A","parentName":"Della Legg","parentEmail":"doclegg05@yahoo.com","parentPhone":"3048267400","emergencyContactName":"Della Legg","emergencyContactPhone":"304872-4747","allergies":[],"medicalNotes":"","immunizations":[],"tuitionRate":"","medicalConditions":[],"currentMedications":"","dietaryRestrictions":[],"foodAllergies":[],"specialCareInstructions":"","physicalLimitations":"","bloodType":"","primaryPhysician":"","physicianPhone":"","pediatricianName":"","pediatricianPhone":"","preferredHospital":"","insuranceProvider":"","insurancePolicyNumber":"","insuranceGroupNumber":"","emergencyMedicalAuthorization":false,"medicalActionPlan":"","epiPenRequired":false,"inhalerRequired":false,"immunizationRecords":"","immunizationExemptions":[],"nextImmunizationDue":"","ageGroup":"school_age"}}
a11e4a63-a3b9-4fca-9eaf-81fa9ed45f0b	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	post	/children	2025-07-28 16:42:13.179708	{"body":{"firstName":"Britt","lastName":"Legg","dateOfBirth":"2020-01-10T00:00:00.000Z","room":"Preschool A","parentName":"Della Legg","parentEmail":"doclegg05@yahoo.com","parentPhone":"3048267400","emergencyContactName":"Della Legg","emergencyContactPhone":"304872-4747","allergies":[],"medicalNotes":"","immunizations":[],"tuitionRate":"","medicalConditions":[],"currentMedications":"","dietaryRestrictions":[],"foodAllergies":[],"specialCareInstructions":"","physicalLimitations":"","bloodType":"O+","primaryPhysician":"","physicianPhone":"","pediatricianName":"","pediatricianPhone":"","preferredHospital":"","insuranceProvider":"","insurancePolicyNumber":"","insuranceGroupNumber":"","emergencyMedicalAuthorization":true,"medicalActionPlan":"","epiPenRequired":false,"inhalerRequired":false,"immunizationRecords":"","immunizationExemptions":[],"nextImmunizationDue":"","ageGroup":"school_age"}}
893ca96c-0f33-40d5-bb46-fa1ab15240eb	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/attendance/present	2025-07-28 16:47:23.961095	{"body":{}}
8a989454-1443-4e3d-ab26-217897c4cb76	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/ratios	2025-07-28 16:47:23.959422	{"body":{}}
ce466e93-5486-4305-97f2-ab00f80c6d3f	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children	2025-07-28 16:47:23.955388	{"body":{}}
24a6f5cb-7642-4811-86f7-a6db673fa607	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/alerts/unread	2025-07-28 16:47:23.952661	{"body":{}}
44e8a9ea-4f42-4caa-8612-92e8397d4e9d	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/dashboard/stats	2025-07-28 16:47:23.961277	{"body":{}}
7c2f3794-9714-4081-b750-e7fc79bb6ee5	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/staff-schedules/today	2025-07-28 16:47:23.960378	{"body":{}}
25d55180-0fd5-4eb6-b906-ac15ede263bd	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/settings	2025-07-28 16:47:24.246909	{"body":{}}
56c134f2-92bd-4b20-ba69-f3bba6510dac	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	post	/children	2025-07-28 16:48:01.786635	{"body":{"firstName":"Britt","lastName":"Legg","dateOfBirth":null,"ageGroup":"older_school_age","room":"","parentName":"Della Legg","parentEmail":"doclegg05@yahoo.com","parentPhone":"3048267400","emergencyContactName":"Della Legg","emergencyContactPhone":"3048267400"}}
184e4079-cd98-4af4-b397-ca3e8e348e8c	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/alerts/unread	2025-07-28 16:50:41.808892	{"body":{}}
22af8bb9-f63a-435f-bb9b-ebe0f94c055f	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/staff-schedules/today	2025-07-28 16:50:41.82055	{"body":{}}
77cf6f7c-f249-4907-9896-8a132424bf8e	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/dashboard/stats	2025-07-28 16:50:41.821383	{"body":{}}
7ed15997-0867-4445-bdea-e9074761b5b3	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children	2025-07-28 16:50:41.824953	{"body":{}}
cc28b0fb-a9c6-469b-a145-d3c91658a02f	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/attendance/present	2025-07-28 16:50:41.828201	{"body":{}}
2bb6056d-5c77-4679-bba9-70c719d3fbd6	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/ratios	2025-07-28 16:50:41.827867	{"body":{}}
717bcd98-ab6a-4ae7-a9e7-ec25d13a3ecf	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/settings	2025-07-28 16:50:42.11424	{"body":{}}
bb7b006c-1a19-421f-bc90-e1cd5302dbb2	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	post	/children	2025-07-28 16:51:33.343758	{"body":{"firstName":"Britt","lastName":"Legg","dateOfBirth":"2022-01-10T00:00:00.000Z","ageGroup":"preschool","room":"Preschool A","parentName":"Della Legg","parentEmail":"doclegg05@yahoo.com","parentPhone":"3048267400","emergencyContactName":"Della Legg","emergencyContactPhone":"3048267400"}}
64d6534f-1e93-4f14-bb66-77cfd4d5e121	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/ratios	2025-07-28 16:53:53.986526	{"body":{}}
d90f9102-dfbc-47c1-b492-564a9ca1d0a0	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/alerts/unread	2025-07-28 16:53:53.982297	{"body":{}}
8ce816b5-8593-464d-8226-6e6260504c83	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/dashboard/stats	2025-07-28 16:53:53.983564	{"body":{}}
ffe2a9ce-b9dd-488e-96a9-80c7b7f7fe3f	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children	2025-07-28 16:53:53.986288	{"body":{}}
5abfeed8-dda5-4510-adc9-b5bbb83edc61	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/attendance/present	2025-07-28 16:53:53.988432	{"body":{}}
03f1a631-8770-406d-8235-d9453aff4d03	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/staff-schedules/today	2025-07-28 16:53:54.000301	{"body":{}}
085ad3ca-339e-4bf5-8c56-f8b8a7a3bf06	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/settings	2025-07-28 16:53:54.258141	{"body":{}}
93bf9422-29cd-44ac-bfa4-657c1ed02927	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/alerts/unread	2025-07-28 16:54:16.997933	{"body":{}}
b4e1e3da-c091-44ab-a1f8-8d6a5277bec2	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/alerts/unread	2025-07-28 16:54:17.23548	{"body":{}}
ac36fef1-41ac-48a0-a97f-d7d2de07750a	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	post	/children	2025-07-28 16:54:41.329411	{"body":{"firstName":"Britt","lastName":"Legg","dateOfBirth":"2022-01-10T00:00:00.000Z","ageGroup":"preschool","room":"Preschool A","parentName":"Della Legg","parentEmail":"doclegg05@yahoo.com","parentPhone":"3048267400","emergencyContactName":"Della Legg","emergencyContactPhone":"3048267400"}}
c2dfb022-a6bd-4156-9b9e-77765c620a82	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 16:56:37.415517	{"body":{}}
1262aca0-ba5e-415f-808f-ee22634c6cbf	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/alerts/unread	2025-07-28 16:58:49.115616	{"body":{}}
0f50fcc8-28a0-4ccc-a713-5dba82876645	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 16:58:49.116802	{"body":{}}
48ad630b-daae-449a-a49f-c6a7e3e56a77	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/alerts/unread	2025-07-28 16:58:49.36016	{"body":{}}
30f614eb-91eb-4bdd-aee9-1f380c831c35	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 16:58:49.361559	{"body":{}}
c6c168f2-dcc6-4f76-addd-78b7fd5c52ce	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/alerts/unread	2025-07-28 16:58:49.592459	{"body":{}}
4b388639-f660-4bda-a350-2b8a314a2807	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 16:58:49.602502	{"body":{}}
cdc4aad1-a2f0-43c3-904b-261e782f71fd	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 16:58:51.295965	{"body":{}}
39a85f87-a11b-4a5d-aaa8-dd54bb1392e2	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 16:58:51.535029	{"body":{}}
7fff4dfb-e6fa-4153-8434-15602cbae33e	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 16:58:51.77544	{"body":{}}
96b21622-3760-4471-a497-de4240f68904	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 16:59:04.313003	{"body":{}}
b48ab272-5e40-403e-b18d-9f6f60e38e3b	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 16:59:04.545426	{"body":{}}
5c112288-3edd-469f-bb3b-fd6cf7d38948	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 16:59:04.793295	{"body":{}}
51db13e8-80ae-4aca-9d3b-0b37a3e212af	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/alerts/unread	2025-07-28 17:00:57.806126	{"body":{}}
587cb5de-894f-4173-b84c-23f6e74a56a7	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 17:00:57.807945	{"body":{}}
a9b2bea9-0c46-45d3-b949-304af21f75b3	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/alerts/unread	2025-07-28 17:00:58.042185	{"body":{}}
8410c00f-6d31-47aa-b053-1092383239ef	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 17:00:58.046275	{"body":{}}
f3fcfd9f-75d2-42c6-ac7e-d342de66fbfc	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 17:00:58.284599	{"body":{}}
fbf2680d-e6e3-4d28-a443-b1901b0d01ba	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/alerts/unread	2025-07-28 17:00:58.285615	{"body":{}}
6284bc1e-9061-4674-beb8-62c8f5f160cc	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/alerts/unread	2025-07-28 17:01:00.556157	{"body":{}}
344e8802-d3c6-4588-b9a0-32c729b1e238	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children	2025-07-28 17:01:00.557505	{"body":{}}
413229e3-aaf2-4390-ab74-e5c7f58857da	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/dashboard/stats	2025-07-28 17:01:00.560362	{"body":{}}
af75fb9a-3a86-4a60-b2da-3e23c63c8289	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/staff-schedules/today	2025-07-28 17:01:00.562339	{"body":{}}
0f88b0bd-d088-42b2-944e-11ca2b3c4cc4	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/attendance/present	2025-07-28 17:01:00.564204	{"body":{}}
15e2e460-ee8e-4803-82ae-b7585e767aa8	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/ratios	2025-07-28 17:01:00.567599	{"body":{}}
959911e0-d824-4946-8778-7802b9e93505	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/settings	2025-07-28 17:01:00.78094	{"body":{}}
e28011f0-4a53-48cc-914d-9804276022ed	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 17:01:05.733485	{"body":{}}
f1cc962f-2fbb-4d0a-9642-a5fe639a55bd	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	post	/children	2025-07-28 17:02:57.801519	{"body":{"firstName":"Britt","lastName":"Legg","dateOfBirth":"2022-01-10T00:00:00.000Z","ageGroup":"preschool","room":"Preschool A","parentName":"Della Legg","parentEmail":"doclegg05@yahoo.com","parentPhone":"3048267400","emergencyContactName":"Della Legg","emergencyContactPhone":"3048267400"}}
b0cb3d7b-48b9-42a6-8c83-6d5f9ffa91c6	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 17:02:58.10397	{"body":{}}
9967c09e-5f31-4223-ac06-9496df57b33d	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 17:04:51.296273	{"body":{}}
914c0871-5cd8-44f8-bdda-0bb843817265	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 17:04:53.293871	{"body":{}}
ed18dd28-e035-4cba-8f24-34afa80da4f0	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 17:05:08.296198	{"body":{}}
68a60ac5-1cf7-4d64-a311-baed6434b80b	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children	2025-07-28 17:05:39.497242	{"body":{}}
d0697638-5043-451e-9077-8fa366686e98	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/ratios	2025-07-28 17:05:39.50078	{"body":{}}
79bbba43-ff8d-4110-a60a-1c7d105f8f89	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/alerts/unread	2025-07-28 17:05:39.501775	{"body":{}}
739cc062-0707-42ac-8959-d92f4ea97af4	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/staff-schedules/today	2025-07-28 17:05:39.503344	{"body":{}}
6e005a38-1823-4765-bcae-76557235f7d7	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/dashboard/stats	2025-07-28 17:05:39.504632	{"body":{}}
4c8fcddd-5cd2-4680-8f19-e16cd681c6cd	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/attendance/present	2025-07-28 17:05:39.507203	{"body":{}}
5dbada29-adcb-463e-84f2-db913ffc466c	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/settings	2025-07-28 17:05:39.742391	{"body":{}}
9f613e2e-27f5-4b57-bab2-149863e4a2d6	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 17:05:41.294055	{"body":{}}
bae54d8f-9abf-467e-9540-35fda72e7659	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	post	/children	2025-07-28 17:08:02.546192	{"body":{"firstName":"Britt","lastName":"Legg","dateOfBirth":"2022-01-10T00:00:00.000Z","ageGroup":"preschool","room":"Preschool A","parentName":"Della Legg","parentEmail":"doclegg05@yahoo.com","parentPhone":"3048267400","emergencyContactName":"Della Legg","emergencyContactPhone":"3048267400"}}
ab541bde-52c3-4aab-8b69-b78c31bab85b	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/alerts/unread	2025-07-28 17:08:08.478891	{"body":{}}
86773196-72b5-4ccc-ba55-cb68f1826873	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 17:08:08.485358	{"body":{}}
77dcd1ae-1868-4764-b89c-b842e8207b72	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 17:11:08.312799	{"body":{}}
70493bbb-f2ce-47f2-be0c-6108e0f8eb41	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 17:12:19.235395	{"body":{}}
4df4e1cc-46e2-4509-8689-3b26868ce8aa	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/alerts/unread	2025-07-28 17:12:19.236453	{"body":{}}
4c29dccf-bb62-487b-a5e4-036d6f060f2b	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 17:12:41.297467	{"body":{}}
8e8a8768-deaa-4fc7-b1c5-324872df8e49	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children	2025-07-28 17:13:34.287722	{"body":{}}
271ff76f-d213-4582-a57c-f52e91d206e2	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/alerts/unread	2025-07-28 17:13:34.288509	{"body":{}}
a42398cb-997c-44b9-9cf0-317da9bb6d9b	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/staff-schedules/today	2025-07-28 17:13:34.289423	{"body":{}}
8810d495-23f7-4fcd-b7dc-d5fe09eddc33	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/dashboard/stats	2025-07-28 17:13:34.290134	{"body":{}}
67a027b3-9769-4938-878e-232d6b9eb6ff	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/settings	2025-07-28 17:13:34.291733	{"body":{}}
2386920d-3eda-456d-94c1-44b7111f31a3	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/attendance/present	2025-07-28 17:13:34.292436	{"body":{}}
28ee1628-2d9b-4cad-9e1d-eaea9f9613bb	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/ratios	2025-07-28 17:13:34.529804	{"body":{}}
0343ff13-de2e-40b8-9849-6fbde1c9cfe7	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 17:13:37.726905	{"body":{}}
4d29921f-382e-4710-af92-1b73ef8fa826	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 17:13:38.961394	{"body":{}}
366315c5-6115-4b22-af50-8bdc29faf9cb	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 17:13:40.203845	{"body":{}}
e5c48270-5f6d-41d1-8af8-0cbe580c3594	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 17:13:41.439092	{"body":{}}
447c9e51-ea45-4a2e-a52a-19d04022df7d	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	post	/children	2025-07-28 17:14:30.802058	{"body":{"firstName":"Britt","lastName":"Legg","dateOfBirth":"2022-01-10T00:00:00.000Z","ageGroup":"preschool","room":"Preschool A","parentName":"Della Legg","parentEmail":"doclegg05@yahoo.com","parentPhone":"3048267400","emergencyContactName":"Della Legg","emergencyContactPhone":"3048267400"}}
240e268e-2eef-455e-b829-8950454c2091	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 17:14:31.143176	{"body":{}}
27476906-8027-419f-92d0-0da5bcbd8a1f	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 17:14:32.385756	{"body":{}}
86b229f5-7b3f-478b-92dd-6b2a68ae5ffa	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 17:14:33.622627	{"body":{}}
2bc1dc73-79cf-42c3-8db2-08fb658e44b0	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 17:14:34.868561	{"body":{}}
3e47e17f-1a4c-40dd-8824-decfc99c84f6	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 17:16:46.489908	{"body":{}}
aeac8b15-f457-4bf9-9e1d-6d5f2307fba7	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 17:16:47.753834	{"body":{}}
26884bec-53f4-443e-ac95-3b53b65fe342	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 17:16:49.124452	{"body":{}}
d9095836-5c23-49fe-a3f0-a245acc635dc	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children/1	2025-07-28 17:16:50.36961	{"body":{}}
74035dee-4aa8-44d9-8e58-85430723c174	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/dashboard/stats	2025-07-28 17:18:03.506934	{"body":{}}
49c392fe-6593-410f-8260-64102ceef1aa	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/attendance/present	2025-07-28 17:18:03.507735	{"body":{}}
9378f4f7-3461-464b-ac50-cfc5154242e9	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/alerts/unread	2025-07-28 17:18:03.508299	{"body":{}}
b417b164-9894-4972-8fcb-6c073818f749	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/ratios	2025-07-28 17:18:03.508908	{"body":{}}
0167ac4c-47d1-4409-9759-e0c400a4fc49	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/children	2025-07-28 17:18:03.509433	{"body":{}}
e1e03528-2234-442f-a891-36ad22222ade	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/staff-schedules/today	2025-07-28 17:18:03.52858	{"body":{}}
968d5480-d85b-4bb4-9317-a81a7f58864c	676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	get	/settings	2025-07-28 17:18:03.759059	{"body":{}}
ae78b675-9ce3-4dc5-8027-36672b520b56	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	login	/api/auth/login	2025-07-28 17:18:15.275823	\N
aa55b8e7-b1ec-4d19-87d8-86194ec170f7	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/attendance/present	2025-07-28 17:18:18.096297	{"body":{}}
5e86728a-5307-430d-ab3d-9b11895759f5	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/ratios	2025-07-28 17:18:18.097159	{"body":{}}
13217a95-c23a-4e1e-b54a-559653bb87f9	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/alerts/unread	2025-07-28 17:18:18.097997	{"body":{}}
a65f46e9-f477-43e4-8821-c6ec981ce5bc	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:18:18.098975	{"body":{}}
604415da-6809-49b4-b88f-7e83d5fb406e	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/dashboard/stats	2025-07-28 17:18:18.099581	{"body":{}}
3be14b98-e365-4848-900c-fd998cc5cdf8	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/staff-schedules/today	2025-07-28 17:18:18.204193	{"body":{}}
c4d3f776-2437-418f-94c2-2b236675f3c3	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/settings	2025-07-28 17:18:18.298962	{"body":{}}
afee6e65-2497-4939-a8ea-1a1697e407c3	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children/1	2025-07-28 17:18:20.01382	{"body":{}}
918b3889-7367-485e-ae73-d1c75165fc6f	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children/1	2025-07-28 17:18:21.26796	{"body":{}}
cc60d736-c01d-482b-8bd0-4bd3af70b368	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children/1	2025-07-28 17:18:22.507102	{"body":{}}
e8ca790b-c195-4fd8-ba22-f1a51c3f58e2	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children/1	2025-07-28 17:18:23.752929	{"body":{}}
59b63ebc-6247-4092-ac23-c4fbd19666cc	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children/1	2025-07-28 17:22:38.085908	{"body":{}}
7a82beb2-eaa9-4a8c-bea6-d1157a79bfa1	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/alerts/unread	2025-07-28 17:22:38.084993	{"body":{}}
27b2f136-4b8d-4808-bfca-25539877c594	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/ratios	2025-07-28 17:22:43.156142	{"body":{}}
cdc216f2-bff4-4661-a683-96461527b21d	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/dashboard/stats	2025-07-28 17:22:43.156921	{"body":{}}
9bb5cc59-cef0-4468-b8cb-f50119e293d6	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/alerts/unread	2025-07-28 17:22:43.158864	{"body":{}}
9a7ba02c-ac6b-4bac-ac83-43ae26b592f3	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/attendance/present	2025-07-28 17:22:43.159257	{"body":{}}
7facecb9-62de-4817-bdb9-918a7ae691da	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:22:43.160396	{"body":{}}
83f2448c-d43a-41f0-9f00-344eaba8974f	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/staff-schedules/today	2025-07-28 17:22:43.163376	{"body":{}}
b6d1b094-f7a4-4666-9d7e-8f3de2e826a3	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/settings	2025-07-28 17:22:43.388733	{"body":{}}
71305448-7572-4d2d-a47b-2378afa3d85f	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children/1	2025-07-28 17:22:45.004518	{"body":{}}
c646705c-7987-42d6-b525-7222fc0b8790	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children/1	2025-07-28 17:22:46.247935	{"body":{}}
7ddacfed-1a4f-4dd8-85c9-ab7b3991475a	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children/1	2025-07-28 17:22:47.51577	{"body":{}}
db2d3064-f495-4daf-89e8-6913f5a8a406	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children/1	2025-07-28 17:22:48.751687	{"body":{}}
31e401d0-b8c4-4e18-824d-9dc4c47b10b1	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	post	/children	2025-07-28 17:23:15.375337	{"body":{"firstName":"Britt","lastName":"Legg","dateOfBirth":"2022-01-10T00:00:00.000Z","ageGroup":"preschool","room":"Preschool A","parentName":"Della Legg","parentEmail":"doclegg05@yahoo.com","parentPhone":"3048267400","emergencyContactName":"Della Legg","emergencyContactPhone":"3048267400"}}
125180d8-5cbf-4f24-877b-8cf81aa49749	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children/1	2025-07-28 17:23:15.726011	{"body":{}}
671af77c-0011-4e0c-a430-2a7936a3d902	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children/1	2025-07-28 17:23:16.959988	{"body":{}}
80cbda64-9a56-41a7-b628-2690e5745ea8	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children/1	2025-07-28 17:23:18.200902	{"body":{}}
0674cfcc-0023-4aca-831d-b2be7ad12332	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children/1	2025-07-28 17:23:19.434309	{"body":{}}
bf5f3ccc-96ad-4f73-a317-d55969c12fa1	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	post	/children	2025-07-28 17:23:52.566858	{"body":{"firstName":"Britt","lastName":"Legg","dateOfBirth":"2022-01-10T00:00:00.000Z","ageGroup":"preschool","room":"Preschool A","parentName":"Della Legg","parentEmail":"doclegg05@yahoo.com","parentPhone":"3048267400","emergencyContactName":"Della Legg","emergencyContactPhone":"3048267400"}}
a8728842-09ec-48b0-ae69-d72c5f8180ee	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children/1	2025-07-28 17:23:52.914233	{"body":{}}
9cb0cd7b-76b3-4181-9512-968c98d21e00	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children/1	2025-07-28 17:23:54.166856	{"body":{}}
9fd2fe2f-40d4-4f6d-a7c1-ba9ee9215d4d	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children/1	2025-07-28 17:23:55.415757	{"body":{}}
3072fb45-c50d-402c-96fd-1967e8ca27db	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children/1	2025-07-28 17:23:56.663732	{"body":{}}
1c9ed0eb-61c7-4fb3-9d1d-4cb03c99d764	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children/1	2025-07-28 17:30:55.289817	{"body":{}}
192d396f-816c-482f-b663-2eebce606406	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:30:55.291726	{"body":{}}
9e38746b-f241-446b-a361-d798973b1075	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:32:39.174632	{"body":{}}
7e62533d-38b4-452c-a023-83c023e36710	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/alerts/unread	2025-07-28 17:32:39.176243	{"body":{}}
f32bd45e-958f-4f67-8e36-cfc2e88dd7ba	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/alerts/unread	2025-07-28 17:33:39.784222	{"body":{}}
b6584035-8244-4ed9-9af0-6869c9e7131d	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/dashboard/stats	2025-07-28 17:33:39.785668	{"body":{}}
57b0f3fd-44ca-48ca-8e58-c4f5ebc1a39c	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:33:39.787319	{"body":{}}
68a3bf5a-acde-4b24-8f0e-1b095322bd84	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/ratios	2025-07-28 17:33:39.788459	{"body":{}}
93c176f8-3167-4efc-bd5f-f09d6ac07542	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/attendance/present	2025-07-28 17:33:39.790194	{"body":{}}
87a1ef93-aa1e-47be-a7da-29a4a7c10109	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/settings	2025-07-28 17:33:39.896809	{"body":{}}
804344f2-e454-4b45-9ff5-9e080319a4af	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/staff-schedules/today	2025-07-28 17:33:40.036677	{"body":{}}
76eb04a9-3a8b-4694-82b8-35af9fea1b6f	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:33:47.960538	{"body":{}}
d2f7d80c-ba39-4bf5-b8fe-31a862ecdd5b	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	post	/children	2025-07-28 17:35:13.775469	{"body":{"firstName":"Bart ","lastName":"Legg","dateOfBirth":"2023-06-08T00:00:00.000Z","ageGroup":"toddler","room":"Toddler B","parentName":"Della Legg","parentEmail":"doclegg05@yahoo.com","parentPhone":"3048267400","emergencyContactName":"Della Legg","emergencyContactPhone":"3048267400"}}
0ad38722-f319-4171-b678-3409ab8712d7	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:35:14.151663	{"body":{}}
59276441-1185-4d50-9065-73c2e7d83c5f	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:35:14.346455	{"body":{}}
1cb09778-7357-4014-b572-5591383d4c58	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/alerts/unread	2025-07-28 17:35:30.300071	{"body":{}}
52b4c195-1b06-402a-a0e6-91a61fb0bb1e	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:35:30.303053	{"body":{}}
0bce9e07-aab1-45a4-a294-6f2a5a0e136b	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	post	/children	2025-07-28 17:37:08.19037	{"body":{"firstName":"Rebecca ","lastName":"Hammons","dateOfBirth":"2024-07-06T00:00:00.000Z","ageGroup":"infant","room":"Infant Room","parentName":"Robin Hammons","parentEmail":"hammonsrobin@gmail.com","parentPhone":"5558683021","emergencyContactName":"Robin","emergencyContactPhone":"Hammons"}}
e6f8a098-3d88-4fa9-b79e-d0226dd41332	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:37:08.56923	{"body":{}}
2ef480a8-620d-4208-9727-840319bc35b7	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:37:08.76333	{"body":{}}
805201d9-ce9b-4d03-a538-3131840bd072	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:39:44.433637	{"body":{}}
9c1f3283-55ad-4b5f-8d1b-e792e30479c1	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:39:45.321655	{"body":{}}
c969a318-fd69-4a12-8558-5ed5190e3418	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:40:24.819904	{"body":{}}
0be2f371-b4df-4de3-a536-18ff158d0d8f	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/alerts/unread	2025-07-28 17:40:24.939425	{"body":{}}
66687521-1286-4468-9fc1-3b9125b45f24	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/ratios	2025-07-28 17:40:24.945566	{"body":{}}
8357d7c2-fad8-4eac-ae7f-a0fa94aa2a40	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/staff-schedules/today	2025-07-28 17:40:24.947749	{"body":{}}
0a2d31f6-e522-4812-8c5b-dcfe5f7d64d5	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/dashboard/stats	2025-07-28 17:40:24.949008	{"body":{}}
534f608b-0cf9-4f1f-9946-4d83cc0be4b5	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/attendance/present	2025-07-28 17:40:24.950105	{"body":{}}
6c212a5a-ebde-4f6d-a549-726e1519dcf0	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/settings	2025-07-28 17:40:25.01466	{"body":{}}
0a741b6f-391d-439a-82be-226c663d30dd	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:40:27.08637	{"body":{}}
0a9f3592-9009-4f73-996b-b586d888a8f5	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	post	/children	2025-07-28 17:41:28.622386	{"body":{"firstName":"Tammy","lastName":"Lemaster","dateOfBirth":"2025-06-30T00:00:00.000Z","ageGroup":"infant","room":"Infant Room","parentName":"Christina Lemaster","parentEmail":"doclegg05@yahoo.com","parentPhone":"3048267400","emergencyContactName":"Christina Lemaster","emergencyContactPhone":"888-888-8888"}}
1604c853-24f9-44a3-8aa1-f058079678be	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:41:28.902876	{"body":{}}
176fc097-8f03-4aa4-9e4d-fd651f3d6c3a	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:41:45.552703	{"body":{}}
6185a186-05a2-4105-96c5-a7aa267fdc1b	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/alerts/unread	2025-07-28 17:41:45.553985	{"body":{}}
359dd967-076f-4dbd-b56d-beb1b54ffbc1	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	post	/children	2025-07-28 17:42:45.776311	{"body":{"firstName":"Tori","lastName":"Propps","dateOfBirth":"2020-02-14T00:00:00.000Z","ageGroup":"school_age","room":"Preschool B","parentName":"Ms Propps","parentEmail":"proppsmrs@gmail.com","parentPhone":"888-666-2222","emergencyContactName":"Mrs Propps","emergencyContactPhone":"888-666-2222"}}
5771a6bd-e890-4945-aec1-c74b6aba95d8	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:42:46.024806	{"body":{}}
0dcaaf6e-1eac-4dea-b739-ec70ba42a244	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:45:07.322331	{"body":{}}
2e29c568-2dc8-4cd7-a5fc-321c807f946d	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:45:07.643664	{"body":{}}
4700b0e5-7069-4616-bef3-da737f6bae0b	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:45:50.301714	{"body":{}}
d7aaee8e-ce4d-4a3b-a7a4-c1ff6eb4e8ba	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:45:51.309462	{"body":{}}
9a79251f-15e6-4c14-af99-4cd3864758dd	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:46:39.026111	{"body":{}}
8abc73be-14b3-4c3e-87a5-d2c57d683c58	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/alerts/unread	2025-07-28 17:46:39.027279	{"body":{}}
1ab0f64e-474b-4c43-b7dd-ac7f7504cef9	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/dashboard/stats	2025-07-28 17:46:39.028896	{"body":{}}
77da0026-049a-415e-a5e2-2993ac5699d4	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/ratios	2025-07-28 17:46:39.03022	{"body":{}}
cc2701cf-9912-48b8-98b9-26bba69aae94	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/attendance/present	2025-07-28 17:46:39.030868	{"body":{}}
13639a15-953f-49c7-b7e8-316898a2678e	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/staff-schedules/today	2025-07-28 17:46:39.033404	{"body":{}}
b5ae0ce7-6bac-4648-a586-58a052390d08	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/settings	2025-07-28 17:46:39.297206	{"body":{}}
d40bfb6e-796a-46df-a9d7-4c09a4d38447	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:46:45.265015	{"body":{}}
33defc68-dad5-4a34-a548-cfa200cb117e	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	post	/children	2025-07-28 17:47:42.291491	{"body":{"firstName":"David ","lastName":"Smith","dateOfBirth":"2019-05-24T00:00:00.000Z","ageGroup":"school_age","room":"School Age","parentName":"Mrs Smith","parentEmail":"SmithMrs@gmail.com","parentPhone":"777-522-8023"}}
7b3d65cd-a90d-4b6b-8b8a-6384423fca27	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/alerts/unread	2025-07-28 17:49:10.266211	{"body":{}}
59013703-7882-4a2f-b61d-ba40e1bfeed7	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/staff-schedules/today	2025-07-28 17:49:10.267619	{"body":{}}
3b65f4e8-7cf2-47c2-81d0-8f19d336a485	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/dashboard/stats	2025-07-28 17:49:10.265045	{"body":{}}
76683798-8a07-41f7-b5a7-307e17970878	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/ratios	2025-07-28 17:49:10.267758	{"body":{}}
73048fd5-8b90-44e4-837e-cfb2bd636314	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/attendance/present	2025-07-28 17:49:10.266659	{"body":{}}
5159529b-2312-4ed0-9be8-359aad520913	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:49:10.266453	{"body":{}}
093a6f2b-1aa1-4deb-98fb-54181c48e5f8	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/settings	2025-07-28 17:49:10.561407	{"body":{}}
59d5c62f-8a58-4c00-9867-bae88e454424	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:49:13.025348	{"body":{}}
d638aed7-c7a5-4bd1-b349-664ca649e31a	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	post	/children	2025-07-28 17:49:53.213116	{"body":{"firstName":"Jennifer","lastName":"Holcomb","dateOfBirth":"2022-12-24T00:00:00.000Z","ageGroup":"toddler","room":"Toddler B","parentName":"Mrs Holcomb","parentEmail":"holcomb@gmail.com"}}
22bf16c7-e917-4d01-9689-463a216e5011	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/alerts/unread	2025-07-28 17:51:25.490325	{"body":{}}
fafde20e-0e37-4f77-8027-8750ab1369aa	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/attendance/present	2025-07-28 17:51:25.491499	{"body":{}}
a355c345-de1f-467e-9119-139a8c9533d1	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:51:25.492505	{"body":{}}
fdb3eb54-f6ad-49a2-a323-fe111881981f	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/ratios	2025-07-28 17:51:25.493826	{"body":{}}
29c67795-50d2-40c8-b476-f509bad6623b	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/dashboard/stats	2025-07-28 17:51:25.509333	{"body":{}}
2ec3816b-d6e0-46ba-a6f7-c9d71b1f5095	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/staff-schedules/today	2025-07-28 17:51:25.513384	{"body":{}}
5615505d-7932-484b-bbe7-39e6862650bf	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/settings	2025-07-28 17:51:25.747036	{"body":{}}
f69d788e-65b1-4a2c-b861-b60cf1f16bd5	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:51:28.042918	{"body":{}}
1ca544b1-9c91-45e3-bd43-d88e53558824	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	post	/children	2025-07-28 17:52:25.98945	{"body":{"firstName":"Heather ","lastName":"Tharp","dateOfBirth":"2025-02-17T00:00:00.000Z","ageGroup":"infant","room":"Infant Room","parentName":"Mrs. Tharp"}}
24ec62b5-407e-422e-bbfd-bb6febdc5266	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:52:26.237748	{"body":{}}
a4e3da15-80bf-4041-81a6-622932a33cbd	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:52:26.442121	{"body":{}}
4a38d80b-128f-4969-b840-bc7324bf8963	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/alerts/unread	2025-07-28 17:53:24.554136	{"body":{}}
e1976fc4-b8d8-40fe-8e59-b6bc5d70ba2d	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:53:24.55618	{"body":{}}
6f02f52f-7261-4753-82bb-c1716ee86345	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/alerts/unread	2025-07-28 17:55:28.525668	{"body":{}}
44f292a8-c236-4441-9f14-fcd1223ea68a	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/dashboard/stats	2025-07-28 17:55:28.527994	{"body":{}}
4851dc95-c8e6-4822-924e-0ff9a900bcb7	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/ratios	2025-07-28 17:55:28.528679	{"body":{}}
35411d91-bd16-4d7f-9b41-3f9a9b71dd07	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/attendance/present	2025-07-28 17:55:28.529264	{"body":{}}
a1a7f1c0-66b0-4c5f-a041-22911e3a94c4	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:55:28.529993	{"body":{}}
e74b763c-44ac-4a19-8960-de381130cada	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/staff-schedules/today	2025-07-28 17:55:28.543448	{"body":{}}
ffc55863-b073-4cc1-8af9-0fbc1dea511d	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/settings	2025-07-28 17:55:28.781562	{"body":{}}
37096e79-6f6b-49ea-9b8e-367ff59a7e18	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:55:30.019182	{"body":{}}
d22fd864-9e40-4fb4-b083-9f9ee81d4a75	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	post	/children	2025-07-28 17:56:39.831046	{"body":{"firstName":"Dale","lastName":"Stone","dateOfBirth":"2021-09-10T00:00:00.000Z","ageGroup":"preschool","room":"Preschool A","parentName":"Mrs Stone"}}
f63e0579-efd4-4846-8be4-adb708b2b841	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:56:40.099804	{"body":{}}
a40139e0-160e-4a15-a249-2a25238c5727	67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	get	/children	2025-07-28 17:56:40.457283	{"body":{}}
bc5ba127-a76b-47d0-b0d8-c6384eb22d2b	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	login	/api/auth/login	2025-07-28 18:03:35.146565	\N
53e903a0-d80a-45a7-95ca-61e5cf2aa5f3	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/alerts/unread	2025-07-28 18:03:38.12997	{"body":{}}
4785933b-85ce-4cdd-bee3-9284a2da6b3f	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/dashboard/stats	2025-07-28 18:03:38.135231	{"body":{}}
f29ae2a7-522b-4cfe-afdb-247f9de7c3a2	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/staff-schedules/today	2025-07-28 18:03:38.139082	{"body":{}}
c9311be7-c2de-468a-8287-5b46d6cc86a0	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/attendance/present	2025-07-28 18:03:38.142029	{"body":{}}
4d7533c4-4a70-471c-9538-7fa2bb4b200e	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/ratios	2025-07-28 18:03:38.142593	{"body":{}}
0a5ebb84-2134-4388-ba8a-ce751fbbc298	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/children	2025-07-28 18:03:38.1435	{"body":{}}
a8407dd0-1367-4b9b-93c2-8e87ab2ab6a6	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/settings	2025-07-28 18:03:38.377271	{"body":{}}
e8bc6b9a-2094-4930-aaa2-a83f4e118a38	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/children	2025-07-28 18:05:40.310227	{"body":{}}
47a06a38-62ef-4a30-8c8b-a28fe4f90e11	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/children	2025-07-28 18:06:05.300983	{"body":{}}
45bdbf08-64ef-49cc-bb99-2eff464da094	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/children	2025-07-28 18:06:08.350242	{"body":{}}
07b1ac46-e1cc-4568-9ca7-a0ecf6d7e25f	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/alerts/unread	2025-07-28 18:06:25.375357	{"body":{}}
f3c0454d-52cb-4c80-9e1c-d9b4fc8544c3	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/ratios	2025-07-28 18:06:25.411195	{"body":{}}
9600d186-44d1-4581-ab31-882986bded06	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/dashboard/stats	2025-07-28 18:06:25.538434	{"body":{}}
a597ac1a-42f7-4895-8bae-900c5a1a666d	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/attendance/present	2025-07-28 18:06:25.539577	{"body":{}}
e3d68ea6-afae-4c92-b9c9-eceff89b7161	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/children	2025-07-28 18:06:25.539916	{"body":{}}
7c03fc74-a976-40d2-a005-a672fc364315	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/staff-schedules/today	2025-07-28 18:06:25.643129	{"body":{}}
ab7c0a83-3177-4fa6-bf2e-fa3897b67b27	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/settings	2025-07-28 18:06:25.748672	{"body":{}}
ebc3c990-2afd-438c-99dc-5e6488190969	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/alerts/unread	2025-07-28 18:07:17.957062	{"body":{}}
14cd7948-fc67-4244-b26a-21a11cd2c1d9	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/children	2025-07-28 18:07:17.958207	{"body":{}}
a5c1c7a6-8f44-4f6e-a52d-1ef7e4e88501	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/settings/age_out_limit	2025-07-28 18:08:24.279915	{"body":{}}
592f6c98-e009-4b6f-949f-e7d3424e12cc	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/children	2025-07-28 18:08:24.282652	{"body":{}}
4141ed94-bfac-4148-bda2-40dcc945cf0e	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/children	2025-07-28 18:08:39.32781	{"body":{}}
ab1ce07c-1a7c-4cce-ac89-2bdd79c46dab	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/alerts/unread	2025-07-28 18:09:26.096444	{"body":{}}
72e41a3b-f407-47d6-9a7d-cf9ebb64efe5	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/dashboard/stats	2025-07-28 18:09:26.12176	{"body":{}}
890dba64-49fc-4878-8235-79f5d1f74194	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/attendance/present	2025-07-28 18:09:26.265509	{"body":{}}
47bea7ea-4514-4f6c-88d2-301a241351ea	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/children	2025-07-28 18:09:26.269534	{"body":{}}
b95972df-e053-4b88-94f6-d7d981bd0c1a	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/ratios	2025-07-28 18:09:26.270459	{"body":{}}
12edba9c-9edb-4d38-9f26-1355c702893a	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/settings	2025-07-28 18:09:26.322985	{"body":{}}
89ef16d7-98cf-4d7c-807e-8ae37dab4ac4	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/api/children	2025-07-28 18:09:26.347889	{"body":{}}
45607ede-7ead-4159-a255-575212d91331	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/staff-schedules/today	2025-07-28 18:09:26.381639	{"body":{}}
734dcd50-8267-4cd1-b0d3-d52e97bde795	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/alerts/unread	2025-07-28 18:10:16.826255	{"body":{}}
ca9b59bf-ef7e-403a-b8b9-a75b1389ad01	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/settings/age_out_limit	2025-07-28 18:10:16.827415	{"body":{}}
f3f894da-ab29-4f37-8893-0581fae8aaf8	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/children	2025-07-28 18:10:16.834804	{"body":{}}
6ed0dfd6-b408-4662-adbc-29cfd4326575	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/api/children	2025-07-28 18:10:16.910387	{"body":{}}
e04ed8d2-d3b4-48e7-ae3f-e806af2973f4	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/children	2025-07-28 18:10:44.302898	{"body":{}}
77c0fb5b-6f02-4232-abe9-edce3a4c78fa	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/api/children	2025-07-28 18:10:44.380731	{"body":{}}
463a6a85-18ec-48cc-a69e-c9901767dbe7	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/children	2025-07-28 18:10:51.306822	{"body":{}}
1f3aa1c0-7f3e-47b1-af1f-5bb05d304bc1	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/api/children	2025-07-28 18:10:51.386429	{"body":{}}
862a7d53-5834-4d94-9c86-8465fa6bb1f3	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/children	2025-07-28 18:10:54.326472	{"body":{}}
88ad2357-33a1-4aab-b6c0-06731435b64c	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/api/children	2025-07-28 18:10:54.403151	{"body":{}}
c947ec41-8ce4-480a-ba37-ea4bbee5aaf0	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/alerts/unread	2025-07-28 18:11:52.189672	{"body":{}}
0a5ce91a-9a2a-44f6-aabf-21ef646872ab	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/dashboard/stats	2025-07-28 18:11:52.237228	{"body":{}}
b3b503e0-5647-43b7-bda0-4bc1ee6d6399	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/children	2025-07-28 18:11:52.349845	{"body":{}}
00363ca3-f51e-4f47-82e5-e55ecdcf845b	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/ratios	2025-07-28 18:11:52.353604	{"body":{}}
3027fc72-5876-45e0-a39b-df741ea85a3f	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/attendance/present	2025-07-28 18:11:52.354629	{"body":{}}
4dd711e9-7ade-43c7-a444-187078e29e58	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/api/children	2025-07-28 18:11:52.42716	{"body":{}}
d5758a66-be47-4da4-8946-ce3a1aeff1aa	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/settings	2025-07-28 18:11:52.429862	{"body":{}}
8f4d11f8-dd79-4cb8-949d-a664915beea6	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/staff-schedules/today	2025-07-28 18:11:52.483366	{"body":{}}
9f3fed76-147b-4337-8925-30f51a8a1f65	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/alerts/unread	2025-07-28 18:12:43.799301	{"body":{}}
36ff9fc0-af46-4906-9699-77672637301e	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/settings/age_out_limit	2025-07-28 18:12:43.8001	{"body":{}}
0da28f99-cea1-4d51-a031-cc881009692d	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/children	2025-07-28 18:12:43.800888	{"body":{}}
96bd24d6-a95a-41e5-86de-c70710950d63	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/api/children	2025-07-28 18:12:43.878033	{"body":{}}
0abefcfa-c2d4-4a51-a89d-3d7bee71bc2c	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/children	2025-07-28 18:13:09.637824	{"body":{}}
72a04ce1-9f17-4cdf-b0e5-4b9f57316378	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/settings/age_out_limit	2025-07-28 18:13:09.639116	{"body":{}}
0a3661da-3f49-452f-84ac-c066d3cd8dfe	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/api/children	2025-07-28 18:13:09.71619	{"body":{}}
f6f26543-0ef0-4939-9c73-1e2d72c3c70c	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/children/84fb8168-5dfe-428f-9e2f-82a2561e4557	2025-07-28 18:13:10.720037	{"body":{}}
e91e58e7-dd68-4f3a-8dd1-4d1fa1f1deb5	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/api/children/84fb8168-5dfe-428f-9e2f-82a2561e4557	2025-07-28 18:13:10.798503	{"body":{}}
4fa62304-acf9-48a6-8859-3ed86f261163	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	put	/children/84fb8168-5dfe-428f-9e2f-82a2561e4557	2025-07-28 18:13:26.793701	{"body":{"enrollmentStatus":"unenrolled","unenrollmentDate":"2025-07-28T18:13:26.608Z","unenrollmentReason":"Aged Out","isActive":false}}
dc54fc19-e73e-423b-8329-09be15c47d9a	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	put	/api/children/84fb8168-5dfe-428f-9e2f-82a2561e4557	2025-07-28 18:13:26.871722	{"body":{"enrollmentStatus":"unenrolled","unenrollmentDate":"2025-07-28T18:13:26.608Z","unenrollmentReason":"Aged Out","isActive":false}}
92178187-944d-4e55-8211-3899e6eb73ca	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/alerts/unread	2025-07-28 18:18:32.651531	{"body":{}}
214ebac8-8e32-4c64-9535-cb1b29708529	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/dashboard/stats	2025-07-28 18:18:32.680024	{"body":{}}
5fceb68c-9858-4fd7-aabb-adead607a215	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/attendance/present	2025-07-28 18:18:32.685461	{"body":{}}
332710a1-ec11-496f-9904-f65ce6d44ee2	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/ratios	2025-07-28 18:18:32.686664	{"body":{}}
cfc81a42-a5df-4e8d-a4d3-d868b3baf8aa	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/staff-schedules/today	2025-07-28 18:18:32.687085	{"body":{}}
b2898e6c-f8ce-4e54-86f1-6e9c600ffe2e	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/children	2025-07-28 18:18:32.688557	{"body":{}}
dfcc851f-852b-4e8a-b804-b77f197d78f1	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/api/children	2025-07-28 18:18:32.771779	{"body":{}}
bf3246a8-35bf-4120-98ff-507e43a548b3	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/settings	2025-07-28 18:18:32.914061	{"body":{}}
f80d569a-f55c-450b-a395-b5249aeda1c7	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/alerts/unread	2025-07-28 18:26:08.511149	{"body":{}}
45a26302-3b8f-4934-898e-3b1a155c6636	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/dashboard/stats	2025-07-28 18:26:08.537833	{"body":{}}
5e510efe-db58-4930-99c6-1b593b7916b5	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/ratios	2025-07-28 18:26:08.551052	{"body":{}}
5545a9d6-c0da-43e9-b263-572de4659ee8	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/attendance/present	2025-07-28 18:26:08.68441	{"body":{}}
624fcfd7-9b5d-4fe3-ba4f-5820fbef73cf	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/children	2025-07-28 18:26:08.685623	{"body":{}}
ff9393f3-9d4a-46f5-9c93-1ed925244337	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/api/children	2025-07-28 18:26:08.764008	{"body":{}}
a52baeb1-9bb8-4015-ab0a-1a07c27ee38a	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/staff-schedules/today	2025-07-28 18:26:08.784984	{"body":{}}
489d5b2f-c31f-46b5-8c20-c065f10e6963	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/settings	2025-07-28 18:26:08.788088	{"body":{}}
652f0464-2b30-4a2e-95f8-06f10994bfd8	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/alerts/unread	2025-07-28 18:43:15.488522	{"body":{}}
01113d4e-99f7-4112-88ae-baf755659c3d	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/dashboard/stats	2025-07-28 18:43:15.501844	{"body":{}}
d19cc0dc-7d7e-4ba5-9908-65bef588f294	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/ratios	2025-07-28 18:43:15.499697	{"body":{}}
c08d0918-872a-4335-9fad-a20235c02bee	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/children	2025-07-28 18:43:15.508309	{"body":{}}
5efd3a06-c898-417a-8a96-ef07f2059ff4	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/attendance/present	2025-07-28 18:43:15.509493	{"body":{}}
33dcd30f-d8f0-478a-91a0-e17fb92f1979	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/staff-schedules/today	2025-07-28 18:43:15.509137	{"body":{}}
6f4eba4f-1568-4180-839f-bfd44258dde8	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/api/children	2025-07-28 18:43:15.596984	{"body":{}}
ac73096d-caf2-4bbe-b0ed-6ecea76e5ba5	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/settings	2025-07-28 18:43:15.768009	{"body":{}}
0b9ca43f-4773-44bb-ad55-65520e152aa2	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/alerts/unread	2025-07-28 18:48:28.753461	{"body":{}}
d8c288ca-5b61-4834-b755-4a70146ceebd	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/staff-schedules/today	2025-07-28 18:48:28.781919	{"body":{}}
aa759039-aa8f-4aec-b2ed-b930c9ce9782	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/attendance/present	2025-07-28 18:48:28.782906	{"body":{}}
91feea17-dae8-4de6-904a-a22748d8f3bc	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/dashboard/stats	2025-07-28 18:48:28.783244	{"body":{}}
7708873b-4c85-4426-91fe-5cf205fe2a54	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/children	2025-07-28 18:48:28.78399	{"body":{}}
9c94a419-9dcf-460d-936d-6f6585881864	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/ratios	2025-07-28 18:48:28.784257	{"body":{}}
986e4e7c-bbc6-442a-854f-398f97ca65d8	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/api/children	2025-07-28 18:48:28.890648	{"body":{}}
18aa4f6b-a57b-4e87-a220-cc45ec88eae8	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/settings	2025-07-28 18:48:29.040604	{"body":{}}
1a16dfeb-281d-43dd-9b05-7f43cd9caa70	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/settings/age_out_limit	2025-07-28 18:53:09.989785	{"body":{}}
a9b82de5-f7a0-426a-9d58-cbaefa783cbb	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/children	2025-07-28 18:53:09.991792	{"body":{}}
432c691f-7b50-477f-9096-24773071b033	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/api/children	2025-07-28 18:53:10.086082	{"body":{}}
07f8095e-5116-490b-bb79-a0bb181412f2	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/children/84fb8168-5dfe-428f-9e2f-82a2561e4557	2025-07-28 18:53:11.498892	{"body":{}}
2394a454-a419-44a4-93d1-39e1f2e13850	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/api/children/84fb8168-5dfe-428f-9e2f-82a2561e4557	2025-07-28 18:53:11.575888	{"body":{}}
c18e21bd-0b74-43be-a149-751fb74da5fe	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	put	/children/84fb8168-5dfe-428f-9e2f-82a2561e4557	2025-07-28 18:53:20.676517	{"body":{"enrollmentStatus":"unenrolled","unenrollmentDate":"2025-07-28T18:53:20.562Z","unenrollmentReason":"aged out","isActive":false}}
27ef5f1e-8068-4c49-a469-e6f9d93258b1	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	put	/api/children/84fb8168-5dfe-428f-9e2f-82a2561e4557	2025-07-28 18:53:20.754389	{"body":{"enrollmentStatus":"unenrolled","unenrollmentDate":"2025-07-28T18:53:20.562Z","unenrollmentReason":"aged out","isActive":false}}
c39c4b00-52e1-4841-b189-f56e2ac8e33b	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/alerts/unread	2025-07-28 18:53:52.27399	{"body":{}}
ef10b48c-12aa-47e0-be93-15fbdd484480	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/dashboard/stats	2025-07-28 18:53:52.283337	{"body":{}}
5a3427e5-abf1-4fde-8a79-038d4b91083a	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/children	2025-07-28 18:53:52.289966	{"body":{}}
38133d58-d4df-4c0b-a89f-de1cb26a5181	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/ratios	2025-07-28 18:53:52.290603	{"body":{}}
d002fe35-ea44-4859-8993-8669bba3eaf9	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/attendance/present	2025-07-28 18:53:52.294492	{"body":{}}
2ac45ced-44a9-484d-a6b1-0dd2ab6edf8a	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/staff-schedules/today	2025-07-28 18:53:52.296659	{"body":{}}
bcf3c222-a930-43e0-a287-d660511fd8f1	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/api/children	2025-07-28 18:53:52.36983	{"body":{}}
3080a5a5-f51c-4059-b11f-c2422bf46ef8	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/settings	2025-07-28 18:53:52.516574	{"body":{}}
e4e67772-d031-44d7-a8be-dac3477268a2	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/alerts/unread	2025-07-28 19:01:05.057386	{"body":{}}
70022d78-a27f-40d8-9a03-797c6963cb7a	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/dashboard/stats	2025-07-28 19:01:05.0714	{"body":{}}
c1679062-0583-472f-a2d5-bd399c8fabe8	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/ratios	2025-07-28 19:01:05.076539	{"body":{}}
00f8ca6f-6f41-4ef3-b987-3713bb7396e6	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/children	2025-07-28 19:01:05.076132	{"body":{}}
b201e431-5787-4de3-991b-6a4f21121800	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/attendance/present	2025-07-28 19:01:05.081076	{"body":{}}
66e0e6e3-9cc3-4adf-bdad-278dd237b8d6	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/staff-schedules/today	2025-07-28 19:01:05.08254	{"body":{}}
a6caad32-11e2-407c-aeab-02b4082655ad	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/api/children	2025-07-28 19:01:05.173252	{"body":{}}
924fb2f7-5189-4b88-b7d9-f753d8d7f087	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/settings	2025-07-28 19:01:05.338475	{"body":{}}
8276f433-3c0f-4912-a94a-edf76958e430	b0e828934f2a1c0f3365ad844a76c6955f7e853e20505f33f3ab9e1ad3feb4e6	login	/api/auth/login	2025-07-28 19:01:08.085684	\N
f53b6e0a-fe32-4a35-b184-3d2f40872dae	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/alerts/unread	2025-07-28 19:08:19.041809	{"body":{}}
abcac061-d59c-484f-b0f5-83e27048763a	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/dashboard/stats	2025-07-28 19:08:19.058382	{"body":{}}
a2bca92e-f822-46a5-bbbf-1c4fff2bb56e	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/attendance/present	2025-07-28 19:08:19.310399	{"body":{}}
614083ba-4689-4506-9a23-a5badeeb15ba	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/staff-schedules/today	2025-07-28 19:08:19.31488	{"body":{}}
7aa85e20-a046-44a9-a7de-62b3f205c184	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/settings	2025-07-28 19:08:19.317586	{"body":{}}
144b919f-a4ea-4052-a2ca-8faa52ad9e17	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/ratios	2025-07-28 19:08:21.187041	{"body":{}}
e003d06c-7b46-4c80-b3d7-1a350013575c	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/children	2025-07-28 19:08:21.318463	{"body":{}}
49d964b4-55eb-431a-9eb5-9bc6f6a1264f	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/api/children	2025-07-28 19:08:21.394846	{"body":{}}
6dec5d2f-2cb8-4ec4-a04a-91db43c32ded	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/alerts/unread	2025-07-28 19:10:01.17097	{"body":{}}
72a4b52d-e6f1-4695-a6af-fba5590606b6	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/dashboard/stats	2025-07-28 19:10:01.195022	{"body":{}}
6882df98-22de-4005-ac1f-5fe700ea098e	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/ratios	2025-07-28 19:10:01.328086	{"body":{}}
223565ac-73f2-49cf-80aa-1f3c836aa325	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/attendance/present	2025-07-28 19:10:01.339179	{"body":{}}
8cd82c7d-deef-4e89-a81a-cd6eb139aef6	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/children	2025-07-28 19:10:01.349074	{"body":{}}
c7b8ce37-37b2-4dd0-8a35-5249074c7a90	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/settings	2025-07-28 19:10:01.411589	{"body":{}}
660e895b-7beb-416e-8ade-2cc255332af2	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/api/children	2025-07-28 19:10:01.42612	{"body":{}}
6dbb98b6-33fd-4ece-8d58-64a34b6a36a5	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/staff-schedules/today	2025-07-28 19:10:01.463389	{"body":{}}
500e3457-07c9-4d22-91c2-4154e3d1ecb1	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/alerts/unread	2025-07-28 19:13:03.043867	{"body":{}}
a2706faa-1c8b-4bef-a44c-d6ef174b3b1d	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/dashboard/stats	2025-07-28 19:13:03.04964	{"body":{}}
283d74b3-0224-4319-9177-edf462fce5fd	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/unread	2025-07-28 19:13:03.14485	{"body":{}}
ddfd526c-4321-4b19-b8e8-a402a5eb7cc9	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/children	2025-07-28 19:13:03.173411	{"body":{}}
b03451ed-a3f6-44d0-8490-601e1227383b	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/ratios	2025-07-28 19:13:03.179125	{"body":{}}
48df82e0-365e-4b45-aa1b-773093b78b0d	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/attendance/present	2025-07-28 19:13:03.187503	{"body":{}}
33249f65-a2f2-49bc-ba6d-67fa1534256d	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/	2025-07-28 19:13:03.248419	{"body":{}}
f7d23b7b-54a0-439f-b1f1-1aad575f00a8	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/present	2025-07-28 19:13:03.266578	{"body":{}}
d6a27160-06a1-400a-b4ef-f4fe0da6dada	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/staff-schedules/today	2025-07-28 19:13:03.314312	{"body":{}}
20846b4e-ffc7-4355-81b0-38b0e45d5912	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/settings	2025-07-28 19:13:03.383296	{"body":{}}
c97de1ec-2472-4160-bc31-3d2983851bbb	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/	2025-07-28 19:13:03.458223	{"body":{}}
f35e8ab3-20c3-4718-8f8b-bc49c7555834	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/alerts/unread	2025-07-28 19:15:37.538259	{"body":{}}
35f98f24-c45d-4788-87bb-5d902bfd623d	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/ratios	2025-07-28 19:15:37.559222	{"body":{}}
ba6a34f0-0631-4305-b9a1-0d80c05377a6	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/unread	2025-07-28 19:15:37.646233	{"body":{}}
48fd8dbe-b78f-42d8-937a-f02795d037d1	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/attendance/present	2025-07-28 19:15:37.681678	{"body":{}}
57ded90f-94f2-49bd-9a0b-dc82729c9d7e	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/present	2025-07-28 19:15:37.757442	{"body":{}}
87267fb6-3c75-48d6-aabf-2fd659290c28	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/settings	2025-07-28 19:15:37.907438	{"body":{}}
5bcdee7e-2507-441e-acbb-194d466c6f56	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/	2025-07-28 19:15:37.99051	{"body":{}}
516a700a-d517-40df-b1b0-71b82c545b8b	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/dashboard/stats	2025-07-28 19:15:39.683642	{"body":{}}
ea718e60-3833-4b6c-87ec-e9d67f6fa890	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/children	2025-07-28 19:15:39.689057	{"body":{}}
b9d9db0d-52b7-457e-84a1-d544cb34e427	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/stats	2025-07-28 19:15:39.759234	{"body":{}}
7e6e304a-c0e7-4730-816f-06b83032245e	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/	2025-07-28 19:15:39.765586	{"body":{}}
c58ee328-2502-4b5b-939e-83c45ebb3db1	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/staff-schedules/today	2025-07-28 19:15:39.795785	{"body":{}}
e3b497d5-bb12-4a96-8d6e-011564e9817d	6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	get	/today	2025-07-28 19:15:39.87695	{"body":{}}
a008af1a-1b1b-4a45-93e9-0785204eaa80	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	login	/api/auth/login	2025-07-28 20:13:48.236378	\N
eadbcdb6-c8bf-4d7e-a109-cbe7217eb744	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/alerts/unread	2025-07-28 20:13:52.420959	{"body":{}}
23621c23-c3a0-409d-84db-496b3a061fa8	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/dashboard/stats	2025-07-28 20:13:52.427114	{"body":{}}
0343255e-2cf9-4e98-9a37-96c60e349c91	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/ratios	2025-07-28 20:13:52.430581	{"body":{}}
40cfae78-75f0-4233-88a6-ee42b3a5b452	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/children	2025-07-28 20:13:52.432602	{"body":{}}
f8f80e7e-3adb-435c-9ab3-54ec3e940781	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/attendance/present	2025-07-28 20:13:52.438846	{"body":{}}
4abb56bb-2281-4af7-aa33-4d7918281f72	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/unread	2025-07-28 20:13:52.509692	{"body":{}}
6181601c-bce0-459e-913b-61cee9ca6123	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/stats	2025-07-28 20:13:52.518152	{"body":{}}
30473039-7d93-4d8f-8b55-ea9b82c560f4	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/	2025-07-28 20:13:52.52552	{"body":{}}
473c7c99-a041-4529-8286-124a6b22592b	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/present	2025-07-28 20:13:52.527446	{"body":{}}
94005e57-e5f8-47e0-92bb-dcdedb9cb937	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/staff-schedules/today	2025-07-28 20:13:52.555041	{"body":{}}
3544d3b5-04f2-41fb-85c6-26fdfeb62378	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/today	2025-07-28 20:13:52.644912	{"body":{}}
e1427e1c-482e-4417-ae9d-972ff7b03f82	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/settings	2025-07-28 20:13:52.762844	{"body":{}}
faa3609a-3320-4b22-88a1-fce014b6b3cf	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/	2025-07-28 20:13:52.844033	{"body":{}}
69c43632-0bc0-405f-9c99-8479832babd3	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/children	2025-07-28 20:14:03.706861	{"body":{}}
ab4139ba-0f1b-4a62-b595-4e033a55460f	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/settings/age_out_limit	2025-07-28 20:14:03.711933	{"body":{}}
2c505ae3-abb1-458e-b59a-cc26a0bd8922	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/	2025-07-28 20:14:03.781501	{"body":{}}
8b1fad82-c153-44e1-8495-e8c5c0b2a6f9	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/children/84fb8168-5dfe-428f-9e2f-82a2561e4557	2025-07-28 20:14:05.277206	{"body":{}}
6f28cde5-718a-4db7-ac6c-aaddf9216513	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/settings/age_out_limit	2025-07-28 20:14:05.2796	{"body":{}}
cc700520-7f0e-4e40-ac15-8163111f02f8	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/84fb8168-5dfe-428f-9e2f-82a2561e4557	2025-07-28 20:14:05.358275	{"body":{}}
d59d6e60-6b5c-4af6-9b16-29bdd2d6bd9f	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/settings/age_out_limit	2025-07-28 20:14:10.066769	{"body":{}}
677f61d9-5a30-46ad-bcfe-35136f5b98ea	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/alerts/unread	2025-07-28 20:14:10.069004	{"body":{}}
352f3cd6-fa24-4b57-ab9f-f4eda3a201ba	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/children	2025-07-28 20:14:10.076204	{"body":{}}
a793398f-f650-47fe-9308-327df08f5c71	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/unread	2025-07-28 20:14:10.14417	{"body":{}}
c31822eb-cfd8-4c30-b22d-e49971a2d701	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/	2025-07-28 20:14:10.15513	{"body":{}}
fe59f6f8-ad16-457c-8b13-310a48e25baa	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/staff-schedules/today	2025-07-28 20:14:11.309615	{"body":{}}
d786f5c6-33fa-4d64-bdec-f3b30f7f2d1e	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/today	2025-07-28 20:14:11.38427	{"body":{}}
9b0547ba-d729-4ff6-a7b0-3a8dd0b0689f	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/settings/age_out_limit	2025-07-28 20:14:25.717531	{"body":{}}
30cca75c-788e-4730-9ee5-9b5dc0de57dc	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/alerts/unread	2025-07-28 20:14:25.723083	{"body":{}}
0418c5f5-af2b-4100-8a34-70eee7442a46	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/children	2025-07-28 20:14:25.732358	{"body":{}}
fd3ab12a-023c-4557-9273-7597de97dc2c	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/unread	2025-07-28 20:14:25.808628	{"body":{}}
e987c748-7efb-4044-8b65-34e8fcb898e9	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/	2025-07-28 20:14:25.809772	{"body":{}}
42126190-6941-4419-a5ff-2dc93053059e	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/settings/age_out_limit	2025-07-28 20:14:34.503449	{"body":{}}
a0749436-fe89-44be-8dfe-c57bd056217d	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/children/17e754bc-4d51-4767-b44b-d99dc1d01e92	2025-07-28 20:14:34.498449	{"body":{}}
9b668730-3298-45ad-8e38-c7e33859013f	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/17e754bc-4d51-4767-b44b-d99dc1d01e92	2025-07-28 20:14:34.573732	{"body":{}}
0db15b0b-15c8-41ae-9e4b-fe3f33725249	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/alerts/unread	2025-07-28 20:15:04.354075	{"body":{}}
a96ede87-5f0b-4ded-bf94-c5a29581275a	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/ratios	2025-07-28 20:15:04.355163	{"body":{}}
16818ba8-f397-48ce-8832-c828c48b5a74	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/dashboard/stats	2025-07-28 20:15:04.361805	{"body":{}}
6b64dbf2-3a1e-4e92-a2d9-5aa3bb12cb92	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/children	2025-07-28 20:15:04.362543	{"body":{}}
582f0e61-8c45-4bef-ac63-34200471a282	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/attendance/present	2025-07-28 20:15:04.365384	{"body":{}}
2f4b3ee6-ca27-43f0-a7c8-73f16e0753e7	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/unread	2025-07-28 20:15:04.43373	{"body":{}}
aff5f05b-37e4-42e0-bcef-16bf85a576ed	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/stats	2025-07-28 20:15:04.436165	{"body":{}}
c9c7fcec-4dd5-47d8-8bae-20590a617c4d	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/	2025-07-28 20:15:04.437778	{"body":{}}
4c4d6a72-a222-40ed-bf7f-3b08cabfc223	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/staff-schedules/today	2025-07-28 20:15:04.440205	{"body":{}}
aee9d486-10d8-4695-98ae-abe7269d48ee	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/present	2025-07-28 20:15:04.440831	{"body":{}}
7d3cd511-c1c8-4113-a3ce-3b1c952c6359	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/today	2025-07-28 20:15:04.515493	{"body":{}}
748a0bc7-c500-4321-a114-b00b0605f913	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/settings	2025-07-28 20:15:04.696035	{"body":{}}
96a2221f-eded-4c9e-a183-260a5e5fcbe0	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/	2025-07-28 20:15:04.77383	{"body":{}}
d244ba93-ccd9-4ce1-bc53-67aaa25691ae	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/dashboard/stats	2025-07-29 02:19:44.873874	{"body":{}}
f286da51-bd6c-46dd-8937-19bf73bc24d2	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/ratios	2025-07-29 02:19:44.911802	{"body":{}}
8dac2206-deb2-4c61-8a96-c03e27f11dd9	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/attendance/present	2025-07-29 02:19:44.913051	{"body":{}}
166a3aad-4878-46f2-b854-6cd6ffa85324	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/alerts/unread	2025-07-29 02:19:44.914417	{"body":{}}
b9062984-606f-45aa-9df2-07b25117662f	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/staff-schedules/today	2025-07-29 02:19:44.921334	{"body":{}}
22939434-72a1-4faa-9f96-12bafd2e59e5	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/settings	2025-07-29 02:19:44.980536	{"body":{}}
4b893213-9142-46bb-ab25-9e1907765db6	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/stats	2025-07-29 02:19:44.981893	{"body":{}}
d3160a30-655c-4c80-a095-43615c22e6d8	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/present	2025-07-29 02:19:45.000444	{"body":{}}
91eaa626-ad85-4634-aaa5-c24a657b08f2	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/today	2025-07-29 02:19:45.00106	{"body":{}}
70db5945-16a3-4f0b-8571-e69bf082248f	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/unread	2025-07-29 02:19:45.00165	{"body":{}}
ae1ce675-3a12-4fef-9740-3ead2403aedf	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/	2025-07-29 02:19:45.064968	{"body":{}}
db649b68-408f-4f1f-a127-6ff8d6a93f36	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/children	2025-07-29 02:19:45.247551	{"body":{}}
3297ce12-541c-4e7b-88d9-f8627d7aff89	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/	2025-07-29 02:19:45.32436	{"body":{}}
4d4e91e7-d0af-4cd5-90ec-f08c2be1aea4	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/settings/age_out_limit	2025-07-29 02:20:09.529816	{"body":{}}
42c3b126-7542-4331-8301-098964860294	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/children	2025-07-29 02:20:09.5297	{"body":{}}
300ee40b-5c8b-471d-8656-050d815f273e	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/	2025-07-29 02:20:09.611916	{"body":{}}
dfc74734-30b8-4904-9885-e3fab5b4aaea	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/settings/age_out_limit	2025-07-29 02:20:13.034255	{"body":{}}
e90a7caf-414e-4303-9f33-ec91fa7c9d28	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/children/17e754bc-4d51-4767-b44b-d99dc1d01e92	2025-07-29 02:20:13.035813	{"body":{}}
5af1c05c-4a31-4a8e-ba57-44a0ab1e23ef	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	get	/17e754bc-4d51-4767-b44b-d99dc1d01e92	2025-07-29 02:20:13.113248	{"body":{}}
714be4cc-5438-4542-bd10-6d5c9c2f6afd	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	put	/children/17e754bc-4d51-4767-b44b-d99dc1d01e92	2025-07-29 02:20:39.636132	{"body":{"enrollmentStatus":"unenrolled","unenrollmentDate":"2025-07-29T02:20:39.297Z","unenrollmentReason":"Aged out","isActive":false}}
d78fb3f9-f481-4134-9c26-f142af729001	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	put	/17e754bc-4d51-4767-b44b-d99dc1d01e92	2025-07-29 02:20:39.714705	{"body":{"enrollmentStatus":"unenrolled","unenrollmentDate":"2025-07-29T02:20:39.297Z","unenrollmentReason":"Aged out","isActive":false}}
62a458a4-482f-4817-aec9-eb4b1c9e9fb2	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	put	/children/17e754bc-4d51-4767-b44b-d99dc1d01e92	2025-07-29 02:21:16.750144	{"body":{"id":"17e754bc-4d51-4767-b44b-d99dc1d01e92","firstName":"Britt","lastName":"Legg","dateOfBirth":"2022-01-10T00:00:00.000Z","ageGroup":"preschool","room":"Preschool A","parentName":"Della Legg","parentEmail":"doclegg05@yahoo.com","parentPhone":"3048267400","emergencyContactName":"Della Legg","emergencyContactPhone":"3048267400","allergies":[],"medicalNotes":null,"immunizations":[],"medicalConditions":[],"currentMedications":null,"dietaryRestrictions":[],"foodAllergies":[],"specialCareInstructions":null,"physicalLimitations":null,"bloodType":null,"primaryPhysician":null,"physicianPhone":null,"pediatricianName":null,"pediatricianPhone":null,"preferredHospital":null,"insuranceProvider":null,"insurancePolicyNumber":null,"insuranceGroupNumber":null,"emergencyMedicalAuthorization":false,"medicalActionPlan":null,"epiPenRequired":false,"inhalerRequired":false,"immunizationRecords":null,"immunizationExemptions":[],"nextImmunizationDue":null,"lastHealthCheck":null,"healthCheckNotes":null,"profilePhotoUrl":null,"enrollmentDate":"2025-07-28T17:02:57.905Z","unenrollmentDate":null,"enrollmentStatus":"enrolled","unenrollmentReason":null,"tuitionRate":null,"isActive":true,"faceDescriptor":null,"fingerprintHash":null,"biometricEnrolledAt":null,"biometricEnabled":false,"createdAt":"2025-07-28T17:02:57.905Z"}}
dc8d41e8-342a-4554-bdf5-67251902a9c5	e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	put	/17e754bc-4d51-4767-b44b-d99dc1d01e92	2025-07-29 02:21:16.832389	{"body":{"id":"17e754bc-4d51-4767-b44b-d99dc1d01e92","firstName":"Britt","lastName":"Legg","dateOfBirth":"2022-01-10T00:00:00.000Z","ageGroup":"preschool","room":"Preschool A","parentName":"Della Legg","parentEmail":"doclegg05@yahoo.com","parentPhone":"3048267400","emergencyContactName":"Della Legg","emergencyContactPhone":"3048267400","allergies":[],"medicalNotes":null,"immunizations":[],"medicalConditions":[],"currentMedications":null,"dietaryRestrictions":[],"foodAllergies":[],"specialCareInstructions":null,"physicalLimitations":null,"bloodType":null,"primaryPhysician":null,"physicianPhone":null,"pediatricianName":null,"pediatricianPhone":null,"preferredHospital":null,"insuranceProvider":null,"insurancePolicyNumber":null,"insuranceGroupNumber":null,"emergencyMedicalAuthorization":false,"medicalActionPlan":null,"epiPenRequired":false,"inhalerRequired":false,"immunizationRecords":null,"immunizationExemptions":[],"nextImmunizationDue":null,"lastHealthCheck":null,"healthCheckNotes":null,"profilePhotoUrl":null,"enrollmentDate":"2025-07-28T17:02:57.905Z","unenrollmentDate":null,"enrollmentStatus":"enrolled","unenrollmentReason":null,"tuitionRate":null,"isActive":true,"faceDescriptor":null,"fingerprintHash":null,"biometricEnrolledAt":null,"biometricEnabled":false,"createdAt":"2025-07-28T17:02:57.905Z"}}
942d6517-67dc-4f9d-bd96-04e0dd55c517	e5b12ec3af0f876dc371647ce7bd8ea2c959d3ad05d283fc4eb672607e43b65f	login	/api/auth/login	2025-07-30 13:16:04.970517	\N
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.sessions (id, user_id, username, role, login_time, last_activity, end_time, ip_address, user_agent, is_active, end_reason) FROM stdin;
d2eb8e9af216f2e7d1ffa2142fe59f9dea027c1babd13e43a17712bbe1db7957	1	director	director	2025-07-25 19:56:46.839	2025-07-25 19:56:46.839	\N	127.0.0.1	curl/8.14.1	t	\N
04824067f9583afd71722ee250add08f41eac1592f273b7afe1f047f17b85ee1	1	director	director	2025-07-25 19:57:02.037	2025-07-25 19:57:02.037	\N	127.0.0.1	curl/8.14.1	t	\N
65440e8edb3d5e6a35518730753baa1328531f95201beafc2b9019b9108d9b14	1	director	director	2025-07-25 19:57:12.558	2025-07-25 19:57:12.773	\N	127.0.0.1	curl/8.14.1	t	\N
1f264121e90bc2498853d7c965788ab621bc440873dcb8a5220b9e9a08bcbdaf	1	director	director	2025-07-25 23:01:23.392	2025-07-25 23:01:23.937	\N	127.0.0.1	curl/8.14.1	t	\N
58c9baf7aa23bc14cd7f35e6a58bec8f7c63546081313b85f9c4268227a37205	1	director	director	2025-07-26 23:16:04.81	2025-07-26 23:16:05.287	\N	127.0.0.1	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	t	\N
be94ddc633b03b24ed7056242b46eefb032b608a4d543531b469ba2b9dbddabb	1	director	director	2025-07-26 23:23:32.913	2025-07-26 23:23:33.438	\N	127.0.0.1	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	t	\N
e8f0997d32f0d5626e4b8e44b6bfb60a8f8838bbb9608b879eabd67c9f91efb5	1	director	director	2025-07-28 13:01:52.553	2025-07-28 13:01:53.081	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0	t	\N
5cb495f2584933082e54d33491e840b029fa1d66b7d1351eea06da4dc64d17e0	1	director	director	2025-07-25 23:14:20.338	2025-07-25 23:27:49.585	\N	172.31.104.130	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.143.2 (iOS 18.5)	t	\N
83264ab879a39f4c42ab6887b7d6d723e81fb20c639ac7f33aa805014ca7ebb0	1	director	director	2025-07-26 22:57:59.355	2025-07-26 22:57:59.87	\N	127.0.0.1	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	t	\N
6a543d166e9fda5b76b35e7b828f1447a171f91417d2d3514d246b57b4b79a96	1	director	director	2025-07-26 22:58:24.355	2025-07-26 22:58:24.49	\N	127.0.0.1	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	t	\N
87cde6d23f703e1ead7dc3b96f6a29b928e9b46a5a7c6861d4b67a7ea58417d0	1	director	director	2025-07-26 23:02:47.278	2025-07-26 23:02:47.753	\N	127.0.0.1	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	t	\N
e09f50443252fb806bb3a5f608743dfc67ba8b0670382e054441e27979d709c2	1	director	director	2025-07-26 23:06:58.899	2025-07-26 23:06:59.364	\N	127.0.0.1	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	t	\N
c28c586cf979e179ab3ff19f4b5cc6db3511898a59184fabe9ba4daddff5255e	1	director	director	2025-07-26 23:07:26.454	2025-07-26 23:07:26.589	\N	127.0.0.1	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	t	\N
f871a304215279dbf58c1df51b4784c5436f362e213e947e1eb0aed8d9739400	1	director	director	2025-07-28 15:50:00.05	2025-07-28 15:50:02.533	\N	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	t	\N
f57a5db9180069d7028e9aa80aa30c6dd7d73288adf54ca0566cc240c5e6ffeb	1	director	director	2025-07-26 23:11:07.914	2025-07-26 23:11:10.415	\N	127.0.0.1	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1	t	\N
b0e828934f2a1c0f3365ad844a76c6955f7e853e20505f33f3ab9e1ad3feb4e6	1	director	director	2025-07-28 19:01:08.022	2025-07-28 19:01:08.105	\N	127.0.0.1	curl/8.14.1	t	\N
67f52144c1c92f7f69d968f622779f42f5df91e79a0dd15a73aa7944d6a4dbaa	1	director	director	2025-07-28 17:18:15.212	2025-07-28 17:56:40.476	\N	172.31.68.130	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	t	\N
31d7349908d4f1a72925bd7273b32c7ac414d2e56c598dceb951f18c4dd63e55	1	director	director	2025-07-28 16:24:23.671	2025-07-28 16:24:23.764	\N	127.0.0.1	curl/8.14.1	t	\N
e2584067f39a0e1460c47755349454009f19e40cea33405f2167ae4e1195b860	1	director	director	2025-07-28 20:13:47.994	2025-07-29 02:21:16.852	\N	172.31.99.162	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Replit-Bonsai/2.143.2 (iOS 18.5)	t	\N
676a35b3ac324bb7564dbcc6bf61d969e02a8617d3e151845751c427248a4383	1	director	director	2025-07-28 15:38:19.231	2025-07-28 17:18:03.779	\N	172.31.84.194	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	t	\N
e5b12ec3af0f876dc371647ce7bd8ea2c959d3ad05d283fc4eb672607e43b65f	1	director	director	2025-07-30 13:16:04.78	2025-07-30 13:16:05.001	\N	127.0.0.1	curl/8.14.1	t	\N
6d8b8407bf1fa8b6f19586cc2384ef7b4f9bb12524507885f1a747f1e8d5f733	1	director	director	2025-07-28 18:03:35.079	2025-07-28 19:15:39.896	\N	172.31.68.130	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	t	\N
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.settings (id, key, value, updated_at) FROM stdin;
5d84df4f-7320-4632-aa18-4aeb69970fd2	email_port	doclegg05@yahoo.com	2025-07-25 12:55:19.514093
7c1ad905-319e-4582-9b7d-9d1923957ae4	email_user	doclegg05@yahoo.com	2025-07-25 12:55:19.519055
a4a66a43-3976-4086-8888-e632084e628a	email_host	doclegg05@yahoo.com	2025-07-25 12:55:19.51941
311eed8c-715a-4887-9d9b-01a66d8f7557	email_from	doclegg05@yahoo.com	2025-07-25 12:55:19.519771
\.


--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.staff (id, first_name, last_name, email, phone, "position", is_active, created_at, face_descriptor, fingerprint_hash, biometric_enrolled_at, biometric_enabled, employee_number, hourly_rate, salary_amount, pay_type, tax_filing_status, w4_allowances, additional_tax_withholding, direct_deposit_account, direct_deposit_routing) FROM stdin;
b544e53c-8d58-4eff-a4b9-cee4d3ee085e	Jessica	Anderson	jessica.a@daycare.com	(555) 111-2222	Lead Teacher	t	2025-07-25 14:11:56.813785	\N	\N	\N	f	EMP001	1800	\N	hourly	single	1	0	\N	\N
d563265c-7a69-47f0-a9c1-21a48517ae63	Michael	Thompson	michael.t@daycare.com	(555) 333-4444	Assistant Teacher	t	2025-07-25 14:11:56.857259	\N	\N	\N	f	EMP002	1800	\N	hourly	single	1	0	\N	\N
dfddb6b3-0163-4a0a-a275-b373de22bec8	Sarah	Garcia	sarah.g@daycare.com	(555) 555-6666	Infant Specialist	t	2025-07-25 14:11:56.896062	\N	\N	\N	f	EMP003	1600	\N	hourly	single	1	0	\N	\N
3ad1cc0d-7e2f-4634-832e-8f861575ac49	Jessica	Anderson	jessica.anderson@tothub.com	(304) 555-1001	Lead Teacher	t	2025-07-28 16:23:13.776778	\N	\N	\N	f	\N	1850	\N	hourly	single	0	0	\N	\N
96af49d9-9549-498d-93fe-eeddc488855e	Michael	Thompson	michael.thompson@tothub.com	(304) 555-1002	Assistant Teacher	t	2025-07-28 16:23:13.820116	\N	\N	\N	f	\N	1500	\N	hourly	single	0	0	\N	\N
2938f9bb-ea03-4b5d-955d-20afae2887bc	Emily	Martinez	emily.martinez@tothub.com	(304) 555-1003	Infant Care Specialist	t	2025-07-28 16:23:13.858331	\N	\N	\N	f	\N	1700	\N	hourly	single	0	0	\N	\N
6ec16837-7e5e-4725-b711-0fdab89cb928	Robert	Chen	robert.chen@tothub.com	(304) 555-1004	Part-time Assistant	t	2025-07-28 16:23:13.897685	\N	\N	\N	f	\N	1350	\N	hourly	single	0	0	\N	\N
357be85d-208a-44cb-85c4-3d21242c6be2	Britt	Legg	doclegg05@yahoo.com	3048267400	Lead Teacher	t	2025-07-29 13:38:35.053949	\N	\N	\N	f	\N	\N	\N	hourly	single	0	0	\N	\N
4817b331-5808-4c8b-8a8f-2a4110ee870e	Bart 	Legg	bartlegg@gmail.com	555-666-7777	Assistant Teacher	t	2025-07-29 13:53:12.247824	\N	\N	\N	f	\N	\N	\N	hourly	single	0	0	\N	\N
e73ddf05-6c8d-427b-8bc6-7fb36070add2	Jennifer 	Holcomb	holcombjennifer@gmail.com	222-333-4444	Director	t	2025-07-29 14:03:24.520305	\N	\N	\N	f	\N	\N	\N	hourly	single	0	0	\N	\N
\.


--
-- Data for Name: staff_schedules; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.staff_schedules (id, staff_id, room, scheduled_start, scheduled_end, actual_start, actual_end, date, is_present, created_at, schedule_type, is_recurring, recurring_pattern, recurring_until, notes, approved_by, status) FROM stdin;
ab99af9a-e8c1-46ec-b8f6-15d6ab608344	3ad1cc0d-7e2f-4634-832e-8f861575ac49	Preschool B	2025-07-28 16:00:00	2025-07-28 22:00:00	\N	\N	2025-07-29 00:00:00	f	2025-07-29 14:54:57.652291	regular	f	\N	\N	\N	\N	scheduled
\.


--
-- Data for Name: state_compliance; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.state_compliance (id, state, ratios_data, federal_compliance, additional_rules, is_active, last_updated, audit_log, created_at) FROM stdin;
24007679-40d9-4a94-a9ec-609c36640aba	West Virginia	{"Infants (0-12 months)":"4:1","Toddlers (13-24 months)":"6:1","2-3 years":"10:1","3-4 years":"12:1","4-5 years":"14:1","School-age (6+)":"16:1","notes":"Default state - includes 75 min/week screen time limit for children under 2"}	{COPPA,HIPAA,FERPA}	\N	f	2025-07-25 14:11:44.501854	{"State changed to West Virginia - System initialization and debugging test at 2025-07-25T14:11:44.442Z"}	2025-07-25 14:11:44.501854
7c22b6c2-d543-4828-a4f3-263ff6cf0fe0	California	{"Infants (0-12 months)":"4:1","Toddlers (13-24 months)":"6:1","2-3 years":"8:1","3-4 years":"12:1","4-5 years":"14:1","School-age (6+)":"14:1","maxGroupSize":{"Infants (0-12 months)":8,"Toddlers (13-24 months)":12,"2-3 years":16,"3-4 years":24,"4-5 years":28,"School-age (6+)":28},"notes":"One of the strictest ratio requirements in the U.S."}	{COPPA,HIPAA,FERPA}	\N	f	2025-07-25 14:11:56.275886	{"State changed to California - Testing state switching to California for stricter ratios at 2025-07-25T14:11:56.215Z"}	2025-07-25 14:11:56.275886
b5ba7f11-15a7-411e-8b38-5c08bcaaec05	New York	{"Infants (0-12 months)":"4:1","Toddlers (13-24 months)":"5:1","2-3 years":"7:1","3-4 years":"8:1","4-5 years":"9:1","School-age (6+)":"10:1","notes":"Extremely strict ratios across all age groups"}	{COPPA,HIPAA,FERPA}	\N	f	2025-07-25 14:12:35.305979	{"State changed to New York - Testing stricter ratios with NY at 2025-07-25T14:12:35.245Z"}	2025-07-25 14:12:35.305979
c6869774-a064-4b4f-a07e-84a9a42d7d4f	California	{"Infants (0-12 months)":"4:1","Toddlers (13-24 months)":"6:1","2-3 years":"8:1","3-4 years":"12:1","4-5 years":"14:1","School-age (6+)":"14:1","maxGroupSize":{"Infants (0-12 months)":8,"Toddlers (13-24 months)":12,"2-3 years":16,"3-4 years":24,"4-5 years":28,"School-age (6+)":28},"notes":"One of the strictest ratio requirements in the U.S."}	{COPPA,HIPAA,FERPA}	\N	t	2025-07-25 14:13:09.741682	{"State changed to California - Testing switch back to California for debugging at 2025-07-25T14:13:09.682Z"}	2025-07-25 14:13:09.741682
\.


--
-- Data for Name: state_ratios; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.state_ratios (id, state, six_weeks, nine_months, eighteen_months, twenty_seven_months, three_years, four_years, five_years, six_years, seven_years, eight_nine_years, ten_plus_years, created_at) FROM stdin;
afa64b07-ed5e-4278-9fe6-f4b48521f490	Alabama	5:1	5:1	7:1	8:1	8:1	18:1	21:1	21:1	21:1	22:1	22:1	2025-07-25 13:03:35.6336
a83fce02-2505-4edb-8656-b53d6d986c8a	Alaska	5:1	5:1	7:1	6:1	10:1	10:1	14:1	14:1	18:1	18:1	18:1	2025-07-25 13:03:35.719965
c2f7616b-9546-45c1-b1db-a858a7a3bf32	Arizona	5:1	5:1	6:1	8:1	13:1	15:1	20:1	20:1	20:1	20:1	20:1	2025-07-25 13:03:35.799848
986629a6-fd8e-4970-b821-b6b19092b725	Arkansas	6:1	6:1	9:1	9:1	12:1	15:1	18:1	20:1	20:1	20:1	20:1	2025-07-25 13:03:35.879306
69e23c73-5f2e-41fb-838b-152094355314	California	4:1	4:1	6:1	6:1	12:1	12:1	14:1	14:1	14:1	14:1	14:1	2025-07-25 13:03:35.958435
d1a3dded-113c-474d-b557-be648feab3cb	Colorado	5:1	5:1	5:1	7:1	10:1	12:1	15:1	15:1	15:1	15:1	15:1	2025-07-25 13:03:36.038425
ba94cd0e-9b13-4d2d-9173-c6737fd8bdd8	Connecticut	4:1	4:1	4:1	4:1	10:1	10:1	10:1	10:1	10:1	10:1	10:1	2025-07-25 13:03:36.117836
576906d6-fd93-44f3-9ff5-5438e384583e	Delaware	4:1	4:1	6:1	8:1	10:1	12:1	15:1	15:1	15:1	15:1	15:1	2025-07-25 13:03:36.196852
0d821181-85ab-4fc0-9281-061511d22742	District of Columbia	4:1	4:1	4:1	4:1	8:1	10:1	15:1	15:1	15:1	15:1	15:1	2025-07-25 13:03:36.275427
119202b4-198f-46bf-88a4-b0e7c55bff1b	Florida	4:1	4:1	6:1	11:1	15:1	20:1	25:1	25:1	25:1	25:1	25:1	2025-07-25 13:03:36.354163
0393d9b2-4857-4672-b321-0b4c4f3fb9a6	Georgia	6:1	6:1	8:1	10:1	15:1	18:1	20:1	25:1	25:1	25:1	25:1	2025-07-25 13:03:36.433075
2ca7cf10-2071-4fa8-bcee-be40824b54cc	Hawaii	4:1	4:1	6:1	8:1	12:1	16:1	20:1	20:1	20:1	20:1	20:1	2025-07-25 13:03:36.511017
451d1219-f046-4933-8c50-150b7aa37337	Illinois	4:1	4:1	5:1	8:1	10:1	10:1	20:1	20:1	20:1	20:1	20:1	2025-07-25 13:03:36.589936
a02b5bba-17c2-4078-b7c2-f27d47a306fe	Indiana	4:1	4:1	5:1	5:1	8:1	10:1	12:1	15:1	15:1	15:1	15:1	2025-07-25 13:03:36.669021
914c1211-b3de-4d87-9925-9552644ebca7	Iowa	4:1	4:1	4:1	6:1	8:1	12:1	15:1	15:1	15:1	15:1	20:1	2025-07-25 13:03:36.748578
463a97cb-3756-42b9-a8f8-45e5d822fa23	Kansas	3:1	3:1	5:1	7:1	12:1	12:1	14:1	16:1	16:1	16:1	16:1	2025-07-25 13:03:36.827249
2acbb978-5515-443c-9c8f-3dad80d1b03a	Kentucky	5:1	5:1	6:1	10:1	12:1	14:1	15:1	15:1	20:1	20:1	20:1	2025-07-25 13:03:36.907526
73e739df-2d8a-4598-b019-0ce165e5db8e	Louisiana	6:1	6:1	8:1	12:1	14:1	16:1	20:1	25:1	25:1	25:1	25:1	2025-07-25 13:03:36.989319
5d71fb83-1d7c-4bbe-a743-70d682cf63d3	Maine	4:1	4:1	5:1	5:1	10:1	10:1	13:1	13:1	13:1	13:1	13:1	2025-07-25 13:03:37.071522
fadda8bb-b966-4ae0-86e2-0fe0d29161d8	Maryland	3:1	3:1	3:1	6:1	10:1	10:1	15:1	15:1	15:1	15:1	15:1	2025-07-25 13:03:37.150419
0c23e2ed-0f14-4bf3-b930-d1e9e09054f9	Massachusetts	7:1	7:1	9:1	9:1	10:1	10:1	15:1	15:1	15:1	15:1	15:1	2025-07-25 13:03:37.22799
2696e8e2-30a1-4743-ae92-4692c113eb39	Michigan	4:1	4:1	4:1	4:1	10:1	12:1	12:1	18:1	18:1	18:1	18:1	2025-07-25 13:03:37.307007
edccc433-1846-408f-8a58-89621f09e4e2	Minnesota	4:1	4:1	7:1	7:1	10:1	10:1	10:1	15:1	15:1	15:1	15:1	2025-07-25 13:03:37.386626
17a1fec2-4d00-4219-bb06-2b588e530159	Mississippi	5:1	5:1	9:1	12:1	8:1	14:1	16:1	20:1	20:1	20:1	25:1	2025-07-25 13:03:37.465452
aeaeee3e-8615-481c-ad75-44c8a962ff32	Missouri	4:1	4:1	4:1	8:1	10:1	10:1	16:1	16:1	16:1	16:1	16:1	2025-07-25 13:03:37.544314
a6f07bdd-14f8-4152-9ea2-88cfab3dd942	Montana	5:1	5:1	7:1	8:1	8:1	18:1	21:1	21:1	21:1	22:1	22:1	2025-07-25 13:03:37.623409
d158cb9f-1564-493b-ae08-93979a9f3630	Nebraska	4:1	4:1	6:1	6:1	10:1	12:1	12:1	15:1	15:1	15:1	15:1	2025-07-25 13:03:37.702798
b925b5dc-fbd9-4af2-a1c6-d9d105260d24	Nevada	4:1	6:1	8:1	10:1	13:1	13:1	13:1	13:1	13:1	13:1	13:1	2025-07-25 13:03:37.781605
65264093-6a2f-4315-8e5b-ed46093618a5	New Hampshire	4:1	4:1	5:1	6:1	8:1	12:1	15:1	15:1	15:1	15:1	15:1	2025-07-25 13:03:37.860542
6fce878d-3249-4870-b4f6-94bb6845f580	New Jersey	4:1	4:1	6:1	10:1	10:1	12:1	15:1	15:1	15:1	15:1	15:1	2025-07-25 13:03:37.939077
7afe6c65-16b5-4057-aec5-ecdbb7ef60a1	New Mexico	6:1	6:1	6:1	10:1	12:1	12:1	15:1	15:1	15:1	15:1	15:1	2025-07-25 13:03:38.017875
b49591e7-4f6c-4c24-8306-d86ae3c6f27d	New York	4:1	4:1	5:1	5:1	7:1	8:1	9:1	10:1	10:1	10:1	15:1	2025-07-25 13:03:38.097057
068f964e-1ea7-4db8-932d-165a3f13143a	North Carolina	5:1	5:1	6:1	10:1	15:1	15:1	25:1	25:1	25:1	25:1	25:1	2025-07-25 13:03:38.176493
d4a11a65-34af-4ff6-b6f2-e7585e7071e6	North Dakota	4:1	4:1	4:1	5:1	7:1	10:1	12:1	18:1	18:1	18:1	18:1	2025-07-25 13:03:38.256
3d729df5-6d2c-43fb-8d09-de19fbb3316c	Ohio	5:1	5:1	7:1	7:1	12:1	14:1	14:1	18:1	18:1	18:1	18:1	2025-07-25 13:03:38.336234
0a27d7a5-8352-4eab-8ddc-b2995d02ac0d	Oklahoma	4:1	4:1	6:1	8:1	12:1	15:1	15:1	20:1	20:1	20:1	20:1	2025-07-25 13:03:38.415117
dbaffe9c-a1b5-431b-93c5-a01c9cb16946	Oregon	4:1	4:1	4:1	5:1	10:1	10:1	15:1	15:1	15:1	15:1	15:1	2025-07-25 13:03:38.495905
8839f135-4415-46af-855d-ef1da93f0e2f	Pennsylvania	4:1	4:1	5:1	6:1	10:1	10:1	10:1	12:1	12:1	15:1	15:1	2025-07-25 13:03:38.575194
5bf8cd61-bb71-4220-85ef-6a130084c35a	Rhode Island	4:1	4:1	6:1	6:1	9:1	10:1	12:1	13:1	13:1	13:1	13:1	2025-07-25 13:03:38.654888
28dfc8d0-be26-4ec1-96fc-901ec60336a2	South Carolina	5:1	5:1	6:1	9:1	13:1	18:1	21:1	23:1	23:1	23:1	23:1	2025-07-25 13:03:38.734152
44ce71e5-d447-4647-9383-c808d4c6db54	South Dakota	5:1	5:1	5:1	5:1	10:1	10:1	10:1	15:1	15:1	15:1	15:1	2025-07-25 13:03:38.818369
1fac32da-c435-4435-83c1-d6e27338b67a	Tennessee	4:1	4:1	6:1	7:1	9:1	13:1	16:1	20:1	20:1	20:1	20:1	2025-07-25 13:03:38.897323
e97fa52d-83ee-46bc-932c-30489418ab37	Texas	4:1	4:1	9:1	11:1	15:1	18:1	22:1	26:1	26:1	26:1	26:1	2025-07-25 13:03:38.976376
ad27c67f-8ad4-4eea-a238-bd7ce268a35b	Utah	4:1	4:1	4:1	7:1	12:1	15:1	20:1	20:1	20:1	20:1	20:1	2025-07-25 13:03:39.054769
6f42c239-e4a2-4a5c-a4b7-2f4923fae085	Vermont	4:1	4:1	4:1	5:1	10:1	10:1	10:1	13:1	13:1	13:1	13:1	2025-07-25 13:03:39.133208
e88b07ed-9e52-484f-9c34-a9242a5f13dc	Virginia	4:1	4:1	5:1	8:1	10:1	10:1	18:1	18:1	18:1	18:1	20:1	2025-07-25 13:03:39.212704
d307827c-73be-4f04-9143-cde24d1874e7	Washington	4:1	4:1	7:1	7:1	10:1	10:1	15:1	15:1	15:1	15:1	15:1	2025-07-25 13:03:39.291624
90f8fd2e-f8dc-44d5-86aa-ae199b657272	West Virginia	4:1	4:1	4:1	8:1	10:1	12:1	12:1	16:1	16:1	16:1	16:1	2025-07-25 13:03:39.370261
7745691f-3b15-4a8f-a931-9cb23b332b65	Wisconsin	4:1	4:1	4:1	6:1	10:1	13:1	17:1	18:1	18:1	18:1	18:1	2025-07-25 13:03:39.450027
3b996b6f-05d8-4d85-a0f4-c5d70bf1782c	Wyoming	4:1	4:1	5:1	8:1	10:1	12:1	12:1	18:1	18:1	18:1	18:1	2025-07-25 13:03:39.527917
\.


--
-- Data for Name: teacher_notes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.teacher_notes (id, child_id, staff_id, date, note, category, created_at) FROM stdin;
\.


--
-- Data for Name: timesheet_entries; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.timesheet_entries (id, staff_id, pay_period_id, date, clock_in_time, clock_out_time, break_minutes, regular_hours, overtime_hours, total_hours, hourly_rate, notes, is_approved, approved_by, approved_at, created_at, updated_at) FROM stdin;
8323dc5c-3ec4-41dd-8d68-a0cf5ae1df61	b544e53c-8d58-4eff-a4b9-cee4d3ee085e	71539eb2-aa78-4c7c-a06d-3be3315657b0	2025-07-25	2025-07-25 20:30:00	2025-07-25 23:30:00	0	180	0	180	\N	\N	t	admin	2025-07-25 15:29:37.589698	2025-07-25 15:29:05.483735	2025-07-25 15:29:05.483735
5e9ba342-4c8b-4e37-81e4-1c20ca8a8d63	d563265c-7a69-47f0-a9c1-21a48517ae63	\N	2025-07-25	2025-07-25 08:00:00	2025-07-25 17:00:00	0	480	60	540	\N	\N	f	\N	\N	2025-07-25 15:30:18.010279	2025-07-25 15:30:18.010279
\.


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_profiles (id, user_id, username, email, role, first_name, last_name, phone_number, date_of_birth, street, city, state, zip_code, job_title, department, employee_id, hire_date, children_ids, emergency_contact, profile_picture_url, bio, preferred_language, notification_preferences, is_active, last_login_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_roles (id, staff_id, role, permissions, created_at) FROM stdin;
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_sessions (sid, sess, expire) FROM stdin;
u6Jo3lYwRYHiE0hcDS32WyjeV5OZL5Xj	{"cookie":{"originalMaxAge":28800000,"expires":"2025-07-30T21:16:05.041Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"sessionId":"e5b12ec3af0f876dc371647ce7bd8ea2c959d3ad05d283fc4eb672607e43b65f","userId":"1"}	2025-07-30 21:16:06
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: neondb_owner
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 1, false);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: neondb_owner
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: alerts alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: billing billing_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.billing
    ADD CONSTRAINT billing_pkey PRIMARY KEY (id);


--
-- Name: child_schedules child_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.child_schedules
    ADD CONSTRAINT child_schedules_pkey PRIMARY KEY (id);


--
-- Name: children children_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.children
    ADD CONSTRAINT children_pkey PRIMARY KEY (id);


--
-- Name: daily_reports daily_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.daily_reports
    ADD CONSTRAINT daily_reports_pkey PRIMARY KEY (id);


--
-- Name: document_reminders document_reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_reminders
    ADD CONSTRAINT document_reminders_pkey PRIMARY KEY (id);


--
-- Name: document_renewals document_renewals_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_renewals
    ADD CONSTRAINT document_renewals_pkey PRIMARY KEY (id);


--
-- Name: document_types document_types_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_types
    ADD CONSTRAINT document_types_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: media_shares media_shares_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.media_shares
    ADD CONSTRAINT media_shares_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: parents parents_email_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parents
    ADD CONSTRAINT parents_email_key UNIQUE (email);


--
-- Name: parents parents_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parents
    ADD CONSTRAINT parents_pkey PRIMARY KEY (id);


--
-- Name: parents parents_username_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.parents
    ADD CONSTRAINT parents_username_key UNIQUE (username);


--
-- Name: pay_periods pay_periods_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pay_periods
    ADD CONSTRAINT pay_periods_pkey PRIMARY KEY (id);


--
-- Name: pay_stubs pay_stubs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pay_stubs
    ADD CONSTRAINT pay_stubs_pkey PRIMARY KEY (id);


--
-- Name: payroll_audit payroll_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payroll_audit
    ADD CONSTRAINT payroll_audit_pkey PRIMARY KEY (id);


--
-- Name: payroll_reports payroll_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payroll_reports
    ADD CONSTRAINT payroll_reports_pkey PRIMARY KEY (id);


--
-- Name: room_schedules room_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.room_schedules
    ADD CONSTRAINT room_schedules_pkey PRIMARY KEY (id);


--
-- Name: safety_reminder_completions safety_reminder_completions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.safety_reminder_completions
    ADD CONSTRAINT safety_reminder_completions_pkey PRIMARY KEY (id);


--
-- Name: safety_reminders safety_reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.safety_reminders
    ADD CONSTRAINT safety_reminders_pkey PRIMARY KEY (id);


--
-- Name: schedule_templates schedule_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.schedule_templates
    ADD CONSTRAINT schedule_templates_pkey PRIMARY KEY (id);


--
-- Name: security_credentials security_credentials_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.security_credentials
    ADD CONSTRAINT security_credentials_pkey PRIMARY KEY (id);


--
-- Name: security_devices security_devices_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.security_devices
    ADD CONSTRAINT security_devices_pkey PRIMARY KEY (id);


--
-- Name: security_logs security_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.security_logs
    ADD CONSTRAINT security_logs_pkey PRIMARY KEY (id);


--
-- Name: security_zones security_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.security_zones
    ADD CONSTRAINT security_zones_pkey PRIMARY KEY (id);


--
-- Name: session_activity session_activity_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.session_activity
    ADD CONSTRAINT session_activity_pkey PRIMARY KEY (id);


--
-- Name: user_sessions session_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: settings settings_key_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_key_unique UNIQUE (key);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: staff staff_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_email_unique UNIQUE (email);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- Name: staff_schedules staff_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff_schedules
    ADD CONSTRAINT staff_schedules_pkey PRIMARY KEY (id);


--
-- Name: state_compliance state_compliance_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.state_compliance
    ADD CONSTRAINT state_compliance_pkey PRIMARY KEY (id);


--
-- Name: state_ratios state_ratios_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.state_ratios
    ADD CONSTRAINT state_ratios_pkey PRIMARY KEY (id);


--
-- Name: state_ratios state_ratios_state_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.state_ratios
    ADD CONSTRAINT state_ratios_state_unique UNIQUE (state);


--
-- Name: teacher_notes teacher_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.teacher_notes
    ADD CONSTRAINT teacher_notes_pkey PRIMARY KEY (id);


--
-- Name: timesheet_entries timesheet_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timesheet_entries
    ADD CONSTRAINT timesheet_entries_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.user_sessions USING btree (expire);


--
-- Name: attendance attendance_child_id_children_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_child_id_children_id_fk FOREIGN KEY (child_id) REFERENCES public.children(id);


--
-- Name: billing billing_child_id_children_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.billing
    ADD CONSTRAINT billing_child_id_children_id_fk FOREIGN KEY (child_id) REFERENCES public.children(id);


--
-- Name: child_schedules child_schedules_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.child_schedules
    ADD CONSTRAINT child_schedules_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id);


--
-- Name: daily_reports daily_reports_child_id_children_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.daily_reports
    ADD CONSTRAINT daily_reports_child_id_children_id_fk FOREIGN KEY (child_id) REFERENCES public.children(id);


--
-- Name: document_reminders document_reminders_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_reminders
    ADD CONSTRAINT document_reminders_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id);


--
-- Name: document_renewals document_renewals_document_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_renewals
    ADD CONSTRAINT document_renewals_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.documents(id);


--
-- Name: documents documents_document_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_document_type_id_fkey FOREIGN KEY (document_type_id) REFERENCES public.document_types(id);


--
-- Name: media_shares media_shares_child_id_children_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.media_shares
    ADD CONSTRAINT media_shares_child_id_children_id_fk FOREIGN KEY (child_id) REFERENCES public.children(id);


--
-- Name: media_shares media_shares_staff_id_staff_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.media_shares
    ADD CONSTRAINT media_shares_staff_id_staff_id_fk FOREIGN KEY (staff_id) REFERENCES public.staff(id);


--
-- Name: messages messages_sender_id_staff_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_staff_id_fk FOREIGN KEY (sender_id) REFERENCES public.staff(id);


--
-- Name: pay_stubs pay_stubs_pay_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pay_stubs
    ADD CONSTRAINT pay_stubs_pay_period_id_fkey FOREIGN KEY (pay_period_id) REFERENCES public.pay_periods(id);


--
-- Name: pay_stubs pay_stubs_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pay_stubs
    ADD CONSTRAINT pay_stubs_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id);


--
-- Name: payroll_reports payroll_reports_pay_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payroll_reports
    ADD CONSTRAINT payroll_reports_pay_period_id_fkey FOREIGN KEY (pay_period_id) REFERENCES public.pay_periods(id);


--
-- Name: safety_reminder_completions safety_reminder_completions_reminder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.safety_reminder_completions
    ADD CONSTRAINT safety_reminder_completions_reminder_id_fkey FOREIGN KEY (reminder_id) REFERENCES public.safety_reminders(id);


--
-- Name: schedule_templates schedule_templates_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.schedule_templates
    ADD CONSTRAINT schedule_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.staff(id);


--
-- Name: security_credentials security_credentials_device_id_security_devices_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.security_credentials
    ADD CONSTRAINT security_credentials_device_id_security_devices_id_fk FOREIGN KEY (device_id) REFERENCES public.security_devices(id);


--
-- Name: security_logs security_logs_device_id_security_devices_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.security_logs
    ADD CONSTRAINT security_logs_device_id_security_devices_id_fk FOREIGN KEY (device_id) REFERENCES public.security_devices(id);


--
-- Name: session_activity session_activity_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.session_activity
    ADD CONSTRAINT session_activity_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id);


--
-- Name: staff_schedules staff_schedules_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff_schedules
    ADD CONSTRAINT staff_schedules_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.staff(id);


--
-- Name: staff_schedules staff_schedules_staff_id_staff_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.staff_schedules
    ADD CONSTRAINT staff_schedules_staff_id_staff_id_fk FOREIGN KEY (staff_id) REFERENCES public.staff(id);


--
-- Name: teacher_notes teacher_notes_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.teacher_notes
    ADD CONSTRAINT teacher_notes_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id);


--
-- Name: teacher_notes teacher_notes_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.teacher_notes
    ADD CONSTRAINT teacher_notes_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id);


--
-- Name: timesheet_entries timesheet_entries_pay_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timesheet_entries
    ADD CONSTRAINT timesheet_entries_pay_period_id_fkey FOREIGN KEY (pay_period_id) REFERENCES public.pay_periods(id);


--
-- Name: timesheet_entries timesheet_entries_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.timesheet_entries
    ADD CONSTRAINT timesheet_entries_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id);


--
-- Name: user_roles user_roles_staff_id_staff_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_staff_id_staff_id_fk FOREIGN KEY (staff_id) REFERENCES public.staff(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

