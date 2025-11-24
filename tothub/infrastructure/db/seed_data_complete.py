#!/usr/bin/env python3
"""
Complete seed data script for TotHub database
Creates realistic minimal sample data (5-10 rows per table)
Respects all foreign key relationships
"""

import os
import psycopg2
from datetime import datetime, timedelta, date
import random
import json
from faker import Faker
import bcrypt

fake = Faker()

# Database connection
DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    print("Error: DATABASE_URL environment variable not set")
    exit(1)

def hash_pin(pin):
    """Hash a PIN using bcrypt"""
    return bcrypt.hashpw(pin.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def clear_existing_data(conn):
    """Clear existing data in correct order to respect foreign keys"""
    cur = conn.cursor()
    
    # Tables to clear in reverse dependency order
    tables_to_clear = [
        'session_activity', 'billing', 'attendance', 'child_schedules',
        'staff_schedules', 'messages', 'alerts', 'daily_reports',
        'media_shares', 'teacher_notes', 'documents', 'document_reminders',
        'document_renewals', 'safety_reminder_completions', 'security_logs',
        'pay_stubs', 'timesheet_entries', 'payroll_audit', 'payroll_reports',
        'security_credentials', 'children', 'parents', 'staff',
        'room_schedules', 'schedule_templates', 'security_devices',
        'security_zones', 'state_compliance', 'state_ratios',
        'safety_reminders', 'document_types', 'pay_periods', 'settings'
    ]
    
    for table in tables_to_clear:
        try:
            cur.execute(f"TRUNCATE TABLE {table} CASCADE")
            print(f"  Cleared {table}")
        except Exception as e:
            print(f"  Warning: Could not clear {table}: {e}")
    
    conn.commit()

def seed_settings(conn):
    """Seed basic settings"""
    cur = conn.cursor()
    
    settings = [
        ('facility_name', 'TotHub Learning Center'),
        ('facility_address', '123 Education Way, Learning City, ST 12345'),
        ('facility_phone', '(555) 123-4567'),
        ('facility_email', 'info@tothub.com'),
        ('business_hours', '7:00 AM - 6:00 PM'),
        ('time_zone', 'America/New_York'),
        ('state', 'NY'),
        ('license_number', 'DC-2024-123456'),
        ('capacity', '100'),
        ('age_limit', '14')
    ]
    
    for key, value in settings:
        cur.execute("""
            INSERT INTO settings (key, value, updated_at)
            VALUES (%s, %s, NOW())
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
        """, (key, value))
    
    conn.commit()
    print("✓ Seeded settings")

def seed_document_types(conn):
    """Seed document types"""
    cur = conn.cursor()
    
    doc_types = [
        ('Medical Information Form', 'child', 'Medical history and conditions', True, 'annual', None, 30, 'NY Department of Health'),
        ('Immunization Records', 'child', 'Vaccination records', True, 'annual', None, 30, 'CDC'),
        ('Emergency Contact Form', 'child', 'Emergency contact information', True, 'semi-annual', None, 14, 'State Licensing'),
        ('Professional License', 'staff', 'Teaching or childcare license', True, 'annual', None, 60, 'NY State Education Department'),
        ('Background Check', 'staff', 'Criminal background check', True, 'custom', 730, 60, 'FBI/State Police'),
        ('CPR Certification', 'staff', 'CPR training certification', False, 'annual', None, 30, 'American Heart Association'),
        ('Allergy Information', 'child', 'Food and environmental allergies', True, 'annual', None, 30, 'Physician')
    ]
    
    for name, category, description, required, frequency, custom_days, alert_days, regulatory in doc_types:
        cur.execute("""
            INSERT INTO document_types (name, category, description, 
                                      is_required, renewal_frequency, 
                                      custom_frequency_days, alert_days_before,
                                      regulatory_body, compliance_notes)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (name, category, description, required, frequency, 
              custom_days, alert_days, regulatory, 
              f"Required by {regulatory}" if required else "Recommended"))
    
    conn.commit()
    print("✓ Seeded document types")

def seed_state_compliance(conn):
    """Seed state compliance settings"""
    cur = conn.cursor()
    
    states = ['NY', 'CA', 'TX', 'FL', 'IL']
    
    for state in states:
        cur.execute("""
            INSERT INTO state_compliance (
                state_code, staff_child_ratio_infant, staff_child_ratio_toddler,
                staff_child_ratio_preschool, staff_child_ratio_school_age,
                max_group_size_infant, max_group_size_toddler,
                max_group_size_preschool, max_group_size_school_age,
                training_hours_required, background_check_required,
                health_screening_required, additional_requirements
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            state,
            3 if state == 'NY' else 4,  # Infant ratio
            5 if state == 'NY' else 6,  # Toddler ratio
            7 if state == 'NY' else 8,  # Preschool ratio
            10 if state == 'NY' else 12, # School age ratio
            8, 12, 18, 20,  # Max group sizes
            30 if state == 'CA' else 24,  # Training hours
            True, True,  # Background check and health screening
            json.dumps({'fingerprinting': state in ['NY', 'CA']})
        ))
    
    conn.commit()
    print("✓ Seeded state compliance settings")

def seed_staff(conn):
    """Seed staff members"""
    cur = conn.cursor()
    
    staff_members = [
        ('Sarah', 'Johnson', 'sjohnson@tothub.com', 'Director', 75000, '1234'),
        ('Michael', 'Brown', 'mbrown@tothub.com', 'Lead Teacher', 45000, '2345'),
        ('Emily', 'Davis', 'edavis@tothub.com', 'Teacher', 40000, '3456'),
        ('James', 'Wilson', 'jwilson@tothub.com', 'Assistant Teacher', 35000, '4567'),
        ('Lisa', 'Martinez', 'lmartinez@tothub.com', 'Floater', 35000, '5678')
    ]
    
    staff_ids = []
    for i, (first, last, email, position, salary, pin) in enumerate(staff_members):
        cur.execute("""
            INSERT INTO staff (
                first_name, last_name, email, phone_number, address,
                date_of_birth, ssn, position, department, hire_date,
                employment_type, wage_type, hourly_rate, salary,
                emergency_contact_name, emergency_contact_phone,
                certifications, background_check_date, fingerprint_on_file,
                health_screening_date, pin_hash, employee_id, is_active
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s
            ) RETURNING id
        """, (
            first, last, email, fake.phone_number(), fake.address(),
            fake.date_of_birth(minimum_age=25, maximum_age=55),
            f'XXX-XX-{random.randint(1000, 9999)}',  # Masked SSN
            position, 'Education',
            datetime.now().date() - timedelta(days=random.randint(180, 1825)),
            'full-time', 'salary', None, salary,
            fake.name(), fake.phone_number(),
            ['CPR', 'First Aid'] if i < 3 else ['CPR'],
            datetime.now().date() - timedelta(days=30),
            True,
            datetime.now().date() - timedelta(days=60),
            hash_pin(pin),
            f'EMP{str(i+1).zfill(3)}',
            True
        ))
        staff_ids.append(cur.fetchone()[0])
    
    conn.commit()
    print(f"✓ Seeded {len(staff_ids)} staff members")
    return staff_ids

def seed_parents(conn):
    """Seed parent records"""
    cur = conn.cursor()
    
    parent_ids = []
    for i in range(8):  # 8 parents
        cur.execute("""
            INSERT INTO parents (
                first_name, last_name, email, phone_number, address,
                emergency_priority, relationship, can_pickup,
                id_verified, notes, is_active
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            fake.first_name(),
            fake.last_name(),
            fake.email(),
            fake.phone_number(),
            fake.address(),
            1 if i % 2 == 0 else 2,  # Alternating priority
            'Mother' if i % 2 == 0 else 'Father',
            True,
            True,
            'Primary contact' if i < 4 else None,
            True
        ))
        parent_ids.append(cur.fetchone()[0])
    
    conn.commit()
    print(f"✓ Seeded {len(parent_ids)} parents")
    return parent_ids

def seed_children(conn, parent_ids):
    """Seed children records"""
    cur = conn.cursor()
    
    child_ids = []
    rooms = ['infant', 'toddler', 'preschool']
    
    for i in range(10):  # 10 children
        parent_id = parent_ids[i % len(parent_ids)]
        age = random.randint(1, 5)
        
        cur.execute("""
            INSERT INTO children (
                first_name, last_name, date_of_birth, gender,
                enrollment_date, classroom, allergies, medical_conditions,
                medications, emergency_contact_name, emergency_contact_phone,
                pediatrician_name, pediatrician_phone, notes,
                parent_id, profile_image, age_months, is_active
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s
            ) RETURNING id
        """, (
            fake.first_name(),
            fake.last_name(),
            datetime.now().date() - timedelta(days=age*365),
            random.choice(['M', 'F']),
            datetime.now().date() - timedelta(days=random.randint(30, 180)),
            random.choice(rooms),
            'Peanuts' if i % 5 == 0 else None,
            'Asthma' if i % 4 == 0 else None,
            'Inhaler PRN' if i % 4 == 0 else None,
            fake.name(),
            fake.phone_number(),
            f"Dr. {fake.last_name()}",
            fake.phone_number(),
            f"Loves {random.choice(['art', 'music', 'reading', 'blocks'])}",
            parent_id,
            None,  # No profile image in seed data
            age * 12,
            True
        ))
        child_ids.append(cur.fetchone()[0])
    
    conn.commit()
    print(f"✓ Seeded {len(child_ids)} children")
    return child_ids

def seed_attendance(conn, child_ids, staff_ids):
    """Seed attendance records"""
    cur = conn.cursor()
    
    # Last 7 days of attendance
    for days_ago in range(7):
        date = datetime.now().date() - timedelta(days=days_ago)
        
        # Random subset of children attend each day
        attending_children = random.sample(child_ids, random.randint(6, len(child_ids)))
        
        for child_id in attending_children:
            check_in_time = datetime.combine(date, datetime.min.time()).replace(
                hour=random.randint(7, 9),
                minute=random.randint(0, 59)
            )
            check_out_time = check_in_time + timedelta(hours=random.randint(6, 9))
            
            cur.execute("""
                INSERT INTO attendance (
                    child_id, date, check_in_time, check_out_time,
                    checked_in_by, checked_out_by, status, notes,
                    mood_at_checkin, mood_rating, activities_participated,
                    temperature, photo_url
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                child_id,
                date,
                check_in_time,
                check_out_time if days_ago > 0 else None,  # Today might not have checkout
                random.choice(staff_ids),
                random.choice(staff_ids) if days_ago > 0 else None,
                'present',
                None,
                random.choice(['happy', 'calm', 'tired', 'excited']),
                random.randint(3, 5),
                ['Circle Time', 'Snack', 'Outdoor Play'],
                98.6 + random.random(),
                None
            ))
    
    conn.commit()
    print("✓ Seeded attendance records")

def seed_billing(conn, child_ids):
    """Seed billing records"""
    cur = conn.cursor()
    
    # Current and past month billing
    for month_offset in range(2):
        billing_date = datetime.now().date().replace(day=1) - timedelta(days=month_offset*30)
        due_date = billing_date + timedelta(days=5)
        
        for child_id in child_ids[:7]:  # Not all children have billing yet
            amount = random.choice([800, 900, 1000, 1200])
            paid = month_offset > 0 or random.choice([True, False])
            
            cur.execute("""
                INSERT INTO billing (
                    child_id, billing_date, due_date, amount_due,
                    amount_paid, payment_date, payment_method,
                    invoice_number, status, late_fee, notes
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                child_id,
                billing_date,
                due_date,
                amount,
                amount if paid else 0,
                billing_date + timedelta(days=random.randint(1, 5)) if paid else None,
                random.choice(['credit_card', 'check', 'cash']) if paid else None,
                f"INV-{billing_date.strftime('%Y%m')}-{str(child_id).zfill(3)}",
                'paid' if paid else 'pending',
                0,
                None
            ))
    
    conn.commit()
    print("✓ Seeded billing records")

def seed_messages(conn, staff_ids, parent_ids):
    """Seed messages"""
    cur = conn.cursor()
    
    messages = [
        ("Reminder: Picture Day Tomorrow", "Don't forget - tomorrow is picture day! Please have your child wear their best smile.", 'high'),
        ("Weekly Newsletter", "This week's activities include art projects and outdoor exploration.", 'normal'),
        ("Schedule Update", "We'll be closing early on Friday at 4 PM for staff training.", 'high'),
        ("Thank You!", "Thank you for your participation in our recent fundraiser!", 'normal'),
        ("Health Alert", "We've had a case of strep throat. Please monitor your child for symptoms.", 'urgent')
    ]
    
    for subject, content, priority in messages:
        # Staff to all parents
        cur.execute("""
            INSERT INTO messages (
                sender_id, recipient_type, recipient_id, subject,
                content, is_read, priority, created_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            random.choice(staff_ids),
            'broadcast',
            None,
            subject,
            content,
            False,
            priority,
            datetime.now() - timedelta(days=random.randint(0, 7))
        ))
    
    conn.commit()
    print("✓ Seeded messages")

def seed_alerts(conn, staff_ids):
    """Seed system alerts"""
    cur = conn.cursor()
    
    alerts = [
        ('low', 'Supplies Low', 'Paper towels running low in Toddler Room'),
        ('medium', 'Staff Ratio Warning', 'Preschool room approaching maximum ratio'),
        ('high', 'Document Expiring', '3 staff certifications expire this month'),
        ('critical', 'Emergency Drill Due', 'Monthly fire drill has not been completed')
    ]
    
    for severity, title, message in alerts:
        cur.execute("""
            INSERT INTO alerts (
                type, severity, title, message, recipient_id,
                recipient_type, is_read, action_required, action_url,
                created_at, expires_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            'system',
            severity,
            title,
            message,
            random.choice(staff_ids),
            'staff',
            False,
            severity in ['high', 'critical'],
            '/admin/alerts' if severity in ['high', 'critical'] else None,
            datetime.now() - timedelta(hours=random.randint(1, 48)),
            datetime.now() + timedelta(days=7)
        ))
    
    conn.commit()
    print("✓ Seeded alerts")

def seed_room_schedules(conn):
    """Seed room schedules with actual table structure"""
    cur = conn.cursor()
    
    rooms = ['Infant Room', 'Toddler Room', 'Preschool Room']
    time_slots = ['morning', 'afternoon', 'full_day']
    
    for i in range(7):  # Next 7 days
        date = datetime.now() + timedelta(days=i)
        
        for room in rooms:
            for slot in time_slots:
                cur.execute("""
                    INSERT INTO room_schedules (
                        room, date, time_slot, max_capacity,
                        current_occupancy, staff_required, staff_assigned,
                        is_available, activities, special_requirements, notes
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    room,
                    date,
                    slot,
                    12 if room == 'Infant Room' else 20,
                    random.randint(5, 10),
                    2 if room == 'Infant Room' else 3,
                    2 if room == 'Infant Room' else 3,
                    True,
                    ['Art', 'Music', 'Story Time'] if slot != 'full_day' else ['All Day Activities'],
                    'Extra staff for field trip' if i == 3 and room == 'Preschool Room' else None,
                    None
                ))
    
    conn.commit()
    print("✓ Seeded room schedules")

def seed_documents(conn, child_ids, staff_ids):
    """Seed documents"""
    cur = conn.cursor()
    
    # Get document types
    cur.execute("SELECT id, name, category FROM document_types")
    doc_types = cur.fetchall()
    
    # Child documents
    for child_id in child_ids[:5]:  # First 5 children have documents
        for doc_type_id, doc_name, category in doc_types:
            if category == 'child':
                cur.execute("""
                    INSERT INTO documents (
                        entity_type, entity_id, document_type_id,
                        file_name, file_url, status, upload_date,
                        expiration_date, verified_by, notes
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    'child',
                    child_id,
                    doc_type_id,
                    f"{doc_name}_{child_id}.pdf",
                    f"/documents/{doc_name}_{child_id}.pdf",
                    'current',
                    datetime.now().date() - timedelta(days=30),
                    datetime.now().date() + timedelta(days=335),
                    staff_ids[0],
                    None
                ))
    
    # Staff documents
    for staff_id in staff_ids[:3]:  # First 3 staff have documents
        for doc_type_id, doc_name, category in doc_types:
            if category == 'staff':
                cur.execute("""
                    INSERT INTO documents (
                        entity_type, entity_id, document_type_id,
                        file_name, file_url, status, upload_date,
                        expiration_date, verified_by, notes
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    'staff',
                    staff_id,
                    doc_type_id,
                    f"{doc_name}_{staff_id}.pdf",
                    f"/documents/{doc_name}_{staff_id}.pdf",
                    'current',
                    datetime.now().date() - timedelta(days=60),
                    datetime.now().date() + timedelta(days=305),
                    staff_ids[0],
                    None
                ))
    
    conn.commit()
    print("✓ Seeded documents")

def validate_seed_data(conn):
    """Validate that data was seeded correctly"""
    cur = conn.cursor()
    
    tables_to_check = [
        'settings', 'staff', 'parents', 'children', 'attendance',
        'billing', 'messages', 'alerts', 'documents', 'room_schedules'
    ]
    
    print("\n=== Validation Results ===")
    all_valid = True
    
    for table in tables_to_check:
        cur.execute(f"SELECT COUNT(*) FROM {table}")
        count = cur.fetchone()[0]
        
        if count > 0:
            print(f"✓ {table}: {count} records")
        else:
            print(f"✗ {table}: No records found")
            all_valid = False
    
    # Check foreign key relationships
    print("\n=== Foreign Key Validation ===")
    
    # Children should have valid parent_ids
    cur.execute("""
        SELECT COUNT(*) FROM children c
        LEFT JOIN parents p ON c.parent_id = p.id
        WHERE c.parent_id IS NOT NULL AND p.id IS NULL
    """)
    orphan_children = cur.fetchone()[0]
    if orphan_children == 0:
        print("✓ All children have valid parent references")
    else:
        print(f"✗ {orphan_children} children have invalid parent references")
        all_valid = False
    
    # Attendance should have valid child_ids
    cur.execute("""
        SELECT COUNT(*) FROM attendance a
        LEFT JOIN children c ON a.child_id = c.id
        WHERE c.id IS NULL
    """)
    orphan_attendance = cur.fetchone()[0]
    if orphan_attendance == 0:
        print("✓ All attendance records have valid child references")
    else:
        print(f"✗ {orphan_attendance} attendance records have invalid child references")
        all_valid = False
    
    return all_valid

def main():
    """Main execution function"""
    print("=== TotHub Complete Database Seeding ===")
    print(f"Timestamp: {datetime.now()}")
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        
        # Ask for confirmation before clearing data
        response = input("\nThis will clear existing data. Continue? (yes/no): ")
        if response.lower() != 'yes':
            print("Seeding cancelled.")
            return
        
        print("\nClearing existing data...")
        clear_existing_data(conn)
        
        print("\nSeeding data...")
        
        # Seed in dependency order
        seed_settings(conn)
        seed_document_types(conn)
        seed_state_compliance(conn)
        
        staff_ids = seed_staff(conn)
        parent_ids = seed_parents(conn)
        child_ids = seed_children(conn, parent_ids)
        
        seed_attendance(conn, child_ids, staff_ids)
        seed_billing(conn, child_ids)
        seed_messages(conn, staff_ids, parent_ids)
        seed_alerts(conn, staff_ids)
        seed_room_schedules(conn)
        seed_documents(conn, child_ids, staff_ids)
        
        # Validate
        if validate_seed_data(conn):
            print("\n✅ All data seeded successfully!")
        else:
            print("\n⚠️  Some issues found during validation")
        
        conn.close()
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()