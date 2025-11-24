#!/usr/bin/env python3
"""
Test script to validate seeded data and foreign key relationships
"""

import os
import psycopg2
from datetime import datetime

DATABASE_URL = os.environ.get('DATABASE_URL')

def run_tests(conn):
    """Run comprehensive tests on seeded data"""
    cur = conn.cursor()
    
    print("=== Database Seed Data Validation Tests ===")
    print(f"Timestamp: {datetime.now()}\n")
    
    tests_passed = 0
    tests_failed = 0
    
    # Test 1: Check row counts
    print("1. ROW COUNT TESTS")
    expected_counts = {
        'settings': 4,
        'staff': 5,
        'parents': 6,
        'children': 8,
        'attendance': ('>=', 20),  # At least 20
        'billing': ('>=', 10)      # At least 10
    }
    
    for table, expected in expected_counts.items():
        cur.execute(f"SELECT COUNT(*) FROM {table}")
        actual = cur.fetchone()[0]
        
        if isinstance(expected, tuple):
            op, value = expected
            if op == '>=' and actual >= value:
                print(f"  ✓ {table}: {actual} records (expected {op} {value})")
                tests_passed += 1
            else:
                print(f"  ✗ {table}: {actual} records (expected {op} {value})")
                tests_failed += 1
        else:
            if actual == expected:
                print(f"  ✓ {table}: {actual} records")
                tests_passed += 1
            else:
                print(f"  ✗ {table}: {actual} records (expected {expected})")
                tests_failed += 1
    
    # Test 2: Foreign Key Integrity
    print("\n2. FOREIGN KEY INTEGRITY TESTS")
    
    # Children -> Parents
    cur.execute("""
        SELECT COUNT(*) FROM children c
        LEFT JOIN parents p ON c.parent_id = p.id
        WHERE c.parent_id IS NOT NULL AND p.id IS NULL
    """)
    orphan_children = cur.fetchone()[0]
    
    if orphan_children == 0:
        print("  ✓ All children have valid parent references")
        tests_passed += 1
    else:
        print(f"  ✗ {orphan_children} children have invalid parent references")
        tests_failed += 1
    
    # Attendance -> Children
    cur.execute("""
        SELECT COUNT(*) FROM attendance a
        LEFT JOIN children c ON a.child_id = c.id
        WHERE c.id IS NULL
    """)
    orphan_attendance = cur.fetchone()[0]
    
    if orphan_attendance == 0:
        print("  ✓ All attendance records have valid child references")
        tests_passed += 1
    else:
        print(f"  ✗ {orphan_attendance} attendance records have invalid child references")
        tests_failed += 1
    
    # Attendance -> Staff (checked_in_by)
    cur.execute("""
        SELECT COUNT(*) FROM attendance a
        LEFT JOIN staff s ON a.checked_in_by = s.id
        WHERE a.checked_in_by IS NOT NULL AND s.id IS NULL
    """)
    invalid_checkin_staff = cur.fetchone()[0]
    
    if invalid_checkin_staff == 0:
        print("  ✓ All check-ins have valid staff references")
        tests_passed += 1
    else:
        print(f"  ✗ {invalid_checkin_staff} check-ins have invalid staff references")
        tests_failed += 1
    
    # Billing -> Children
    cur.execute("""
        SELECT COUNT(*) FROM billing b
        LEFT JOIN children c ON b.child_id = c.id
        WHERE c.id IS NULL
    """)
    orphan_billing = cur.fetchone()[0]
    
    if orphan_billing == 0:
        print("  ✓ All billing records have valid child references")
        tests_passed += 1
    else:
        print(f"  ✗ {orphan_billing} billing records have invalid child references")
        tests_failed += 1
    
    # Test 3: Data Quality
    print("\n3. DATA QUALITY TESTS")
    
    # Active status
    cur.execute("SELECT COUNT(*) FROM staff WHERE is_active = true")
    active_staff = cur.fetchone()[0]
    
    if active_staff == 5:
        print("  ✓ All staff members are active")
        tests_passed += 1
    else:
        print(f"  ✗ Only {active_staff} staff members are active")
        tests_failed += 1
    
    # PIN hashes
    cur.execute("SELECT COUNT(*) FROM staff WHERE pin_hash IS NOT NULL AND LENGTH(pin_hash) > 20")
    hashed_pins = cur.fetchone()[0]
    
    if hashed_pins == 5:
        print("  ✓ All staff PINs are properly hashed")
        tests_passed += 1
    else:
        print(f"  ✗ Only {hashed_pins} staff PINs are properly hashed")
        tests_failed += 1
    
    # Mood ratings
    cur.execute("SELECT COUNT(*) FROM attendance WHERE mood_rating NOT BETWEEN 1 AND 5")
    invalid_moods = cur.fetchone()[0]
    
    if invalid_moods == 0:
        print("  ✓ All mood ratings are valid (1-5)")
        tests_passed += 1
    else:
        print(f"  ✗ {invalid_moods} attendance records have invalid mood ratings")
        tests_failed += 1
    
    # Test 4: Business Logic
    print("\n4. BUSINESS LOGIC TESTS")
    
    # Check-out times after check-in
    cur.execute("""
        SELECT COUNT(*) FROM attendance 
        WHERE check_out_time IS NOT NULL 
        AND check_out_time <= check_in_time
    """)
    invalid_times = cur.fetchone()[0]
    
    if invalid_times == 0:
        print("  ✓ All check-out times are after check-in times")
        tests_passed += 1
    else:
        print(f"  ✗ {invalid_times} records have check-out before check-in")
        tests_failed += 1
    
    # Billing amounts
    cur.execute("SELECT COUNT(*) FROM billing WHERE amount_due <= 0")
    invalid_amounts = cur.fetchone()[0]
    
    if invalid_amounts == 0:
        print("  ✓ All billing amounts are positive")
        tests_passed += 1
    else:
        print(f"  ✗ {invalid_amounts} billing records have non-positive amounts")
        tests_failed += 1
    
    # Summary
    print(f"\n=== TEST SUMMARY ===")
    print(f"Total tests: {tests_passed + tests_failed}")
    print(f"Passed: {tests_passed}")
    print(f"Failed: {tests_failed}")
    
    if tests_failed == 0:
        print("\n✅ All tests passed! Database is properly seeded.")
    else:
        print(f"\n⚠️  {tests_failed} tests failed. Please review the issues above.")
    
    return tests_failed == 0

def main():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        success = run_tests(conn)
        conn.close()
        
        if not success:
            exit(1)
            
    except Exception as e:
        print(f"\n❌ Error running tests: {e}")
        import traceback
        traceback.print_exc()
        exit(1)

if __name__ == "__main__":
    main()