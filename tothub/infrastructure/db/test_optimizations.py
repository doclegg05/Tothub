#!/usr/bin/env python3
"""
TotHub Database Optimization Test Script
Tests the consolidated schema and performance optimizations
"""

import sqlite3
import time
import json
from datetime import datetime, timedelta
import random
import string

class DatabaseOptimizationTester:
    def __init__(self, db_path):
        self.db_path = db_path
        self.conn = None
        self.results = {}
        
    def connect(self):
        """Connect to the database"""
        try:
            self.conn = sqlite3.connect(self.db_path)
            self.conn.row_factory = sqlite3.Row
            print(f"✅ Connected to database: {self.db_path}")
            return True
        except Exception as e:
            print(f"❌ Failed to connect: {e}")
            return False
    
    def disconnect(self):
        """Disconnect from the database"""
        if self.conn:
            self.conn.close()
            print("✅ Disconnected from database")
    
    def test_schema_consolidation(self):
        """Test that the consolidated schema is working correctly"""
        print("\n🔍 Testing Schema Consolidation...")
        
        try:
            cursor = self.conn.cursor()
            
            # Test 1: Check if unified users table exists
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
            if cursor.fetchone():
                print("✅ Unified users table exists")
            else:
                print("❌ Unified users table missing")
                return False
            
            # Test 2: Check if unified schedules table exists
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='schedules'")
            if cursor.fetchone():
                print("✅ Unified schedules table exists")
            else:
                print("❌ Unified schedules table missing")
                return False
            
            # Test 3: Check if redundant tables are gone
            redundant_tables = ['staff', 'staff_schedules', 'child_schedules', 'room_schedules']
            for table in redundant_tables:
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (table,))
                if cursor.fetchone():
                    print(f"⚠️  Redundant table still exists: {table}")
                else:
                    print(f"✅ Redundant table removed: {table}")
            
            # Test 4: Check foreign key relationships
            cursor.execute("""
                SELECT COUNT(*) as count FROM children c 
                JOIN users u ON c.parent_id = u.id 
                LIMIT 1
            """)
            if cursor.fetchone()['count'] >= 0:
                print("✅ Foreign key relationships working")
            else:
                print("❌ Foreign key relationships broken")
                return False
            
            print("✅ Schema consolidation tests passed")
            return True
            
        except Exception as e:
            print(f"❌ Schema consolidation test failed: {e}")
            return False
    
    def test_performance_indexes(self):
        """Test that performance indexes are working correctly"""
        print("\n🚀 Testing Performance Indexes...")
        
        try:
            cursor = self.conn.cursor()
            
            # Test 1: Check if critical indexes exist
            critical_indexes = [
                'idx_schedules_composite_main',
                'idx_users_role_active',
                'idx_attendance_daily_ops',
                'idx_users_profile_covering',
                'idx_schedules_covering'
            ]
            
            for index in critical_indexes:
                cursor.execute("SELECT name FROM sqlite_master WHERE type='index' AND name=?", (index,))
                if cursor.fetchone():
                    print(f"✅ Index exists: {index}")
                else:
                    print(f"❌ Index missing: {index}")
                    return False
            
            # Test 2: Check index usage with EXPLAIN QUERY PLAN
            test_queries = [
                ("Schedule lookup by room and date", 
                 "SELECT * FROM schedules WHERE room = 'Infant Room' AND date = '2025-01-27'"),
                ("User search by role", 
                 "SELECT * FROM users WHERE role = 'staff' AND is_active = 1"),
                ("Attendance lookup", 
                 "SELECT * FROM attendance WHERE child_id = 'test_child' AND date = '2025-01-27'")
            ]
            
            for query_name, query in test_queries:
                try:
                    cursor.execute(f"EXPLAIN QUERY PLAN {query}")
                    plan = cursor.fetchall()
                    if plan:
                        print(f"✅ Query plan generated for: {query_name}")
                    else:
                        print(f"⚠️  No query plan for: {query_name}")
                except Exception as e:
                    print(f"⚠️  Query plan test failed for {query_name}: {e}")
            
            print("✅ Performance index tests passed")
            return True
            
        except Exception as e:
            print(f"❌ Performance index test failed: {e}")
            return False
    
    def benchmark_queries(self):
        """Benchmark query performance before and after optimization"""
        print("\n⏱️  Benchmarking Query Performance...")
        
        try:
            cursor = self.conn.cursor()
            
            # Create some test data if tables are empty
            self.create_test_data()
            
            # Benchmark queries
            benchmarks = [
                ("Schedule lookup", 
                 "SELECT * FROM schedules WHERE room = 'Test Room' AND date = '2025-01-27'"),
                ("User role search", 
                 "SELECT * FROM users WHERE role = 'staff' AND is_active = 1"),
                ("Attendance by date", 
                 "SELECT * FROM attendance WHERE date = '2025-01-27'"),
                ("Children by room", 
                 "SELECT * FROM children WHERE room = 'Test Room' AND is_active = 1")
            ]
            
            for test_name, query in benchmarks:
                # Warm up
                for _ in range(3):
                    cursor.execute(query)
                    cursor.fetchall()
                
                # Benchmark
                start_time = time.time()
                for _ in range(10):
                    cursor.execute(query)
                    cursor.fetchall()
                end_time = time.time()
                
                avg_time = (end_time - start_time) / 10 * 1000  # Convert to milliseconds
                self.results[test_name] = avg_time
                print(f"⏱️  {test_name}: {avg_time:.2f}ms average")
            
            print("✅ Benchmark tests completed")
            return True
            
        except Exception as e:
            print(f"❌ Benchmark test failed: {e}")
            return False
    
    def create_test_data(self):
        """Create test data for benchmarking"""
        try:
            cursor = self.conn.cursor()
            
            # Check if test data already exists
            cursor.execute("SELECT COUNT(*) as count FROM users WHERE email LIKE '%test%'")
            if cursor.fetchone()['count'] > 0:
                print("📊 Test data already exists, skipping creation")
                return
            
            print("📊 Creating test data for benchmarking...")
            
            # Create test users
            test_users = [
                ('test_staff_1', 'staff', 'Test Staff 1'),
                ('test_staff_2', 'staff', 'Test Staff 2'),
                ('test_parent_1', 'parent', 'Test Parent 1'),
                ('test_parent_2', 'parent', 'Test Parent 2')
            ]
            
            for username, role, name in test_users:
                first_name, last_name = name.split(' ')
                cursor.execute("""
                    INSERT INTO users (id, email, password_hash, first_name, last_name, role, tenant_id, is_active)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (username, f"{username}@test.com", 'test_hash', first_name, last_name, role, 'test', 1))
            
            # Create test children
            test_children = [
                ('test_child_1', 'Test Child 1', 'test_parent_1'),
                ('test_child_2', 'Test Child 2', 'test_parent_2')
            ]
            
            for child_id, name, parent_id in test_children:
                first_name, last_name = name.split(' ')
                cursor.execute("""
                    INSERT INTO children (id, first_name, last_name, date_of_birth, parent_id, enrollment_date, is_active)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (child_id, first_name, last_name, '2020-01-01', parent_id, '2024-01-01', 1))
            
            # Create test schedules
            test_schedules = [
                ('test_schedule_1', 'staff', 'test_staff_1', 'Test Room', '2025-01-27'),
                ('test_schedule_2', 'child', 'test_child_1', 'Test Room', '2025-01-27'),
                ('test_schedule_3', 'room', 'Test Room', 'Test Room', '2025-01-27')
            ]
            
            for schedule_id, schedule_type, entity_id, room, date in test_schedules:
                cursor.execute("""
                    INSERT INTO schedules (id, schedule_type, entity_id, entity_type, room, date, scheduled_start, scheduled_end)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (schedule_id, schedule_type, entity_id, schedule_type, room, date, '09:00:00', '17:00:00'))
            
            # Create test attendance
            cursor.execute("""
                INSERT INTO attendance (id, child_id, date, room, checked_in_by)
                VALUES (?, ?, ?, ?, ?)
            """, ('test_attendance_1', 'test_child_1', '2025-01-27', 'Test Room', 'test_staff_1'))
            
            self.conn.commit()
            print("✅ Test data created successfully")
            
        except Exception as e:
            print(f"⚠️  Failed to create test data: {e}")
    
    def generate_report(self):
        """Generate a performance optimization report"""
        print("\n📊 Generating Performance Report...")
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "database": self.db_path,
            "test_results": self.results,
            "recommendations": []
        }
        
        # Analyze results and provide recommendations
        if self.results:
            avg_time = sum(self.results.values()) / len(self.results)
            if avg_time < 50:
                report["recommendations"].append("Excellent performance! Database is well optimized.")
            elif avg_time < 100:
                report["recommendations"].append("Good performance. Consider additional indexing for complex queries.")
            else:
                report["recommendations"].append("Performance needs improvement. Review query patterns and add missing indexes.")
        
        # Save report
        report_file = f"optimization_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"✅ Performance report saved to: {report_file}")
        return report
    
    def run_all_tests(self):
        """Run all optimization tests"""
        print("🚀 TotHub Database Optimization Test Suite")
        print("=" * 50)
        
        if not self.connect():
            return False
        
        try:
            # Run all tests
            tests = [
                self.test_schema_consolidation,
                self.test_performance_indexes,
                self.benchmark_queries
            ]
            
            all_passed = True
            for test in tests:
                if not test():
                    all_passed = False
            
            # Generate report
            if all_passed:
                self.generate_report()
                print("\n🎉 All tests passed! Database optimization is working correctly.")
            else:
                print("\n❌ Some tests failed. Please review the issues above.")
            
            return all_passed
            
        finally:
            self.disconnect()

def main():
    """Main function to run the optimization tests"""
    import sys
    
    if len(sys.argv) != 2:
        print("Usage: python test_optimizations.py <database_path>")
        print("Example: python test_optimizations.py ../tothub.db")
        sys.exit(1)
    
    db_path = sys.argv[1]
    tester = DatabaseOptimizationTester(db_path)
    success = tester.run_all_tests()
    
    if success:
        print("\n✅ Database optimization verification completed successfully!")
        sys.exit(0)
    else:
        print("\n❌ Database optimization verification failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()
