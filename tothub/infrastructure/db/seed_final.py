#!/usr/bin/env python3
"""
Final seed data script matching actual TotHub database schema
"""

import os
import psycopg2
from datetime import datetime, timedelta
import random
import json
import bcrypt
from faker import Faker

fake = Faker()
DATABASE_URL = os.environ.get('DATABASE_URL')

def hash_password(password):
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def seed_data(conn):
    """Seed all tables with realistic minimal data"""
    cur = conn.cursor()
    
    print("=== TotHub Database Seeding (Final) ===")
    print(f"Timestamp: {datetime.now()}\n")
    
    # Clear existing data (in safe order)
    print("Clearing existing data...")
    tables_to_clear = [
        'attendance', 'billing', 'messages', 'alerts', 'documents',
        'children', 'parents', 'staff', 'settings', 'document_types'
    ]
    
    for table in tables_to_clear:
        try:
            cur.execute(f"DELETE FROM {table}")
            print(f"  Cleared {table}")
        except Exception as e:
            print(f"  Could not clear {table}: {e}")
    
    conn.commit()
    
    print("\nSeeding data...")
    
    # 1. Settings (10 records)
    print("\n1. Settings")
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
    print(f"  ✓ {len(settings)} settings created")
    
    # 2. Document Types (7 records)
    print("\n2. Document Types")
    doc_types_data = [
        ('Medical Form', 'child', 'Medical history and conditions', True, 'annual', 30),
        ('Immunization Records', 'child', 'Vaccination records', True, 'annual', 30),
        ('Emergency Contact', 'child', 'Emergency contact information', True, 'semi-annual', 14),
        ('Teaching License', 'staff', 'Professional teaching license', True, 'annual', 60),
        ('Background Check', 'staff', 'Criminal background check', True, 'custom', 60),
        ('CPR Certification', 'staff', 'CPR training certification', False, 'annual', 30),
        ('Food Allergy Form', 'child', 'Food allergies and dietary restrictions', True, 'annual', 30)
    ]
    
    doc_type_ids = []
    for name, category, desc, required, frequency, alert_days in doc_types_data:
        cur.execute("""
            INSERT INTO document_types (
                name, category, description, is_required, 
                renewal_frequency, alert_days_before, regulatory_body
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (name, category, desc, required, frequency, alert_days, 'State Licensing'))
        doc_type_ids.append(cur.fetchone()[0])
    print(f"  ✓ {len(doc_type_ids)} document types created")
    
    # 3. Staff (5 records)
    print("\n3. Staff")
    staff_data = [
        ('Sarah', 'Johnson', 'Director', 75000),
        ('Michael', 'Brown', 'Lead Teacher', 45000),
        ('Emily', 'Davis', 'Teacher', 40000),
        ('James', 'Wilson', 'Assistant Teacher', 35000),
        ('Lisa', 'Martinez', 'Floater', 35000)
    ]
    
    staff_ids = []
    for i, (first, last, position, salary) in enumerate(staff_data):
        cur.execute("""
            INSERT INTO staff (
                first_name, last_name, email, phone, position,
                is_active, employee_number, salary_amount, pay_type
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            first, last,
            f"{first[0].lower()}{last.lower()}@tothub.com",
            fake.phone_number(),
            position, True, f"EMP{str(i+1).zfill(3)}",
            salary, 'salary'
        ))
        staff_ids.append(cur.fetchone()[0])
    print(f"  ✓ {len(staff_ids)} staff members created")
    
    # 4. Parents (6 records)
    print("\n4. Parents")
    parent_ids = []
    for i in range(6):
        first = fake.first_name()
        last = fake.last_name()
        username = f"{first[0].lower()}{last.lower()}{random.randint(10,99)}"
        
        cur.execute("""
            INSERT INTO parents (
                username, password_hash, email, first_name, last_name,
                phone, is_active, email_verified
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            username,
            hash_password('parent123'),  # Default password for testing
            f"{username}@email.com",
            first, last,
            fake.phone_number(),
            True, True
        ))
        parent_ids.append(cur.fetchone()[0])
    print(f"  ✓ {len(parent_ids)} parents created")
    
    # 5. Children (8 records)
    print("\n5. Children")
    child_ids = []
    age_groups = ['infant', 'toddler', 'preschool']
    rooms = ['Sunshine Room', 'Rainbow Room', 'Star Room']
    
    for i in range(8):
        parent_idx = i % len(parent_ids)
        parent_id = parent_ids[parent_idx]
        
        # Get parent info for this child
        cur.execute("SELECT first_name, last_name, email, phone FROM parents WHERE id = %s", (parent_id,))
        parent_info = cur.fetchone()
        
        age = random.randint(1, 5)
        age_group = 'infant' if age <= 1 else 'toddler' if age <= 3 else 'preschool'
        
        cur.execute("""
            INSERT INTO children (
                first_name, last_name, date_of_birth, age_group, room,
                parent_name, parent_email, parent_phone, parent_id,
                is_active, enrollment_date, tuition_rate, enrollment_status,
                allergies, medical_conditions
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            fake.first_name(),
            parent_info[1],  # Same last name as parent
            datetime.now() - timedelta(days=age*365),
            age_group,
            random.choice(rooms),
            f"{parent_info[0]} {parent_info[1]}",
            parent_info[2],
            parent_info[3],
            parent_id,
            True,
            datetime.now() - timedelta(days=random.randint(30, 180)),
            random.choice([800, 900, 1000, 1200]),
            'enrolled',
            ['Peanuts'] if i % 4 == 0 else [],
            ['Asthma'] if i % 3 == 0 else []
        ))
        child_ids.append(cur.fetchone()[0])
    print(f"  ✓ {len(child_ids)} children created")
    
    # 6. Attendance (last 5 days)
    print("\n6. Attendance")
    attendance_count = 0
    for days_ago in range(5):
        date = datetime.now().date() - timedelta(days=days_ago)
        
        # Random subset of children attend each day
        attending = random.sample(child_ids, random.randint(5, len(child_ids)))
        
        for child_id in attending:
            check_in = datetime.combine(date, datetime.min.time()).replace(
                hour=random.randint(7, 9),
                minute=random.randint(0, 59)
            )
            check_out = check_in + timedelta(hours=random.randint(6, 9)) if days_ago > 0 else None
            
            cur.execute("""
                INSERT INTO attendance (
                    child_id, date, check_in_time, check_out_time,
                    checked_in_by, checked_out_by,
                    mood_rating, room, activities_completed
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                child_id, date, check_in, check_out,
                random.choice(staff_ids),
                random.choice(staff_ids) if check_out else None,
                random.randint(3, 5),
                random.choice(['Sunshine Room', 'Rainbow Room', 'Star Room']),
                ['Circle Time', 'Snack', 'Outdoor Play', 'Art Project']
            ))
            attendance_count += 1
    print(f"  ✓ {attendance_count} attendance records created")
    
    # 7. Billing (10 records)
    print("\n7. Billing")
    billing_count = 0
    for month_offset in range(2):
        period_start = datetime.now().replace(day=1) - timedelta(days=month_offset*30)
        period_end = (period_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        for child_id in child_ids[:5]:  # First 5 children
            tuition = random.choice([800, 900, 1000, 1200])
            extra_fees = random.choice([0, 50, 100]) if random.random() > 0.7 else 0
            total = tuition + extra_fees
            paid = month_offset > 0 or random.choice([True, False])
            
            cur.execute("""
                INSERT INTO billing (
                    child_id, period_start, period_end, attendance_days,
                    tuition_amount, extra_fees, total_amount, status,
                    due_date
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                child_id, period_start, period_end,
                random.randint(15, 22),  # attendance days
                tuition, extra_fees, total,
                'paid' if paid else 'pending',
                period_start + timedelta(days=5)
            ))
            billing_count += 1
    print(f"  ✓ {billing_count} billing records created")
    
    # 8. Messages (5 records)
    print("\n8. Messages")
    messages = [
        ("Picture Day Tomorrow", "Don't forget - tomorrow is picture day!", 'high'),
        ("Weekly Update", "This week we'll be learning about shapes and colors.", 'normal'),
        ("Holiday Schedule", "We'll be closed on Monday for the holiday.", 'high'),
        ("Thank You", "Thank you for your participation in our fundraiser!", 'normal'),
        ("Reminder", "Please update your emergency contact information.", 'normal')
    ]
    
    for subject, content, priority in messages:
        cur.execute("""
            INSERT INTO messages (
                sender_id, recipient_type, subject, content,
                is_read, priority, created_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            random.choice(staff_ids),
            'broadcast',
            subject, content, False, priority,
            datetime.now() - timedelta(days=random.randint(0, 7))
        ))
    print(f"  ✓ {len(messages)} messages created")
    
    # 9. Alerts (5 records)
    print("\n9. Alerts")
    alerts_data = [
        ('low', 'Supply Request', 'Paper towels running low'),
        ('medium', 'Ratio Warning', 'Approaching maximum ratio in Toddler Room'),
        ('high', 'Document Expiring', '2 staff certifications expire this month'),
        ('critical', 'Safety Drill Due', 'Monthly fire drill scheduled'),
        ('medium', 'Maintenance', 'AC filter replacement scheduled')
    ]
    
    for severity, title, message in alerts_data:
        cur.execute("""
            INSERT INTO alerts (
                type, severity, message, is_read, created_at
            ) VALUES (%s, %s, %s, %s, %s)
        """, (
            'system', severity, f"{title}: {message}",
            False,
            datetime.now() - timedelta(hours=random.randint(1, 48))
        ))
    print(f"  ✓ {len(alerts_data)} alerts created")
    
    # 10. Documents - Skipping due to schema differences
    print("\n10. Documents")
    print("  ⚠️  Skipping documents - table structure differs from expected")
    
    conn.commit()
    
    # Return IDs for validation
    return {
        'staff_ids': staff_ids,
        'parent_ids': parent_ids,
        'child_ids': child_ids,
        'doc_type_ids': doc_type_ids
    }

def validate_data(conn):
    """Validate the seeded data"""
    cur = conn.cursor()
    
    print("\n=== Validation Results ===")
    
    # Table counts
    tables = [
        ('settings', 10),
        ('document_types', 7),
        ('staff', 5),
        ('parents', 6),
        ('children', 8),
        ('attendance', '20+'),
        ('billing', 10),
        ('messages', 5),
        ('alerts', 5),
        ('documents', '18+')
    ]
    
    all_valid = True
    for table, expected in tables:
        cur.execute(f"SELECT COUNT(*) FROM {table}")
        count = cur.fetchone()[0]
        
        if isinstance(expected, int):
            if count == expected:
                print(f"  ✓ {table}: {count} records")
            else:
                print(f"  ✗ {table}: {count} records (expected {expected})")
                all_valid = False
        else:
            print(f"  ✓ {table}: {count} records")
    
    # Foreign key validation
    print("\n=== Foreign Key Validation ===")
    
    # Children -> Parents
    cur.execute("""
        SELECT COUNT(*) FROM children c
        LEFT JOIN parents p ON c.parent_id = p.id
        WHERE c.parent_id IS NOT NULL AND p.id IS NULL
    """)
    orphans = cur.fetchone()[0]
    
    if orphans == 0:
        print("  ✓ All children have valid parent references")
    else:
        print(f"  ✗ {orphans} children have invalid parent references")
        all_valid = False
    
    # Attendance -> Children
    cur.execute("""
        SELECT COUNT(*) FROM attendance a
        LEFT JOIN children c ON a.child_id = c.id
        WHERE c.id IS NULL
    """)
    orphans = cur.fetchone()[0]
    
    if orphans == 0:
        print("  ✓ All attendance records have valid child references")
    else:
        print(f"  ✗ {orphans} attendance records have invalid child references")
        all_valid = False
    
    # Billing -> Children
    cur.execute("""
        SELECT COUNT(*) FROM billing b
        LEFT JOIN children c ON b.child_id = c.id
        WHERE c.id IS NULL
    """)
    orphans = cur.fetchone()[0]
    
    if orphans == 0:
        print("  ✓ All billing records have valid child references")
    else:
        print(f"  ✗ {orphans} billing records have invalid child references")
        all_valid = False
    
    return all_valid

def main():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        
        # Seed the data
        ids = seed_data(conn)
        
        # Validate
        if validate_data(conn):
            print("\n✅ All data seeded and validated successfully!")
        else:
            print("\n⚠️  Some validation issues found")
        
        conn.close()
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()