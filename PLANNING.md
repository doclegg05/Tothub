# TotHub Project Planning

## Overview
TotHub is a comprehensive daycare management system built with modern web technologies. It provides tools for child enrollment, attendance tracking, staff management, parent communication, and regulatory compliance.

## Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript, Wouter for routing, TanStack Query for state management
- **Backend**: Express.js with TypeScript, RESTful API design
- **Database**: PostgreSQL via Neon serverless, Drizzle ORM
- **UI**: shadcn/ui components, Tailwind CSS
- **Build**: Vite for development and production bundling

### Project Structure
```
├── client/                  # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Route-based page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and helpers
├── server/                 # Express.js backend API
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database abstraction layer
│   ├── middleware/        # Express middleware
│   └── services/          # Business logic services
├── shared/                # Shared TypeScript types
│   └── schema.ts          # Drizzle schema definitions
└── Context Engineering/   # Development methodology
```

## Goals

### Primary Objectives
1. **Streamline Operations**: Reduce administrative burden for daycare directors and staff
2. **Ensure Compliance**: Maintain regulatory compliance across all 50 US states
3. **Enhance Communication**: Improve parent-staff communication and engagement
4. **Secure Data**: Protect sensitive child and family information
5. **Scale Efficiently**: Support growth from single centers to multi-location operations

### Key Features
- Child enrollment and profile management
- Real-time attendance tracking with biometric options
- Staff scheduling and payroll management
- Parent communication portal
- Billing and payment processing
- Regulatory compliance monitoring
- Physical security integration

## Constraints

### Technical Constraints
- Must work on Replit's infrastructure
- PostgreSQL database via Neon (connection limits)
- Node.js memory constraints (auto-restart at 85%)
- No Docker/containerization in development

### Business Constraints
- Must support all 50 US states' regulations
- COPPA, HIPAA, FERPA compliance required
- Must integrate with existing systems (QuickBooks, door access)
- Mobile-responsive design required

### Development Constraints
- Use existing tech stack (no major framework changes)
- Maintain backward compatibility
- Follow Context Engineering methodology for new features
- Keep files under 500 lines

## Style Guide

### Code Style
- TypeScript with strict mode
- ESLint + Prettier for formatting
- Functional components with hooks
- Async/await over promises
- Comprehensive error handling

### Naming Conventions
- Components: PascalCase (e.g., `CheckInModal`)
- Files: kebab-case (e.g., `check-in-modal.tsx`)
- API routes: RESTful conventions (`/api/children/:id`)
- Database: snake_case (e.g., `enrollment_status`)

### Git Conventions
- Feature branches: `feature/description`
- Commit messages: Present tense, descriptive
- PR descriptions: Include context and testing steps

## Development Workflow

### Adding New Features
1. Create INITIAL.md with requirements
2. Generate PRP using `/generate-prp`
3. Execute PRP using `/execute-prp`
4. Update replit.md with changes
5. Test thoroughly before marking complete

### Testing Requirements
- Unit tests for critical business logic
- Integration tests for API endpoints
- Manual testing for UI/UX changes
- Performance testing for large datasets

## Security Considerations

### Data Protection
- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Implement proper authentication/authorization
- Regular security audits

### Access Control
- Role-based permissions (director, teacher, staff, parent)
- Session management with JWT tokens
- Audit logging for sensitive operations

## Performance Targets

### Response Times
- API responses: < 200ms average
- Page loads: < 2 seconds
- Database queries: < 100ms

### Scalability
- Support 1000+ children per center
- Handle 100+ concurrent users
- Efficient memory usage (< 85% threshold)

## Future Considerations

### Planned Enhancements
- Mobile native apps
- Advanced analytics dashboard
- AI-powered insights
- Multi-language support
- Franchise management tools

### Technical Debt
- Migrate Flask prototype to production
- Implement comprehensive test coverage
- Optimize database queries
- Enhance error handling

---

Last Updated: January 28, 2025