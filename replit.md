# KidSign Pro - Enhanced Daycare Management System

## Overview

This is a comprehensive daycare management system built with a React frontend and Express.js backend, enhanced with competitor-inspired features from Brightwheel, Procare, Lillio, and Kangarootime. The application now includes advanced attendance tracking with photo capture, parent communication systems, enhanced child profiles with medical information, billing integration (QuickBooks ready), and role-based access control. It features multi-state compliance support for all 50 US states and uses PostgreSQL with Drizzle ORM for data persistence.

## Recent Changes (January 2025)

- ✓ Enhanced database schema with competitor-inspired features (medical info, billing, messaging)
- ✓ Added Enhanced Check-In page with photo capture and mood tracking
- ✓ Created Parent Communication system with messaging and media sharing
- ✓ Implemented role-based access control foundation
- ✓ Added billing system structure for QuickBooks integration
- ✓ Enhanced child profiles with allergies, immunizations, and medical notes
- ✓ Updated navigation to include new enhanced features

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and bundling

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM with schema-first approach
- **API Design**: RESTful endpoints with proper error handling
- **Development**: Hot reload with tsx for server development

### Project Structure
- `/client` - React frontend application
- `/server` - Express.js backend API
- `/shared` - Shared TypeScript schemas and types
- `/migrations` - Database migration files

## Key Components

### Database Schema (`shared/schema.ts`)
- **Children**: Core entity with age groups, rooms, parent info, emergency contacts
- **Staff**: Employee management with positions and contact details
- **Attendance**: Daily check-in/out tracking with timestamps and authorization
- **Staff Schedules**: Work schedule management with actual vs scheduled times
- **Settings**: Application configuration storage
- **Alerts**: System notification management

Age groups follow West Virginia regulations:
- Infant (0-16 months)
- Young Toddler (16 months - 2 years)
- Toddler (2 years)
- Preschool (3-5 years)
- School Age (5-8 years)
- Older School Age (9-12 years)

### Data Storage Layer (`server/storage.ts`)
Implements a comprehensive storage interface with methods for:
- CRUD operations for all entities
- Specialized queries for attendance tracking
- Staff schedule management
- Real-time presence monitoring
- Settings and alerts management

### Frontend Pages
- **Dashboard**: Overview with stats, alerts, and quick actions
- **Check-In/Out**: Attendance management interface
- **Children**: Child enrollment and profile management
- **Staff**: Employee management and scheduling
- **Reports**: Compliance reporting and analytics
- **Settings**: Application configuration

### UI Components
- Modular design with reusable components
- Form handling with validation
- Real-time data updates via React Query
- Responsive design for mobile and desktop
- Accessibility features built-in

## Data Flow

### Attendance Workflow
1. Child check-in creates attendance record with timestamp
2. Real-time updates to dashboard statistics
3. Automatic ratio compliance calculations
4. Alert generation for compliance violations
5. Check-out updates existing attendance record

### Ratio Compliance Monitoring
1. Real-time calculation of child-to-staff ratios by room
2. Age-group specific requirements enforcement
3. Automatic alert generation for violations
4. Visual indicators on dashboard and reports

### Staff Scheduling
1. Schedule creation with room assignments
2. Actual attendance tracking vs scheduled
3. Late arrival notifications
4. Integration with ratio calculations

## External Dependencies

### Core Framework Dependencies
- React ecosystem (React, React DOM, React Query)
- Express.js with TypeScript support
- Drizzle ORM with PostgreSQL adapter

### UI and Styling
- Radix UI primitives for accessible components
- Tailwind CSS for styling
- Lucide React for icons
- shadcn/ui component system

### Database and Infrastructure
- Neon serverless PostgreSQL
- WebSocket support for real-time features
- Environment-based configuration

### Development Tools
- Vite for fast development and building
- tsx for TypeScript execution
- ESBuild for production bundling
- Replit-specific development enhancements

### Form and Validation
- React Hook Form for form management
- Zod for schema validation
- Drizzle-Zod integration for type-safe forms

### Utilities
- date-fns for date manipulation
- clsx and tailwind-merge for className utilities
- nanoid for unique ID generation

## Deployment Strategy

### Development Environment
- Vite dev server for frontend with HMR
- tsx watch mode for backend development
- Replit-specific middleware and plugins
- Environment variable management

### Production Build
1. Frontend: Vite builds React app to `dist/public`
2. Backend: ESBuild bundles server code to `dist/index.js`
3. Single server serves both API and static files
4. PostgreSQL connection via Neon serverless

### Database Management
- Drizzle Kit for schema migrations
- Push-based deployment with `db:push`
- Environment-specific database URLs
- Connection pooling via Neon

### Configuration Management
- Environment variables for sensitive data
- Build-time configuration for client
- Runtime configuration via settings table
- Separate development and production configs

The system is designed for scalability and maintainability, with clear separation of concerns, type safety throughout, and modern development practices.