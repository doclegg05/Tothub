#!/usr/bin/env python3
"""
Seed sample data for TotHub database
Creates realistic test data for development and testing
"""

import os
import psycopg2
from datetime import datetime, timedelta, date
import random
import bcrypt
from faker import Faker

fake = Faker()

def get_connection():
    """Get database connection"""
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        raise Exception("DATABASE_URL not found")
    return psycopg2.connect(db_url)

def seed_user_profiles(conn):
    """Seed user profiles with sample data"""
    cur = conn.cursor()
    
    profiles = [
        {
            'user_id': 'dir-001',
            'username': 'director',
            'email': 'director@tothub.com',
            'role': 'director',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'phone_number': '555-0101',
            'job_title': 'Center Director',
            'department': 'Administration',
            'employee_id': 'EMP001'
        },
        {
            'user_id': 'teach-001',
            'username': 'teacher',
            'email': 'teacher@tothub.com',
            'role': 'teacher',
            'first_name': 'Emily',
            'last_name': 'Williams',
            'phone_number': '555-0102',
            'job_title': 'Lead Teacher',
            'department': 'Education',
            'employee_id': 'EMP002'
        },
        {
            'user_id': 'staff-001',
            'username': 'staff',
            'email': 'staff@tothub.com',
            'role': 'staff',
            'first_name': 'Michael',
            'last_name': 'Brown',
            'phone_number': '555-0103',
            'job_title': 'Assistant Teacher',
            'department': 'Education',
            'employee_id': 'EMP003'
        },
        {
            'user_id': 'parent-001',
            'username': 'jsmith',
            'email': 'jsmith@email.com',
            'role': 'parent',
            'first_name': 'John',
            'last_name': 'Smith',
            'phone_number': '555-0201',
            'children_ids': []
        },
        {
            'user_id': 'parent-002',
            'username': 'mjones',
            'email': 'mjones@email.com',
            'role': 'parent',
            'first_name': 'Mary',
            'last_name': 'Jones',
            'phone_number': '555-0202',
            'children_ids': []
        }
    ]
    
    for profile in profiles:
        try:
            # Remove children_ids from the query since it doesn't exist in user_profiles
            profile_data = profile.copy()
            if 'children_ids' in profile_data:
                del profile_data['children_ids']
            
            cur.execute("""
                INSERT INTO user_profiles (
                    user_id, username, email, role, first_name, last_name,
                    phone_number, job_title, department, employee_id,
                    bio, preferred_language, is_active
                ) VALUES (
                    %(user_id)s, %(username)s, %(email)s, %(role)s, %(first_name)s, %(last_name)s,
                    %(phone_number)s, %(job_title)s, %(department)s, %(employee_id)s,
                    %(bio)s, %(preferred_language)s, %(is_active)s
                )
                ON CONFLICT (user_id) DO NOTHING
            """, {
                **profile_data,
                'bio': f"{profile['first_name']} is a dedicated {profile.get('job_title', 'parent')} at TotHub.",
                'preferred_language': 'en',
                'is_active': True
            })
        except Exception as e:
            print(f"Error inserting profile {profile['username']}: {e}")
    
    conn.commit()
    print(f"✓ Seeded {len(profiles)} user profiles")

def seed_room_schedules(conn):
    """Seed room schedules"""
    cur = conn.cursor()
    
    # Skip if table structure doesn't match expected columns
    cur.execute("""
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'room_schedules'
    """)
    columns = [row[0] for row in cur.fetchall()]
    
    if 'room_name' not in columns:
        print("⚠️  Skipping room_schedules - table structure doesn't match expected columns")
        return
    
    rooms = ['Infant Room', 'Toddler Room', 'Preschool Room']
    
    for i in range(7):  # Next 7 days
        date = datetime.now().date() + timedelta(days=i)
        for room in rooms:
            cur.execute("""
                INSERT INTO room_schedules (
                    room_name, date, capacity, assigned_staff, enrolled_children,
                    activities, meal_times
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s
                )
            """, (
                room,
                date,
                15 if room == 'Infant Room' else 20,
                2 if room == 'Infant Room' else 3,
                random.randint(8, 12),
                ['Circle Time', 'Art & Crafts', 'Outdoor Play', 'Story Time'],
                '{"breakfast": "8:00 AM", "lunch": "12:00 PM", "snack": "3:00 PM"}'
            ))
    
    conn.commit()
    print("✓ Seeded room schedules")

def seed_schedule_templates(conn):
    """Seed schedule templates"""
    cur = conn.cursor()
    
    templates = [
        {
            'name': 'Teacher Morning Shift',
            'type': 'staff',
            'start': '07:00:00',
            'end': '15:00:00',
            'days': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        },
        {
            'name': 'Teacher Afternoon Shift',
            'type': 'staff',
            'start': '10:00:00',
            'end': '18:00:00',
            'days': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        },
        {
            'name': 'Standard Child Schedule',
            'type': 'child',
            'start': '08:00:00',
            'end': '17:00:00',
            'days': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        }
    ]
    
    for template in templates:
        cur.execute("""
            INSERT INTO schedule_templates (
                template_name, template_type, start_time, end_time,
                days_of_week, is_active
            ) VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            template['name'],
            template['type'],
            template['start'],
            template['end'],
            template['days'],
            True
        ))
    
    conn.commit()
    print("✓ Seeded schedule templates")

def seed_media_shares(conn):
    """Seed media shares with sample data"""
    cur = conn.cursor()
    
    # Get some child IDs
    cur.execute("SELECT id FROM children LIMIT 5")
    child_ids = [row[0] for row in cur.fetchall()]
    
    if child_ids:
        for i in range(10):
            cur.execute("""
                INSERT INTO media_shares (
                    child_id, media_type, media_url, caption,
                    shared_with_parents, uploaded_by, tags
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                random.choice(child_ids),
                random.choice(['photo', 'video']),
                f"/media/sample_{i}.jpg",
                fake.sentence(nb_words=6),
                True,
                random.choice(['teacher', 'staff']),
                random.sample(['activity', 'milestone', 'art', 'outdoor', 'learning'], k=2)
            ))
        
        conn.commit()
        print("✓ Seeded media shares")

def seed_messages(conn):
    """Seed messages between parents and staff"""
    cur = conn.cursor()
    
    # Get parent and staff IDs
    cur.execute("SELECT id FROM parents LIMIT 3")
    parent_ids = [row[0] for row in cur.fetchall()]
    
    cur.execute("SELECT id FROM staff LIMIT 3")
    staff_ids = [row[0] for row in cur.fetchall()]
    
    if parent_ids and staff_ids:
        messages = [
            {
                'subject': 'Welcome to TotHub!',
                'content': 'Welcome to our daycare center. Please feel free to reach out with any questions.',
                'priority': 'normal'
            },
            {
                'subject': 'Daily Report - Great Day!',
                'content': 'Your child had a wonderful day today. They participated in all activities and enjoyed lunch.',
                'priority': 'normal'
            },
            {
                'subject': 'Upcoming Field Trip',
                'content': 'We have a field trip planned for next week to the Children\'s Museum. Permission slip attached.',
                'priority': 'high'
            }
        ]
        
        for msg in messages:
            cur.execute("""
                INSERT INTO messages (
                    parent_id, staff_id, subject, content,
                    is_read, priority
                ) VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                random.choice(parent_ids),
                random.choice(staff_ids),
                msg['subject'],
                msg['content'],
                random.choice([True, False]),
                msg['priority']
            ))
        
        conn.commit()
        print("✓ Seeded messages")

def seed_billing(conn):
    """Seed billing records"""
    cur = conn.cursor()
    
    # Get child IDs
    cur.execute("SELECT id FROM children LIMIT 5")
    child_ids = [row[0] for row in cur.fetchall()]
    
    if child_ids:
        for child_id in child_ids:
            # Current month billing
            period_start = date.today().replace(day=1)
            period_end = (period_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            
            cur.execute("""
                INSERT INTO billing (
                    child_id, period_start, period_end,
                    attendance_days, tuition_amount, extra_fees,
                    total_amount, status, due_date
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                child_id,
                period_start,
                period_end,
                20,  # attendance days
                150000,  # $1500 in cents
                5000,    # $50 extra fees
                155000,  # total
                random.choice(['paid', 'pending', 'overdue']),
                period_end + timedelta(days=5)
            ))
        
        conn.commit()
        print("✓ Seeded billing records")

def hash_security_credentials(conn):
    """Update security credentials with hashed values"""
    cur = conn.cursor()
    
    # Get existing credentials
    cur.execute("SELECT id, credential_value FROM security_credentials WHERE credential_type = 'pin'")
    credentials = cur.fetchall()
    
    for cred_id, value in credentials:
        # Only hash if it looks like plain text (4-6 digits)
        if value and len(value) <= 6 and value.isdigit():
            hashed = bcrypt.hashpw(value.encode('utf-8'), bcrypt.gensalt())
            cur.execute("""
                UPDATE security_credentials 
                SET credential_value = %s, modified_by = 'seed_script'
                WHERE id = %s
            """, (hashed.decode('utf-8'), cred_id))
    
    conn.commit()
    print("✓ Hashed security credentials")

def main():
    """Run all seeding functions"""
    print("=== TotHub Database Seeding ===")
    print(f"Timestamp: {datetime.now()}")
    
    try:
        conn = get_connection()
        
        # Run seeding functions
        seed_user_profiles(conn)
        seed_room_schedules(conn)
        seed_schedule_templates(conn)
        seed_media_shares(conn)
        seed_messages(conn)
        seed_billing(conn)
        hash_security_credentials(conn)
        
        print("\n✅ Seeding completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        raise
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    main()