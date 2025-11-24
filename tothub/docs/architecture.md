# TotHub Architecture Documentation

## Overview

TotHub is a comprehensive childcare management platform built with modern web technologies, designed to handle the complex needs of daycare centers, preschools, and childcare providers.

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight router)
- **State Management**: TanStack Query (React Query)
- **UI Components**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite for development and production bundling

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL via Neon (serverless)
- **ORM**: Drizzle ORM with Zod validation
- **Authentication**: JWT with 2FA support
- **Session Management**: Express-session with memory store

### Infrastructure
- **Hosting**: Replit (development), AWS (production ready)
- **Database**: Neon PostgreSQL (serverless)
- **File Storage**: Local storage (S3 ready)
- **Email**: SendGrid integration
- **Payments**: Stripe integration
- **Monitoring**: Built-in memory monitoring and auto-restart

## Project Structure

```
tothub/
├── client/                     # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   └── ui/           # shadcn/ui components
│   │   ├── pages/            # Route-based page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities and helpers
│   │   └── styles/           # Global styles and CSS
│   ├── public/               # Static assets
│   └── index.html            # Entry point
├── server/                    # Express.js backend API
│   ├── routes/               # API route definitions
│   ├── services/             # Business logic services
│   ├── middleware/           # Express middleware
│   ├── utils/                # Utility functions
│   └── index.ts              # Server entry point
├── shared/                   # Shared TypeScript types
│   ├── schema.ts             # Drizzle schema definitions
│   ├── types.ts              # Common type definitions
│   └── openapi-types.d.ts    # OpenAPI generated types
├── docs/                     # Documentation
├── infrastructure/           # Deployment and infrastructure
└── tests/                    # Test files
```

## Core Services

### Memory Management
- **Auto-Restart Service**: Monitors memory usage and restarts server when thresholds are exceeded
- **Memory Monitoring**: Real-time memory tracking with trend analysis
- **Memory Leak Detection**: Automated detection of memory leaks with recommendations
- **Cache Optimization**: LRU cache with automatic cleanup and TTL management

### Authentication & Security
- **JWT Authentication**: Secure token-based authentication
- **2FA Support**: Two-factor authentication for enhanced security
- **Role-Based Access Control**: Granular permissions system
- **Session Management**: Secure session handling with express-session

### Database Layer
- **Drizzle ORM**: Type-safe database operations
- **Schema Management**: Automated schema migrations
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Built-in query performance monitoring

## Environment Variables

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication
JWT_SECRET=your-jwt-secret-key
SESSION_SECRET=your-session-secret

# Stripe (Payments)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid (Email)
SENDGRID_API_KEY=SG.your-api-key
FROM_EMAIL=noreply@tothub.com

# Security
NODE_ENV=development|production
CORS_ORIGIN=http://localhost:3000

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

### Optional Environment Variables

```bash
# Redis (for production session storage)
REDIS_URL=redis://localhost:6379

# File Storage
S3_BUCKET=your-s3-bucket
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key

# Analytics
POSTHOG_API_KEY=your-posthog-key
```

## Build Process

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start frontend only (Vite dev server)
npm run dev:frontend

# Start backend only
npm run dev:backend
```

### Production Build
```bash
# Build both frontend and backend
npm run build

# Start production server
npm start

# Type checking
npm run check

# Linting
npm run lint

# Testing
npm run test
```

## Database Schema

### Core Entities

```typescript
// Organizations and Locations
interface Organization {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Location {
  id: string;
  organizationId: string;
  name: string;
  address: string;
  phone: string;
  email: string;
}

// Children and Guardians
interface Child {
  id: string;
  locationId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  enrollmentDate: Date;
  isActive: boolean;
}

interface Guardian {
  id: string;
  locationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  relationship: string;
}

// Staff and Scheduling
interface Staff {
  id: string;
  locationId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: StaffRole;
  isActive: boolean;
}

// Attendance and Billing
interface Attendance {
  id: string;
  childId: string;
  locationId: string;
  checkInTime: Date;
  checkOutTime?: Date;
  classroomId: string;
}

interface Invoice {
  id: string;
  locationId: string;
  childId: string;
  amount: number;
  dueDate: Date;
  status: InvoiceStatus;
}
```

## API Endpoints

### Core Endpoints

```
GET    /api/health              # Health check
GET    /api/status              # System status

# Authentication
POST   /api/auth/login          # User login
POST   /api/auth/logout         # User logout
POST   /api/auth/refresh        # Refresh token
POST   /api/auth/2fa            # 2FA verification

# Children Management
GET    /api/children            # List children
POST   /api/children            # Create child
GET    /api/children/:id        # Get child details
PUT    /api/children/:id        # Update child
DELETE /api/children/:id        # Delete child

# Staff Management
GET    /api/staff               # List staff
POST   /api/staff               # Create staff member
GET    /api/staff/:id           # Get staff details
PUT    /api/staff/:id           # Update staff
DELETE /api/staff/:id           # Delete staff

# Attendance
GET    /api/attendance          # Get attendance records
POST   /api/attendance/checkin  # Check in child
POST   /api/attendance/checkout # Check out child

# Billing
GET    /api/invoices            # List invoices
POST   /api/invoices            # Create invoice
GET    /api/invoices/:id        # Get invoice details
POST   /api/payments            # Process payment

# System Management
GET    /api/system/memory-stats # Memory usage statistics
GET    /api/system/memory-details # Detailed memory analysis
POST   /api/system/memory/optimize # Manual memory optimization
```

## Security Features

### Authentication
- JWT tokens with configurable expiration
- Secure password hashing with bcrypt
- Two-factor authentication support
- Session-based authentication for web interface

### Authorization
- Role-based access control (RBAC)
- Granular permissions per endpoint
- Tenant isolation for multi-tenant deployments
- Audit logging for all sensitive operations

### Data Protection
- HTTPS/TLS encryption in transit
- Database connection encryption
- Secure session storage
- Input validation and sanitization

## Performance & Monitoring

### Memory Management
- Real-time memory usage monitoring
- Automatic memory optimization
- Configurable auto-restart thresholds
- Memory leak detection and alerts

### Performance Monitoring
- Response time tracking
- Slow request detection
- Database query performance monitoring
- Cache hit/miss ratio tracking

### Health Checks
- Database connectivity checks
- External service health monitoring
- System resource monitoring
- Automated alerting

## Deployment

### Development (Replit)
- Automatic deployment on git push
- Environment variable configuration
- Built-in terminal and file editor
- Easy collaboration features

### Production (AWS Ready)
- Docker containerization support
- Environment-specific configurations
- Load balancer and auto-scaling ready
- Monitoring and logging integration

## Testing Strategy

### Unit Tests
- Vitest for fast unit testing
- Component testing with React Testing Library
- Service layer testing
- Database operation testing

### Integration Tests
- API endpoint testing
- Database integration testing
- External service mocking
- End-to-end workflow testing

### Test Coverage
- Minimum 80% code coverage target
- Critical path coverage requirements
- Performance testing for key operations
- Security testing for authentication flows

## Development Workflow

### Code Quality
- ESLint for code linting
- Prettier for code formatting
- TypeScript strict mode enabled
- Pre-commit hooks with Husky

### Version Control
- Feature branch workflow
- Pull request reviews required
- Automated CI/CD pipeline
- Semantic versioning

### Documentation
- Inline code documentation
- API documentation with OpenAPI
- Architecture decision records (ADRs)
- User and developer guides

## Future Roadmap

### Phase 1: Marketing Site
- Next.js SSR marketing site
- SEO optimization
- Content management system
- Lead generation forms

### Phase 2: Product Enhancement
- Advanced reporting and analytics
- Mobile app development
- Third-party integrations
- Advanced compliance features

### Phase 3: Enterprise Features
- Multi-tenant architecture
- Advanced security features
- API rate limiting and quotas
- Enterprise SSO integration

## Support & Maintenance

### Monitoring
- Real-time system monitoring
- Automated alerting
- Performance metrics collection
- Error tracking and reporting

### Backup & Recovery
- Automated database backups
- Disaster recovery procedures
- Data retention policies
- Business continuity planning

### Updates & Maintenance
- Regular security updates
- Feature releases
- Bug fixes and patches
- Performance optimizations

---

*Last updated: January 28, 2025*
*Version: 1.0.0*
