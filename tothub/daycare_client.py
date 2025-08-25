#!/usr/bin/env python3
"""
Daycare Check-in System - Client Functions
Client-side functions for interacting with the Flask server.
"""

import requests
import json
from datetime import datetime
from typing import Optional, Dict, Any

def perform_checkin(server_url: str, client_name: str) -> None:
    """
    Perform a check-in by sending a POST request to the server.
    
    Args:
        server_url (str): The base URL of the server (e.g., 'http://localhost:5000')
        client_name (str): The name of the client checking in
    """
    try:
        # Prepare the endpoint URL
        checkin_url = f"{server_url.rstrip('/')}/checkin"
        
        # Prepare the JSON payload
        payload = {
            'client_name': client_name
        }
        
        # Send POST request
        print(f"Sending check-in request for: {client_name}")
        response = requests.post(
            checkin_url,
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        # Print the server's response
        print(f"Server Response (Status: {response.status_code}):")
        
        try:
            response_data = response.json()
            print(json.dumps(response_data, indent=2))
        except json.JSONDecodeError:
            print(f"Raw response: {response.text}")
        
        # Check if request was successful
        if response.status_code == 201:
            print("✓ Check-in successful!")
        else:
            print("✗ Check-in failed!")
            
    except requests.exceptions.ConnectionError:
        print(f"✗ Error: Could not connect to server at {server_url}")
        print("Make sure the server is running on the specified URL")
    except requests.exceptions.Timeout:
        print("✗ Error: Request timed out")
    except requests.exceptions.RequestException as e:
        print(f"✗ Error: Request failed - {e}")
    except Exception as e:
        print(f"✗ Unexpected error: {e}")

def get_all_checkins(server_url: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve all check-in records from the server.
    
    Args:
        server_url (str): The base URL of the server
        
    Returns:
        Optional[Dict[str, Any]]: Server response data or None if failed
    """
    try:
        # Prepare the endpoint URL
        checkins_url = f"{server_url.rstrip('/')}/checkins"
        
        # Send GET request
        print("Retrieving all check-in records...")
        response = requests.get(checkins_url, timeout=10)
        
        # Parse and return response
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Retrieved {data.get('count', 0)} check-in records")
            return data
        else:
            print(f"✗ Failed to retrieve records (Status: {response.status_code})")
            print(response.text)
            return None
            
    except requests.exceptions.ConnectionError:
        print(f"✗ Error: Could not connect to server at {server_url}")
        return None
    except requests.exceptions.Timeout:
        print("✗ Error: Request timed out")
        return None
    except requests.exceptions.RequestException as e:
        print(f"✗ Error: Request failed - {e}")
        return None
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        return None

def display_checkins(checkins_data: Dict[str, Any]) -> None:
    """
    Display check-in records in a formatted table.
    
    Args:
        checkins_data (Dict[str, Any]): Response data from get_all_checkins
    """
    if not checkins_data or 'checkins' not in checkins_data:
        print("No check-in data to display")
        return
    
    checkins = checkins_data['checkins']
    
    if not checkins:
        print("No check-in records found")
        return
    
    # Print header
    print("\n" + "="*60)
    print(f"{'ID':<5} {'Client Name':<25} {'Check-in Time':<25}")
    print("="*60)
    
    # Print each record
    for checkin in checkins:
        print(f"{checkin['id']:<5} {checkin['client_name']:<25} {checkin['check_in_time']:<25}")
    
    print("="*60)
    print(f"Total records: {len(checkins)}\n")

def check_server_health(server_url: str) -> bool:
    """
    Check if the server is running and healthy.
    
    Args:
        server_url (str): The base URL of the server
        
    Returns:
        bool: True if server is healthy, False otherwise
    """
    try:
        health_url = f"{server_url.rstrip('/')}/health"
        response = requests.get(health_url, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Server is healthy - Status: {data.get('status')}")
            return True
        else:
            print(f"✗ Server health check failed (Status: {response.status_code})")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"✗ Server not reachable at {server_url}")
        return False
    except Exception as e:
        print(f"✗ Health check error: {e}")
        return False

# Example usage and testing functions
def demo_client_usage():
    """Demonstrate the client functions with example usage."""
    server_url = "http://localhost:5001"
    
    print("=== Daycare Check-in Client Demo ===\n")
    
    # Check server health
    print("1. Checking server health...")
    if not check_server_health(server_url):
        print("Server is not available. Please start the Flask server first.")
        return
    
    # Perform some check-ins
    print("\n2. Performing sample check-ins...")
    test_clients = [
        "Emma Johnson", 
        "Michael Thompson", 
        "Sarah Garcia",
        "Baby Alice",
        "Toddler Bob"
    ]
    
    for client in test_clients:
        perform_checkin(server_url, client)
        print()  # Add spacing
    
    # Retrieve and display all check-ins
    print("3. Retrieving all check-in records...")
    checkins_data = get_all_checkins(server_url)
    if checkins_data:
        display_checkins(checkins_data)

if __name__ == '__main__':
    # Run the demo when script is executed directly
    demo_client_usage()