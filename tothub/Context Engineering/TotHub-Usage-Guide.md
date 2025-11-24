# Context Engineering for TotHub

This guide explains how to use Context Engineering for developing features in your TotHub daycare management system.

## What This Folder Contains

- **README.md** - Complete Context Engineering methodology and best practices
- **CLAUDE.md** - Template for project-wide AI assistant rules (you can adapt this for TotHub)
- **INITIAL.md** - Template for describing new features you want to build
- **PRPs/templates/prp_base.md** - Template for Product Requirements Prompts

## How to Use Context Engineering for TotHub

### 1. For New Features

When you want to add a new feature to TotHub:

1. Copy `INITIAL.md` and fill it out with your feature request
2. Include specific examples from your existing codebase
3. Reference the TotHub tech stack (React, TypeScript, Express.js, PostgreSQL)

Example:
```
## FEATURE:
Add automated billing reminders that send emails to parents 3 days before tuition is due

## EXAMPLES:
- /server/services/emailService.ts - Email sending pattern
- /server/routes.ts - API endpoint patterns
- /shared/schema.ts - Database schema patterns

## DOCUMENTATION:
- SendGrid API documentation
- Existing billing system in TotHub

## OTHER CONSIDERATIONS:
- Must respect parent communication preferences
- Should integrate with existing notification system
- Consider timezone handling for international families
```

### 2. Leverage Your Existing Patterns

TotHub already has established patterns. Reference these in your PRPs:

- **Frontend**: React components with shadcn/ui
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT tokens with role-based access
- **State Management**: TanStack Query

### 3. Create Project-Specific Rules

Consider adapting `CLAUDE.md` for TotHub:

```
### TotHub Project Rules

- Always use TypeScript with strict type checking
- Follow the existing file structure in /client, /server, /shared
- Use Drizzle ORM for all database operations
- Implement proper authentication checks using authMiddleware
- Add appropriate logging for debugging
- Consider memory optimization (LRU caching is already implemented)
- Update replit.md when making architectural changes
```

### 4. Example-Driven Development

Place TotHub-specific examples in an examples folder:

- Authentication flow examples
- Database query patterns
- Component structure examples
- API endpoint patterns

## Benefits for TotHub Development

1. **Consistency**: New features follow existing patterns
2. **Completeness**: PRPs ensure all edge cases are considered
3. **Efficiency**: AI assistants have full context to implement features correctly
4. **Documentation**: Each PRP serves as feature documentation

## Quick Start for Your Next Feature

1. Think about what you want to build
2. Fill out an INITIAL.md file with the feature details
3. Include references to existing TotHub code patterns
4. Use the PRP template to create a comprehensive implementation plan
5. Execute with confidence knowing all context is provided

Remember: The quality of AI assistance is directly proportional to the quality of context you provide!