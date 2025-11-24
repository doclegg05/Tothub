# TotHub Development Rules for Claude

## 🔄 Project Awareness & Context

- **Always read `PLANNING.md`** at the start of a new conversation to understand TotHub's architecture, goals, and constraints
- **Check `TASK.md`** before starting work to see active tasks and priorities
- **Review `replit.md`** for project-specific context and recent changes
- **Use Context Engineering methodology** - create PRPs for new features

## 🏗️ Architecture & Patterns

### Frontend (React/TypeScript)
- **Use functional components** with hooks exclusively
- **Follow existing patterns** in `/client/src/` for consistency
- **Use TanStack Query** for all API calls - no direct fetch
- **Use shadcn/ui components** - don't create custom UI components
- **Wouter for routing** - not React Router

### Backend (Express/TypeScript)
- **Keep routes thin** - business logic in storage.ts or services
- **Use storage interface** for all database operations
- **Validate with Zod schemas** from drizzle-zod
- **Handle errors consistently** with proper status codes

### Database (PostgreSQL/Drizzle)
- **Schema-first approach** - define in `shared/schema.ts`
- **Use drizzle-zod** for validation schemas
- **Never use raw SQL** - always use Drizzle ORM
- **Run `npm run db:push`** for schema changes

## 🧱 Code Structure & Quality

### File Organization
- **Never exceed 500 lines** per file - split into modules
- **Group by feature** not by file type
- **Use barrel exports** (index.ts) for clean imports
- **Keep shared types** in `/shared/`

### Naming Conventions
- **Components**: PascalCase (`CheckInModal.tsx`)
- **Files**: kebab-case (`check-in-modal.tsx`)
- **API routes**: RESTful (`/api/children/:id`)
- **Database**: snake_case (`enrollment_status`)

## 🧪 Testing Requirements

### Test Structure
```
tests/
├── unit/
│   ├── storage.test.ts
│   ├── services/
│   └── components/
├── integration/
│   └── api/
└── e2e/
```

### Test Coverage
- **Critical business logic**: 100% coverage required
- **API endpoints**: Integration tests for all routes
- **UI components**: Test user interactions
- **Include edge cases** and error scenarios

## ✅ Task Management

- **Update TASK.md** immediately when:
  - Starting a new task
  - Completing a task
  - Discovering new issues
  - Receiving user feedback
  
- **Mark tasks complete** with date and brief description
- **Add discovered issues** under "Discovered During Work"

## 📎 Code Style

### TypeScript
- **Strict mode enabled** - no `any` types
- **Use type inference** where possible
- **Export types** from schema for consistency
- **Async/await** over promises

### React
- **Custom hooks** for shared logic
- **Memoization** for expensive operations
- **Error boundaries** for robust UI
- **Accessibility** - proper ARIA labels

## 🚀 Development Workflow

### Adding Features
1. Create INITIAL.md with requirements
2. Generate PRP: `/generate-prp INITIAL.md`
3. Execute PRP: `/execute-prp PRPs/feature.md`
4. Update replit.md with changes
5. Run tests and validate
6. Update TASK.md

### Making Changes
- **Check existing patterns** first
- **Validate against schema** 
- **Test locally** before committing
- **Update documentation** as needed

## 🔒 Security & Performance

### Security
- **Never log sensitive data** (passwords, SSNs, etc.)
- **Validate all inputs** with Zod schemas
- **Use environment variables** for secrets
- **Implement proper auth checks** on all routes

### Performance
- **Monitor memory usage** (< 85% threshold)
- **Use pagination** for large datasets
- **Implement caching** where appropriate
- **Optimize database queries**

## 🧠 AI Behavior Rules

### Context Engineering
- **Always use PRPs** for feature development
- **Include validation loops** in implementations
- **Document assumptions** clearly
- **Ask for clarification** when needed

### Code Generation
- **Never hallucinate** packages or functions
- **Verify imports** exist before using
- **Follow existing patterns** exactly
- **Test generated code** thoroughly

### Communication
- **Be concise** but thorough
- **Explain complex changes** clearly
- **Suggest improvements** when appropriate
- **Report blockers** immediately

## 📚 Documentation

### Code Documentation
- **JSDoc for public APIs**
- **Inline comments** for complex logic
- **README updates** for new features
- **Migration notes** for breaking changes

### User Documentation
- **Update help text** for new features
- **Create tooltips** for complex UI
- **Maintain FAQ** for common issues
- **Document workflows** clearly

---

Remember: TotHub is a production system handling sensitive data. Every change must maintain security, compliance, and reliability.