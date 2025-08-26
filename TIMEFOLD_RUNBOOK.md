# TotHub Timefold Integration - Operations Runbook

## Quick Start Commands

### 1. Start Timefold Service

```bash
cd tothub/timefold-service

# Build and run
mvn clean compile
mvn spring-boot:run

# Verify service is running
curl http://localhost:8080/api/health
```

### 2. Test Integration

```bash
# Check TotHub can reach Timefold
curl http://localhost:3000/api/schedule/status \
  -H "Authorization: Bearer <token>"

# Generate test schedule
curl -X POST http://localhost:3000/api/schedule/preview \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"weekStart": "2025-01-20"}'
```

## Health Checks

### Timefold Service Health

**Endpoint**: `GET http://localhost:8080/api/health`

**Expected Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-20T10:00:00Z"
}
```

**If Unhealthy**:
1. Check Java version: `java -version` (must be 17+)
2. Check port availability: `netstat -an | grep 8080`
3. Check logs: `tail -f logs/spring.log`

### TotHub Integration Health

**Endpoint**: `GET http://localhost:3000/api/schedule/status`

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "timefoldHealthy": true,
    "solverStatus": "Solver is ready",
    "lastChecked": "2025-01-20T10:00:00Z"
  }
}
```

## Common Operations

### Generate Schedule

```bash
# For current week
curl -X POST http://localhost:3000/api/schedule/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>"

# For specific week
curl -X POST http://localhost:3000/api/schedule/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"weekStart": "2025-01-27"}'
```

### Preview Schedule

```bash
curl -X POST http://localhost:3000/api/schedule/preview \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"weekStart": "2025-01-20"}'
```

### Accept Schedule

```bash
curl -X POST http://localhost:3000/api/schedule/accept \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"schedules": [...], "weekStart": "2025-01-20"}'
```

## Troubleshooting

### Service Won't Start

**Problem**: Timefold service fails to start

**Solutions**:
1. Check Java version: `java -version`
2. Clear Maven cache: `mvn clean`
3. Check dependencies: `mvn dependency:tree`
4. Verify port: `lsof -i :8080`

### Schedule Generation Fails

**Problem**: API returns 500 error

**Solutions**:
1. Check Timefold service health
2. Verify database connectivity
3. Check staff and room data exists
4. Review application logs

### Poor Performance

**Problem**: Schedule generation takes too long

**Solutions**:
1. Increase solver timeout in `solverConfig.xml`
2. Reduce problem size (fewer staff/shifts)
3. Adjust constraint weights
4. Add more solver threads

## Log Locations

### Timefold Service Logs

```bash
# Application logs
tail -f logs/application.log

# Solver logs
tail -f logs/timefold-solver.log

# Spring Boot logs
tail -f logs/spring.log
```

### TotHub Integration Logs

```bash
# API logs
tail -f logs/api.log

# Timefold client logs
tail -f logs/timefold-client.log
```

## Configuration Changes

### Solver Parameters

**File**: `tothub/timefold-service/src/main/resources/solverConfig.xml`

```xml
<termination>
    <spentLimit>60s</spentLimit>  <!-- Increase timeout -->
    <unimprovedSpentLimit>20s</unimprovedSpentLimit>
</termination>

<moveThreadCount>8</moveThreadCount>  <!-- More threads -->
```

### Service Settings

**File**: `tothub/timefold-service/src/main/resources/application.properties`

```properties
# Increase timeout for large problems
timefold.solver.termination.spent-limit=60s

# More solver threads
timefold.solver.move-thread-count=8

# Debug logging
logging.level.com.tothub.timefold=DEBUG
```

## Monitoring

### Key Metrics

1. **Service Uptime**: `GET /api/health`
2. **Solver Status**: `GET /api/solver-status`
3. **Generation Success Rate**: Monitor API responses
4. **Solving Time**: Track optimization duration

### Alerts

- Timefold service unavailable
- Schedule generation failures > 5%
- Solving time > 60 seconds
- Constraint violation rate > 10%

## Backup and Recovery

### Backup Timefold Configuration

```bash
# Backup solver config
cp tothub/timefold-service/src/main/resources/solverConfig.xml \
   backup/solverConfig_$(date +%Y%m%d).xml

# Backup application properties
cp tothub/timefold-service/src/main/resources/application.properties \
   backup/application_$(date +%Y%m%d).properties
```

### Restore Configuration

```bash
# Restore from backup
cp backup/solverConfig_20250120.xml \
   tothub/timefold-service/src/main/resources/solverConfig.xml

# Restart service
mvn spring-boot:run
```

## Emergency Procedures

### Service Outage

1. **Immediate**: Check health endpoint
2. **5 minutes**: Restart Timefold service
3. **15 minutes**: Check TotHub fallback mode
4. **30 minutes**: Escalate to development team

### Data Corruption

1. **Stop**: Halt both services
2. **Backup**: Create database backup
3. **Restore**: Restore from last known good state
4. **Verify**: Test schedule generation
5. **Resume**: Restart services

### Performance Degradation

1. **Monitor**: Track solving times
2. **Optimize**: Adjust solver parameters
3. **Scale**: Add more solver threads
4. **Fallback**: Enable TotHub legacy scheduler

## Contact Information

- **Development Team**: dev@tothub.com
- **Operations**: ops@tothub.com
- **Emergency**: +1-555-0123 (24/7)
- **Documentation**: [Internal Wiki](https://wiki.tothub.com/timefold)

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Next Review**: February 2025
