#!/usr/bin/env python3
"""
Complete Daycare Check-in System Runner
This script demonstrates the complete client-server architecture.
"""

import subprocess
import time
import threading
import signal
import sys
from daycare_client import perform_checkin, get_all_checkins, display_checkins, check_server_health

def run_server():
    """Run the Flask server in a separate process."""
    try:
        print("Starting Flask server...")
        process = subprocess.Popen([sys.executable, 'flask_server.py'])
        return process
    except Exception as e:
        print(f"Failed to start server: {e}")
        return None

def test_system():
    """Test the complete system with sample data."""
    server_url = "http://localhost:5001"
    
    # Wait for server to start
    print("Waiting for server to start...")
    time.sleep(3)
    
    # Check server health
    if not check_server_health(server_url):
        print("Server failed to start properly")
        return
    
    print("\n=== Testing Daycare Check-in System ===\n")
    
    # Sample daycare clients with typical names
    daycare_clients = [
        "Emma Johnson (Age 2)",
        "Liam Smith (Age 4)", 
        "Olivia Brown (Age 3)",
        "Noah Davis (Age 5)",
        "Ava Wilson (Age 1)",
        "Teacher Sarah",
        "Teacher Michael",
        "Director Jessica"
    ]
    
    # Perform check-ins
    print("1. Processing check-ins for daycare clients...")
    for client in daycare_clients:
        perform_checkin(server_url, client)
        time.sleep(0.5)  # Small delay between requests
    
    print("\n2. Retrieving all check-in records...")
    checkins_data = get_all_checkins(server_url)
    
    if checkins_data:
        display_checkins(checkins_data)
        
        # Show summary statistics
        print("=== Summary Statistics ===")
        print(f"Total check-ins today: {checkins_data['count']}")
        
        # Count by type
        children_count = sum(1 for c in checkins_data['checkins'] 
                           if 'Age' in c['client_name'])
        staff_count = sum(1 for c in checkins_data['checkins'] 
                         if 'Teacher' in c['client_name'] or 'Director' in c['client_name'])
        
        print(f"Children checked in: {children_count}")
        print(f"Staff checked in: {staff_count}")
        print("="*60)

def main():
    """Main function to run the complete system."""
    server_process = None
    
    try:
        # Start the server
        server_process = run_server()
        if not server_process:
            return
        
        # Test the system
        test_system()
        
        print("\n=== System Test Complete ===")
        print("The Flask server is still running.")
        print("You can:")
        print("1. Make additional requests using the client functions")
        print("2. Test the API endpoints directly with curl or Postman")
        print("3. Access http://localhost:5000/health for server status")
        print("\nPress Ctrl+C to stop the server")
        
        # Keep the main thread alive
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        if server_process:
            server_process.terminate()
            server_process.wait()
            print("Server stopped.")

if __name__ == '__main__':
    main()