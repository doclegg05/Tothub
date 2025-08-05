#!/usr/bin/env python3
"""
Minimal seed data script that adapts to actual table structures
"""

import os
import psycopg2
from datetime import datetime, timedelta
import random
import json
from faker import Faker
import bcrypt

fake = Faker()
DATABASE_URL = os.environ.get('DATABASE_URL')

def hash_pin(pin):
    return bcrypt.hashpw(pin.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def seed_basic_data(conn):
    """Seed only the essential tables with minimal data"""
    cur = conn.cursor()
    
    print("Clearing existing data...")
    # Clear in safe order
    for table in ['attendance', 'billing', 'documents', 'children', 'parents', 'staff', 'settings']:
        try:
            cur.execute(f"DELETE FROM {table}")
        except:
            pass
    conn.commit()
    
    print("Seeding basic data...")
    
    # 1. Settings
    settings = [
        ('facility_name', 'TotHub Learning Center'),
        ('facility_phone', '(555) 123-4567'),
        ('state', 'NY'),
        ('age_limit', '14')
    ]
    
    for key, value in settings:
        cur.execute("""
            INSERT INTO settings (key, value, updated_at)
            VALUES (%s, %s, NOW())
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
        """, (key, value))
    print("✓ Settings (4 records)")
    
    # 2. Staff (5 members)
    staff_ids = []
    staff_data = [
        ('Sarah Johnson', 'Director', '1234'),
        ('Michael Brown', 'Teacher', '2345'),
        ('Emily Davis', 'Teacher', '3456'),
        ('James Wilson', 'Assistant', '4567'),
        ('Lisa Martinez', 'Floater', '5678')
    ]
    
    for i, (name, position, pin) in enumerate(staff_data):
        first, last = name.split()
        cur.execute("""
            INSERT INTO staff (
                first_name, last_name, email, phone_number, address,
                date_of_birth, ssn, position, department, hire_date,
                employment_type, wage_type, salary, pin_hash, 
                employee_id, is_active
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 
                %s, %s, %s, %s, %s, %s
            ) RETURNING id
        """, (
            first, last, f"{first[0].lower()}{last.lower()}@tothub.com",
            fake.phone_number(), fake.address(),
            fake.date_of_birth(minimum_age=25, maximum_age=55),
            f'XXX-XX-{random.randint(1000, 9999)}',
            position, 'Education',
            datetime.now().date() - timedelta(days=random.randint(180, 1825)),
            'full-time', 'salary', random.randint(35000, 75000),
            hash_pin(pin), f'EMP{str(i+1).zfill(3)}', True
        ))
        staff_ids.append(cur.fetchone()[0])
    print(f"✓ Staff ({len(staff_ids)} records)")
    
    # 3. Parents (6 records)
    parent_ids = []
    for i in range(6):
        cur.execute("""
            INSERT INTO parents (
                first_name, last_name, email, phone_number, address,
                emergency_priority, relationship, can_pickup,
                id_verified, is_active
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            fake.first_name(), fake.last_name(), fake.email(),
            fake.phone_number(), fake.address(),
            1 if i < 3 else 2,
            'Mother' if i % 2 == 0 else 'Father',
            True, True, True
        ))
        parent_ids.append(cur.fetchone()[0])
    print(f"✓ Parents ({len(parent_ids)} records)")
    
    # 4. Children (8 records)
    child_ids = []
    for i in range(8):
        age = random.randint(1, 5)
        cur.execute("""
            INSERT INTO children (
                first_name, last_name, date_of_birth, gender,
                enrollment_date, classroom, parent_id, age_months, is_active
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            fake.first_name(), fake.last_name(),
            datetime.now().date() - timedelta(days=age*365),
            random.choice(['M', 'F']),
            datetime.now().date() - timedelta(days=random.randint(30, 180)),
            random.choice(['infant', 'toddler', 'preschool']),
            parent_ids[i % len(parent_ids)],
            age * 12, True
        ))
        child_ids.append(cur.fetchone()[0])
    print(f"✓ Children ({len(child_ids)} records)")
    
    # 5. Attendance (last 5 days)
    attendance_count = 0
    for days_ago in range(5):
        date = datetime.now().date() - timedelta(days=days_ago)
        attending = random.sample(child_ids, random.randint(5, len(child_ids)))
        
        for child_id in attending:
            check_in = datetime.combine(date, datetime.min.time()).replace(
                hour=random.randint(7, 9), minute=random.randint(0, 59)
            )
            check_out = check_in + timedelta(hours=random.randint(6, 9)) if days_ago > 0 else None
            
            cur.execute("""
                INSERT INTO attendance (
                    child_id, date, check_in_time, check_out_time,
                    checked_in_by, checked_out_by, status,
                    mood_rating, temperature
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                child_id, date, check_in, check_out,
                random.choice(staff_ids),
                random.choice(staff_ids) if check_out else None,
                'present',
                random.randint(3, 5),
                98.6 + random.random()
            ))
            attendance_count += 1
    print(f"✓ Attendance ({attendance_count} records)")
    
    # 6. Billing (last 2 months)
    billing_count = 0
    for month_offset in range(2):
        billing_date = datetime.now().date().replace(day=1) - timedelta(days=month_offset*30)
        
        for child_id in child_ids[:5]:  # First 5 children
            amount = random.choice([800, 900, 1000])
            paid = month_offset > 0 or random.choice([True, False])
            
            cur.execute("""
                INSERT INTO billing (
                    child_id, billing_date, due_date, amount_due,
                    amount_paid, payment_date, payment_method,
                    invoice_number, status
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                child_id, billing_date, billing_date + timedelta(days=5),
                amount, amount if paid else 0,
                billing_date + timedelta(days=random.randint(1, 5)) if paid else None,
                random.choice(['credit_card', 'check']) if paid else None,
                f"INV-{billing_date.strftime('%Y%m')}-{str(child_id)[-3:]}",
                'paid' if paid else 'pending'
            ))
            billing_count += 1
    print(f"✓ Billing ({billing_count} records)")
    
    conn.commit()
    return staff_ids, parent_ids, child_ids

def validate_data(conn):
    """Validate the seeded data"""
    cur = conn.cursor()
    
    print("\n=== Validation ===")
    tables = ['settings', 'staff', 'parents', 'children', 'attendance', 'billing']
    
    for table in tables:
        cur.execute(f"SELECT COUNT(*) FROM {table}")
        count = cur.fetchone()[0]
        print(f"✓ {table}: {count} records")
    
    # Check foreign keys
    cur.execute("""
        SELECT COUNT(*) FROM children c
        LEFT JOIN parents p ON c.parent_id = p.id
        WHERE c.parent_id IS NOT NULL AND p.id IS NULL
    """)
    orphans = cur.fetchone()[0]
    
    if orphans == 0:
        print("✓ All foreign keys valid")
    else:
        print(f"✗ {orphans} orphaned records found")
    
    return orphans == 0

def main():
    print("=== TotHub Minimal Seed Data ===")
    print(f"Timestamp: {datetime.now()}\n")
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        
        # Seed the data
        staff_ids, parent_ids, child_ids = seed_basic_data(conn)
        
        # Validate
        if validate_data(conn):
            print("\n✅ Seeding completed successfully!")
        else:
            print("\n⚠️  Some validation issues found")
        
        conn.close()
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()