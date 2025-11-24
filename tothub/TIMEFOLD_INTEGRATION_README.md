# TotHub Timefold Employee Scheduling Integration

This document describes the integration of Apache Timefold's Employee Scheduling solver with TotHub's daycare management system.

## Overview

The integration replaces TotHub's current staff scheduling system with a sophisticated constraint-based optimization engine that:

- **Optimizes staff assignments** based on multiple constraints and preferences
- **Ensures compliance** with child-to-staff ratios and regulatory requirements
- **Balances workload** across staff members
- **Respects availability** and skill requirements
- **Minimizes conflicts** and scheduling violations

## Architecture

```
┌─────────────────┐    HTTP/REST    ┌─────────────────────┐
│   TotHub Node  │ ◄──────────────► │  Timefold Service  │
│     Server     │                  │   (Java/Spring)     │
└─────────────────┘                  └─────────────────────┘
         │                                    │
         │                                    │
         ▼                                    ▼
┌─────────────────┐                  ┌─────────────────────┐
│  React Client  │                  │  Timefold Solver    │
│   (Schedule    │                  │  (Constraint-based  │
│    Admin)      │                  │   Optimization)      │
└─────────────────┘                  └─────────────────────┘
```

## Components

### 1. Timefold Service (Java/Spring Boot)

**Location**: `tothub/timefold-service/`

**Key Files**:
- `TimefoldSchedulingApplication.java` - Main Spring Boot application
- `domain/` - Planning entities (Employee, Shift, Schedule)
- `constraints/SchedulingConstraintProvider.java` - Business rules
- `service/SchedulingService.java` - Solver orchestration
- `controller/SchedulingController.java` - REST API endpoints

**Features**:
- Hard constraints: Required staff per shift, availability, skills
- Soft constraints: Preferred schedules, balanced workload, overtime minimization
- Configurable solver parameters (timeout, threads, termination criteria)

### 2. TotHub Integration (Node.js/TypeScript)

**Location**: `tothub/server/services/`

**Key Files**:
- `timefoldClient.ts` - HTTP client for Timefold service
- `timefoldAdapter.ts` - Data model conversion
- `scheduleRoutes.ts` - New API endpoints

**API Endpoints**:
- `POST /api/schedule/generate` - Generate optimal schedule
- `POST /api/schedule/preview` - Preview without saving
- `POST /api/schedule/accept` - Accept and save schedule
- `GET /api/schedule/status` - Check service health

### 3. React Admin Interface

**Location**: `tothub/client/src/pages/ScheduleAdmin.tsx`

**Features**:
- Schedule generation with date selection
- Real-time service status monitoring
- Schedule preview with optimization metrics
- Accept/reject workflow for generated schedules

## Setup Instructions

### Prerequisites

- Java 17 or higher
- Maven 3.6+
- Node.js 18+ (for TotHub)
- TotHub database with staff and room data

### 1. Start Timefold Service

```bash
cd tothub/timefold-service

# Build the project
mvn clean compile

# Run the service
mvn spring-boot:run
```

The service will start on `http://localhost:8080`

### 2. Configure TotHub

Add environment variables to `.env`:

```bash
# Timefold service configuration
TIMEFOLD_SERVICE_URL=http://localhost:8080
TIMEFOLD_TIMEOUT=30000
```

### 3. Test the Integration

```bash
# Check Timefold service health
curl http://localhost:8080/api/health

# Test with sample data
curl -X POST http://localhost:8080/api/solve \
  -H "Content-Type: application/json" \
  -d @src/test/resources/sample-data.json
```

## Data Flow

### 1. Schedule Generation Request

```
React Client → TotHub API → TimefoldAdapter → Timefold Service
```

### 2. Data Conversion

**TotHub → Timefold**:
- Staff members → Employees with skills and availability
- Rooms and child counts → Shifts with requirements
- Business rules → Constraints

**Timefold → TotHub**:
- Assignments → Schedule entries
- Optimization metrics → Quality indicators

### 3. Constraint Processing

**Hard Constraints** (Must be satisfied):
- Required staff per room based on child count
- Staff availability and skills
- Lead teacher requirement per room
- Maximum hours per week
- Minimum rest between shifts

**Soft Constraints** (Optimized):
- Preferred availability times
- Balanced workload distribution
- Overtime minimization
- Skill utilization

## Configuration

### Timefold Solver Settings

**File**: `solverConfig.xml`

```xml
<termination>
    <spentLimit>30s</spentLimit>
    <unimprovedSpentLimit>10s</unimprovedSpentLimit>
</termination>

<moveThreadCount>4</moveThreadCount>
```

**Environment Variables**:
- `TIMEFOLD_SOLVER_TIMEOUT`: Solver timeout (default: 30s)
- `TIMEFOLD_SOLVER_THREADS`: Number of solver threads (default: 4)
- `SERVER_PORT`: Service port (default: 8080)

### TotHub Integration Settings

**File**: `server/services/timefoldClient.ts`

```typescript
export const timefoldClient = new TimefoldClient(
  process.env.TIMEFOLD_SERVICE_URL || 'http://localhost:8080',
  parseInt(process.env.TIMEFOLD_TIMEOUT || '30000')
);
```

## Testing

### Unit Tests

```bash
# Timefold service tests
cd tothub/timefold-service
mvn test

# TotHub integration tests
cd tothub
npm test
```

### Integration Tests

```bash
# Test complete workflow
curl -X POST http://localhost:3000/api/schedule/preview \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"weekStart": "2025-01-20"}'
```

### Sample Data

The integration includes sample data for testing:

**File**: `timefold-service/src/test/resources/sample-data.json`

- 3 staff members with different skills and availability
- 5 shifts across 2 days
- Realistic constraints and requirements

## Monitoring and Debugging

### Service Health

- **Endpoint**: `GET /api/schedule/status`
- **Checks**: Timefold service availability, solver status
- **UI**: Real-time status badge in admin interface

### Logging

**Timefold Service**:
```bash
# Application logs
tail -f logs/application.log

# Solver logs
tail -f logs/timefold-solver.log
```

**TotHub Integration**:
```bash
# API request logs
tail -f logs/api.log

# Timefold client logs
tail -f logs/timefold-client.log
```

### Performance Metrics

- **Solving Time**: Total optimization duration
- **Solution Quality**: Hard/soft constraint scores
- **Assignment Count**: Number of successful assignments
- **Conflict Resolution**: Constraint violations resolved

## Troubleshooting

### Common Issues

1. **Timefold Service Unavailable**
   - Check Java version (requires 17+)
   - Verify port 8080 is not in use
   - Check Maven dependencies

2. **Schedule Generation Fails**
   - Verify staff data exists in database
   - Check room assignments and child counts
   - Review constraint configuration

3. **Poor Solution Quality**
   - Increase solver timeout
   - Adjust constraint weights
   - Review business rule definitions

### Debug Mode

Enable debug logging in `application.properties`:

```properties
logging.level.com.tothub.timefold=DEBUG
logging.level.ai.timefold.solver=DEBUG
```

## Production Deployment

### Docker Deployment

```bash
# Build Timefold service
cd timefold-service
docker build -t tothub-timefold .

# Run with environment variables
docker run -d \
  -p 8080:8080 \
  -e TIMEFOLD_SOLVER_TIMEOUT=60 \
  -e TIMEFOLD_SOLVER_THREADS=8 \
  tothub-timefold
```

### Load Balancing

For high-traffic scenarios:
- Deploy multiple Timefold service instances
- Use load balancer for `/api/schedule/*` endpoints
- Implement circuit breaker pattern

### Monitoring

- **Health Checks**: Regular service availability monitoring
- **Performance Metrics**: Solving time and success rate tracking
- **Error Alerting**: Failed schedule generation notifications

## Future Enhancements

### Planned Features

1. **Advanced Constraints**
   - Staff preferences and rotation patterns
   - Training and certification requirements
   - Cost optimization

2. **Real-time Updates**
   - Live schedule adjustments
   - Conflict resolution suggestions
   - Mobile notifications

3. **Analytics Dashboard**
   - Schedule quality metrics
   - Staff utilization analysis
   - Constraint violation reports

### Integration Opportunities

- **HR Systems**: Import staff availability and preferences
- **Payroll Systems**: Export hours for processing
- **Communication Tools**: Notify staff of schedule changes

## Support and Maintenance

### Documentation

- **API Reference**: OpenAPI specification in `/docs/openapi.yaml`
- **Constraint Language**: Timefold constraint documentation
- **Configuration Guide**: Solver parameter tuning

### Community

- **Timefold**: [https://timefold.ai/](https://timefold.ai/)
- **TotHub**: Internal development team
- **Issues**: GitHub repository issues and discussions

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Maintainer**: TotHub Development Team
