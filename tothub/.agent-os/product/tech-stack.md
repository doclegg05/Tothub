# TotHub Tech Stack

## Frontend Stack

### Core Framework
- **Framework**: React 18 with TypeScript
- **Language**: TypeScript 5.x
- **Build Tool**: Vite
- **Package Manager**: npm

### Routing & State Management
- **Router**: Wouter (lightweight React router)
- **Server State**: TanStack Query (React Query v5)
- **Form Management**: React Hook Form with Zod validation
- **Local State**: React hooks (useState, useContext)

### UI & Styling
- **Component Library**: shadcn/ui
- **UI Primitives**: Radix UI
- **Styling**: Tailwind CSS
- **Theme Management**: CSS variables with dark mode support
- **Icons**: Lucide React
- **Animations**: Framer Motion

### Authentication & Security
- **Face Recognition**: face-api.js
- **Biometric Auth**: WebAuthn API
- **Session Management**: JWT tokens with 7-day expiry

## Backend Stack

### Core Framework
- **Runtime**: Node.js 20+
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful with potential WebSocket support

### Database & ORM
- **Database**: PostgreSQL (Neon Serverless)
- **ORM**: Drizzle ORM
- **Migrations**: drizzle-kit
- **Connection**: Pooled connections via Neon

### Authentication & Security
- **Password Hashing**: bcryptjs
- **JWT**: jsonwebtoken
- **Sessions**: express-session with connect-pg-simple
- **Security Headers**: Helmet.js
- **Rate Limiting**: express-rate-limit
- **Encryption**: AES-256-GCM for sensitive data

### Services & Integrations
- **Email**: SendGrid
- **PDF Generation**: jsPDF with jspdf-autotable
- **Math Calculations**: mathjs
- **Date Handling**: date-fns
- **Monitoring**: Sentry
- **Caching**: Redis (production) / In-memory (development)

## Development Tools

### Code Quality
- **Type Checking**: TypeScript strict mode
- **Linting**: ESLint (assumed)
- **Formatting**: Prettier (assumed)

### Testing (Prepared Infrastructure)
- **Unit Testing**: Jest ready
- **Integration Testing**: Service available
- **E2E Testing**: Framework implemented
- **Load Testing**: Service available

### Development Environment
- **Hot Reload**: Vite HMR for frontend
- **Server Watch**: tsx for backend
- **Environment**: Replit optimized

## Infrastructure

### Deployment
- **Platform**: Replit Deployments ready
- **Containerization**: Docker support
- **Orchestration**: Kubernetes configs available
- **Cloud**: AWS CloudFormation templates

### Monitoring & Logging
- **Error Tracking**: Sentry integration
- **Performance**: Custom monitoring service
- **Logs**: Structured logging with audit trails

## Key Dependencies

### Production Critical
- Express.js, React, PostgreSQL
- Drizzle ORM for data layer
- JWT for authentication
- SendGrid for emails
- face-api.js for biometric features

### Development Critical
- Vite for fast builds
- TypeScript for type safety
- Tailwind for consistent styling
- shadcn/ui for UI components

## Architecture Patterns
- **Frontend**: Component-based with hooks
- **Backend**: Service-oriented with clear separation
- **Database**: Schema-first with Drizzle
- **API**: RESTful with consistent patterns
- **Security**: Defense in depth approach