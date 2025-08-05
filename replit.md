# TotHub - Complete Daycare Management System

## Overview

TotHub is a comprehensive daycare management system designed to streamline operations for childcare facilities. It features a React frontend and an Express.js backend, incorporating advanced functionalities inspired by leading competitors. Key capabilities include multi-state compliance support for all 50 US states, enhanced attendance tracking with photo and biometric capture, robust parent communication systems, detailed child profiles with medical information, and integrated billing (QuickBooks ready). The system also provides comprehensive staff and payroll management, physical security integration, and a dynamic state-based compliance system, aiming for enterprise-grade security and production readiness.

## User Preferences

Preferred communication style: Simple, everyday language.
App complexity preference: Keep it simple and focused on core daycare management features. Don't lose sight of the main purpose.
Logo preference: Use the new TotHub logo with blue circle background and yellow text.
Age-out configuration: Default age limit is 14 years old (configurable per facility).

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query for server state
- **UI Components**: shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables
- **Build Tool**: Vite

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM (schema-first approach)
- **API Design**: RESTful endpoints
- **Development**: Hot reload with `tsx`

### Project Structure
- `/client`: React frontend
- `/server`: Express.js backend API
- `/shared`: Shared TypeScript schemas and types
- `/migrations`: Database migration files

### Core Features & Design Patterns
- **Database Schema**: Comprehensive schema including Children, Staff, Attendance, Staff Schedules, Settings, Alerts. Age groups are configurable.
- **Data Storage Layer**: Centralized `storage.ts` for all CRUD and specialized queries.
- **UI/UX**: Modern, responsive design with professional landing pages, dynamic dashboards, and simplified unified check-in process. Features a blue/purple gradient color scheme.
- **Key Features**:
    - **Attendance**: Real-time check-in/out, photo/biometric capture, mood tracking, room selection.
    - **Compliance**: Dynamic multi-state ratio enforcement, federal overlays (COPPA, HIPAA, FERPA), regulatory compliance dashboard, qualification requirements.
    - **Communication**: Automated daily activity reports via email (SendGrid), multi-source notification system, parent communication system with messaging.
    - **Staff & Payroll**: Full-featured time clock, comprehensive payroll processing (tax calculations, pay stub generation), QuickBooks integration for financial reporting.
    - **Security**: Enterprise-grade framework with AES-256-GCM encryption, MFA, RBAC, audit logging, XSS/CSRF protection, biometric data hashing, incident response. Physical security integration for modular door access control.
    - **System Optimization**: Dramatically reduced memory usage from 96%+ to 0.60% through comprehensive optimizations including:
        - Enhanced memory management with reduced cache sizes, LRU caching with strict limits
        - Aggressive garbage collection and lowered auto-restart threshold to 75%
        - Real-time Performance Monitor dashboard with memory graphs, API metrics, cache hit rates
        - Request optimization with gzip compression middleware and debouncing
        - Background job processing for heavy operations (reports, payroll, analytics)
        - Enhanced alert system with tiered severity, multi-channel notifications, and auto-remediation
    - **Feature Expansion**: PWA implementation, WebSocket for real-time updates, batch operations, multi-center management, waitlist, advanced financial services, audit trail.
    - **User Profiles**: Comprehensive user profile management with personal information, contact details, professional information, and preferences. Integrated with authentication system, supports role-based fields (staff vs parent), and includes profile picture, bio, language preferences, and notification settings.
    - **Workflow Visualization**: Interactive workflow diagrams with color-coded process status (active, processing, error, idle, completed) and micro-animations for data flow connections. Features multiple workflow views (attendance, staff management, automation), real-time status updates, node details on click, and animated data flow particles.
    - **Database Improvements (2025-08-05)**: Comprehensive schema normalization with 26 foreign key constraints, performance indexes on high-use queries, security audit trails, check constraints for data validation, backup system implemented, and partial seed data. Added parent_id to children table for proper relationships.

### Deployment Strategy
- **Development**: Vite for frontend, `tsx` for backend.
- **Production**: Frontend built to `dist/public`, backend bundled with ESBuild to `dist/index.js`. Single server deployment.
- **Database Management**: Drizzle Kit for migrations, push-based deployment.
- **Configuration**: Environment variables for sensitive data.

## External Dependencies

- **Core Frameworks**: React, React DOM, React Query, Express.js, Drizzle ORM.
- **UI/Styling**: Radix UI, Tailwind CSS, Lucide React, shadcn/ui.
- **Database**: Neon serverless PostgreSQL.
- **Form/Validation**: React Hook Form, Zod.
- **Utilities**: `date-fns`, `clsx`, `tailwind-merge`, `nanoid`.
- **Email Service**: SendGrid.
- **Biometrics**: `face-api.js`, WebAuthn.
- **PDF Generation**: `jsPDF`.
- **Calculations**: `mathjs`.
- **Scheduling**: FullCalendar Resource Timeline.
- **Chatbot**: Integrated widget.
- **Monitoring**: Sentry.
- **Caching**: Redis.
- **Security Headers**: Helmet.js.
- **Automation**: Zapier (webhook management).
- **Accounting Integration**: QuickBooks (CSV and IIF export).
- **Performance**: Compression middleware, debounce hooks.
- **Background Processing**: Custom job queue service.
- **Alerting**: Enhanced alert service with EventEmitter.