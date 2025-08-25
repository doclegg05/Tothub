#!/usr/bin/env python3
"""
Database Backup Script
Creates a backup of the current database schema and data
"""

import os
import subprocess
import datetime
from pathlib import Path

def backup_database():
    """Create a backup of the database using pg_dump"""
    # Get database URL from environment
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        print("Error: DATABASE_URL not found in environment")
        return False
    
    # Create backup directory if it doesn't exist
    backup_dir = Path("infrastructure/db/backups")
    backup_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate backup filename with timestamp
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = backup_dir / f"tothub_backup_{timestamp}.sql"
    
    try:
        # Run pg_dump to create backup
        print(f"Creating backup: {backup_file}")
        
        # Using shell command as subprocess with pg_dump can be tricky with URLs
        cmd = f"pg_dump '{db_url}' > {backup_file}"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✓ Backup created successfully: {backup_file}")
            
            # Also create a latest symlink
            latest_link = backup_dir / "latest.sql"
            if latest_link.exists():
                latest_link.unlink()
            latest_link.symlink_to(backup_file.name)
            
            return True
        else:
            print(f"✗ Backup failed: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"✗ Error during backup: {e}")
        return False

def verify_backup(backup_file):
    """Verify the backup file was created and has content"""
    if not backup_file.exists():
        print("✗ Backup file does not exist")
        return False
    
    size = backup_file.stat().st_size
    if size == 0:
        print("✗ Backup file is empty")
        return False
    
    print(f"✓ Backup file size: {size:,} bytes")
    
    # Check first few lines
    with open(backup_file, 'r') as f:
        lines = f.readlines()[:5]
        if any('PostgreSQL' in line for line in lines):
            print("✓ Backup appears to be valid PostgreSQL dump")
            return True
    
    return False

if __name__ == "__main__":
    print("=== TotHub Database Backup ===")
    print(f"Timestamp: {datetime.datetime.now()}")
    
    if backup_database():
        # Verify the latest backup
        latest = Path("infrastructure/db/backups/latest.sql")
        if latest.exists():
            verify_backup(latest.resolve())
    else:
        print("\n⚠️  Backup failed. Please check the error messages above.")
        exit(1)