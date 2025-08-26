# TotHub Timefold Employee Scheduling Service

This is a microservice that integrates Apache Timefold's Employee Scheduling solver with TotHub's daycare management system.

## Overview

The service provides optimal staff scheduling based on:
- Staff availability and preferences
- Required skills and qualifications
- Child-to-staff ratios
- Compliance requirements
- Shift constraints and preferences

## Quick Start

### Prerequisites
- Java 17 or higher
- Maven 3.6+

### Running the Service

1. **Build the project:**
   ```bash
   mvn clean compile
   ```

2. **Run the service:**
   ```bash
   mvn spring-boot:run
   ```

3. **Test with sample data:**
   ```bash
   curl -X POST http://localhost:8080/api/solve \
     -H "Content-Type: application/json" \
     -d @src/test/resources/sample-data.json
   ```

## API Endpoints

- `POST /api/solve` - Generate optimal schedule
- `GET /api/health` - Service health check
- `GET /api/solver-status` - Current solver status

## Configuration

Environment variables:
- `TIMEFOLD_SOLVER_TIMEOUT`: Solver timeout in seconds (default: 30)
- `TIMEFOLD_SOLVER_THREADS`: Number of solver threads (default: 4)
- `SERVER_PORT`: Service port (default: 8080)

## Sample Data Format

```json
{
  "employees": [
    {
      "id": "emp1",
      "name": "John Doe",
      "skills": ["lead-teacher", "cpr-certified"],
      "availability": [
        {
          "dayOfWeek": 1,
          "startTime": "08:00",
          "endTime": "17:00"
        }
      ]
    }
  ],
  "shifts": [
    {
      "id": "shift1",
      "requiredSkills": ["lead-teacher"],
      "startTime": "08:00",
      "endTime": "17:00",
      "date": "2025-01-20"
    }
  ]
}
```

## Integration with TotHub

This service is called by TotHub's Node.js backend via the `/api/schedule:generate` endpoint, which forwards scheduling requests to Timefold and returns optimized schedules.

