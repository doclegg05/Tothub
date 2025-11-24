# TotHub Code Conventions

## File Organization

### Directory Structure
- `/client` - React frontend application
- `/server` - Express.js backend API
- `/shared` - Shared TypeScript types and schemas
- `/attached_assets` - User-provided images and documents
- `/infrastructure` - Deployment configurations

### Naming Conventions

#### Files
- **Components**: PascalCase (e.g., `CheckInModal.tsx`, `StaffTimeClock.tsx`)
- **Pages**: kebab-case (e.g., `parent-communication.tsx`, `check-in.tsx`)
- **Services**: camelCase with "Service" suffix (e.g., `payrollCalculator.ts`, `emailService.ts`)
- **Utilities**: camelCase (e.g., `formatDate.ts`, `calculateRatio.ts`)

#### Code
- **Variables/Functions**: camelCase (`checkInTime`, `calculatePayroll`)
- **Types/Interfaces**: PascalCase (`ChildProfile`, `StaffSchedule`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_CHILDREN_PER_ROOM`, `JWT_EXPIRY_DAYS`)
- **Database Fields**: snake_case (`first_name`, `check_in_time`)

## TypeScript Conventions

### Type Safety
- Strict mode enabled
- Explicit return types for functions
- Avoid `any` type - use `unknown` or specific types
- Use type inference where obvious

### Imports
- Group imports: React, third-party, local
- Use absolute imports with `@/` prefix for client
- Use relative imports for nearby files

## React Patterns

### Component Structure
```tsx
// 1. Imports
import { useState } from "react";
import { Card } from "@/components/ui/card";

// 2. Types
interface Props {
  childId: string;
  onSuccess: () => void;
}

// 3. Component
export function CheckInForm({ childId, onSuccess }: Props) {
  // 4. State and hooks
  const [loading, setLoading] = useState(false);
  
  // 5. Event handlers
  const handleSubmit = async () => {
    // Implementation
  };
  
  // 6. Render
  return (
    <Card>
      {/* JSX */}
    </Card>
  );
}
```

### State Management
- Use hooks for local state
- TanStack Query for server state
- Context for cross-component state
- Avoid prop drilling

## API Conventions

### Endpoints
- RESTful naming: `/api/resource/:id`
- Plural nouns for collections: `/api/children`
- Use HTTP verbs appropriately
- Consistent error responses

### Request/Response
- Always validate with Zod schemas
- Return consistent JSON structure
- Include appropriate status codes
- Handle errors gracefully

## Database Patterns

### Schema Design
- Use Drizzle schema-first approach
- Meaningful table and column names
- Include timestamps where needed
- Use proper foreign key relationships

### Queries
- Use storage layer abstraction
- Avoid raw SQL in routes
- Handle null cases explicitly
- Use transactions for related operations

## Error Handling

### Client-Side
- Display user-friendly messages
- Log technical details to console
- Use toast notifications for feedback
- Handle loading and error states

### Server-Side
- Catch and log all errors
- Return appropriate HTTP status
- Don't expose sensitive information
- Use consistent error format

## Security Practices

### Authentication
- JWT tokens with proper expiry
- Secure password hashing with bcrypt
- Role-based access control
- Session management

### Data Protection
- Encrypt sensitive data
- Validate all inputs
- Sanitize user content
- Use HTTPS in production

## UI/UX Standards

### Component Library
- Use shadcn/ui components first
- Extend don't replace base components
- Maintain consistent spacing
- Follow accessibility guidelines

### Styling
- Tailwind CSS for styling
- Use design system variables
- Mobile-first responsive design
- Dark mode support

## Testing Approach

### Unit Tests
- Test business logic
- Mock external dependencies
- Aim for high coverage
- Use descriptive test names

### Integration Tests
- Test API endpoints
- Test database operations
- Test service interactions
- Use realistic test data

## Documentation

### Code Comments
- Explain "why" not "what"
- Document complex algorithms
- Add JSDoc for public APIs
- Keep comments up to date

### README Files
- Clear setup instructions
- Document environment variables
- Include troubleshooting guide
- Maintain changelog

## Performance Guidelines

### Frontend
- Lazy load heavy components
- Optimize images and assets
- Use React.memo wisely
- Minimize re-renders

### Backend
- Use database indexes
- Implement caching strategy
- Paginate large datasets
- Optimize query performance

## Git Conventions

### Commits
- Clear, descriptive messages
- Reference issue numbers
- Keep commits focused
- Use conventional commits

### Branches
- Feature branches from main
- Descriptive branch names
- Regular rebasing
- Clean up after merge