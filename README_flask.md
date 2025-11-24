# Daycare Check-in System - Flask Implementation

A complete client-server architecture for daycare check-in management using Flask and SQLite.

## Features

- **Flask Web Server**: RESTful API with proper error handling
- **SQLite Database**: Lightweight, self-contained database storage
- **Client Functions**: Easy-to-use client-side functions for API interaction
- **Complete Error Handling**: Graceful handling of database and network errors
- **Industry Standards**: Follows daycare management best practices

## Database Schema

```sql
CREATE TABLE checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name TEXT NOT NULL,
    check_in_time DATETIME NOT NULL
);
```

## API Endpoints

### POST /checkin
Creates a new check-in record.

**Request:**
```json
{
    "client_name": "Emma Johnson"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Check-in successful for Emma Johnson",
    "checkin_id": 1,
    "client_name": "Emma Johnson",
    "check_in_time": "2025-07-25T14:30:00.123456"
}
```

### GET /checkins
Retrieves all check-in records.

**Response:**
```json
{
    "success": true,
    "count": 2,
    "checkins": [
        {
            "id": 1,
            "client_name": "Emma Johnson",
            "check_in_time": "2025-07-25T14:30:00.123456"
        }
    ]
}
```

### GET /health
Server health check endpoint.

## Installation & Usage

### Option 1: Run Individual Components

1. **Install dependencies:**
```bash
pip install -r requirements_flask.txt
```

2. **Start the server:**
```bash
python flask_server.py
```

3. **Use client functions:**
```python
from daycare_client import perform_checkin, get_all_checkins

# Perform a check-in
perform_checkin("http://localhost:5000", "Emma Johnson")

# Get all check-ins
checkins = get_all_checkins("http://localhost:5000")
```

### Option 2: Run Complete System Demo

```bash
python run_daycare_system.py
```

This will:
- Start the Flask server automatically
- Run a complete test with sample daycare data
- Show summary statistics
- Keep the server running for further testing

## Client Functions

### perform_checkin(server_url, client_name)
Sends a check-in request to the server.

```python
perform_checkin("http://localhost:5000", "Emma Johnson")
```

### get_all_checkins(server_url)
Retrieves all check-in records from the server.

```python
data = get_all_checkins("http://localhost:5000")
```

### check_server_health(server_url)
Checks if the server is running and healthy.

```python
is_healthy = check_server_health("http://localhost:5000")
```

## Testing with curl

```bash
# Check server health
curl http://localhost:5000/health

# Create a check-in
curl -X POST http://localhost:5000/checkin \
  -H "Content-Type: application/json" \
  -d '{"client_name": "Emma Johnson"}'

# Get all check-ins
curl http://localhost:5000/checkins
```

## Daycare Industry Features

The system includes considerations for common daycare management needs:

- **Child and Staff Tracking**: Supports both children and staff check-ins
- **Timestamp Precision**: ISO format timestamps for accurate record keeping
- **Error Handling**: Robust error handling for operational reliability
- **Audit Trail**: Complete record of all check-in activities
- **Scalable Design**: SQLite can handle thousands of daily check-ins

## File Structure

```
├── flask_server.py          # Main Flask server application
├── daycare_client.py        # Client-side functions
├── run_daycare_system.py    # Complete system runner/demo
├── requirements_flask.txt   # Python dependencies
├── README_flask.md         # This documentation
└── daycare_checkins.db     # SQLite database (created automatically)
```

## Error Handling

The system includes comprehensive error handling for:

- Invalid JSON payloads
- Missing required fields
- Database connection errors
- Network connectivity issues
- Server timeouts
- Invalid HTTP methods

## Production Considerations

For production deployment:

1. Use a production WSGI server (e.g., Gunicorn)
2. Configure proper logging
3. Add authentication/authorization
4. Use PostgreSQL or MySQL for larger installations
5. Implement rate limiting
6. Add SSL/TLS encryption
7. Set up monitoring and alerting

## Integration with Existing Systems

This Flask implementation can work alongside your existing Node.js/Express system or replace it entirely. The REST API is compatible with any client that can make HTTP requests.