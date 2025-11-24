#!/usr/bin/env python3
"""
Daycare Check-in System - Flask Server
A complete client-server architecture for daycare check-in management using Flask and SQLite.
"""

import sqlite3
import json
from datetime import datetime
from flask import Flask, request, jsonify
from contextlib import contextmanager
import os

app = Flask(__name__)

# Database configuration
DATABASE_PATH = 'daycare_checkins.db'

@contextmanager
def get_db_connection():
    """Context manager for database connections with proper error handling."""
    conn = None
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = sqlite3.Row  # Enable dict-like access to rows
        yield conn
    except sqlite3.Error as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            conn.close()

def init_database():
    """Initialize the database and create the checkins table if it doesn't exist."""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS checkins (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    client_name TEXT NOT NULL,
                    check_in_time DATETIME NOT NULL
                )
            ''')
            conn.commit()
            print("Database initialized successfully")
    except sqlite3.Error as e:
        print(f"Database initialization error: {e}")
        raise

@app.route('/checkin', methods=['POST'])
def create_checkin():
    """
    POST /checkin endpoint
    Accepts JSON payload with 'client_name' and creates a new check-in record.
    """
    try:
        # Validate request content type
        if not request.is_json:
            return jsonify({
                'error': 'Content-Type must be application/json'
            }), 400
        
        # Get and validate input data
        data = request.get_json()
        if not data or 'client_name' not in data:
            return jsonify({
                'error': 'Missing required field: client_name'
            }), 400
        
        client_name = data['client_name'].strip()
        if not client_name:
            return jsonify({
                'error': 'client_name cannot be empty'
            }), 400
        
        # Insert new check-in record
        current_time = datetime.now().isoformat()
        
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                'INSERT INTO checkins (client_name, check_in_time) VALUES (?, ?)',
                (client_name, current_time)
            )
            conn.commit()
            checkin_id = cursor.lastrowid
        
        # Return success response
        return jsonify({
            'success': True,
            'message': f'Check-in successful for {client_name}',
            'checkin_id': checkin_id,
            'client_name': client_name,
            'check_in_time': current_time
        }), 201
        
    except sqlite3.Error as e:
        return jsonify({
            'error': f'Database error: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'error': f'Server error: {str(e)}'
        }), 500

@app.route('/checkins', methods=['GET'])
def get_all_checkins():
    """
    GET /checkins endpoint
    Retrieves and returns all check-in records from the database.
    """
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                'SELECT id, client_name, check_in_time FROM checkins ORDER BY check_in_time DESC'
            )
            rows = cursor.fetchall()
        
        # Convert rows to list of dictionaries
        checkins = []
        for row in rows:
            checkins.append({
                'id': row['id'],
                'client_name': row['client_name'],
                'check_in_time': row['check_in_time']
            })
        
        return jsonify({
            'success': True,
            'count': len(checkins),
            'checkins': checkins
        }), 200
        
    except sqlite3.Error as e:
        return jsonify({
            'error': f'Database error: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'error': f'Server error: {str(e)}'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for monitoring server status."""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'database': 'connected' if os.path.exists(DATABASE_PATH) else 'not_found'
    }), 200

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors with JSON response."""
    return jsonify({
        'error': 'Endpoint not found',
        'available_endpoints': ['/checkin (POST)', '/checkins (GET)', '/health (GET)']
    }), 404

@app.errorhandler(405)
def method_not_allowed(error):
    """Handle method not allowed errors."""
    return jsonify({
        'error': 'Method not allowed for this endpoint'
    }), 405

if __name__ == '__main__':
    try:
        # Initialize database on startup
        init_database()
        
        # Start Flask server
        print("Starting Daycare Check-in Server on port 5001...")
        print("Available endpoints:")
        print("  POST /checkin - Create new check-in record")
        print("  GET /checkins - Retrieve all check-in records")
        print("  GET /health - Server health check")
        
        app.run(host='0.0.0.0', port=5001, debug=True)
        
    except Exception as e:
        print(f"Failed to start server: {e}")
        exit(1)