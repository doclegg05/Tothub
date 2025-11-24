# TotHub Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration
- [ ] Copy `.env.example` to `.env` and configure all variables
- [ ] Set strong JWT_SECRET (minimum 32 characters)
- [ ] Configure production database URL
- [ ] Set up email credentials for notifications
- [ ] Configure Redis for production caching (recommended)

### 2. Database Setup
```bash
# Push database schema
npm run db:push

# Verify database connection
# Check that all tables are created properly
```

### 3. Security Configuration
- [ ] Update all password hashes in environment variables
- [ ] Ensure HTTPS is enabled in production
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting (already implemented)
- [ ] Review security headers (Helmet.js configured)

### 4. Build and Deploy
```bash
# Build the application
npm run build

# Start production server
npm start
```

### 5. Post-Deployment Verification
- [ ] Test authentication system
- [ ] Verify database connectivity
- [ ] Test hardware setup wizard
- [ ] Check all API endpoints respond correctly
- [ ] Verify email notifications work
- [ ] Test compliance reporting features

## Production Environment Variables

### Critical Security Variables
```env
JWT_SECRET=your-256-bit-secret-key
DIRECTOR_PASSWORD_HASH=$2b$10$hashed.password.here
TEACHER_PASSWORD_HASH=$2b$10$hashed.password.here
STAFF_PASSWORD_HASH=$2b$10$hashed.password.here
```

### Database Configuration
```env
DATABASE_URL=postgresql://user:pass@host:5432/database
```

### Optional Services
```env
REDIS_URL=redis://localhost:6379
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-app-password
SENTRY_DSN=your-sentry-dsn
```

## Health Checks

The application includes built-in health checks at:
- `/health` - Basic health status
- `/health/detailed` - Detailed system status

## Monitoring

- Error tracking via Sentry (if configured)
- Performance monitoring built-in
- Real-time alerts for system issues
- Comprehensive audit logging

## Backup Strategy

1. **Database Backups**: Set up automated PostgreSQL backups
2. **File Storage**: Backup uploaded files and documents
3. **Configuration**: Keep environment variables secure and backed up

## Scaling Considerations

- **Database**: PostgreSQL with connection pooling
- **Caching**: Redis for session storage and caching
- **File Storage**: Consider cloud storage for uploaded files
- **Load Balancing**: Application is stateless and ready for horizontal scaling

## Security Best Practices

1. **Authentication**: JWT tokens with 8-hour expiration
2. **Password Hashing**: bcrypt with salt rounds
3. **Rate Limiting**: Configured for all routes
4. **Input Validation**: Zod schemas for all inputs
5. **SQL Injection Protection**: Parameterized queries via Drizzle ORM
6. **XSS Protection**: Proper input sanitization
7. **CSRF Protection**: Implemented via security middleware

## Support

For deployment issues:
1. Check application logs
2. Verify environment variables
3. Test database connectivity
4. Review security configuration
5. Contact support if needed