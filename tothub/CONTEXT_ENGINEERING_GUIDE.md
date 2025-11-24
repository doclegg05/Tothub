# TotHub Context Engineering Guide

## Overview
TotHub has been aligned with Context Engineering methodology to improve development efficiency and consistency. This guide explains how to use Context Engineering for TotHub development.

## What's New

### Core Files Created
1. **PLANNING.md** - Project architecture, goals, and constraints
2. **TASK.md** - Active task tracking and project roadmap
3. **CLAUDE.md** - AI development rules specific to TotHub
4. **Example Patterns** - Standard patterns for APIs and components
5. **PRP Template** - TotHub-specific feature development template

### Global Context Engineering Installation
Context Engineering is installed globally at `~/.context-engineering/` and can be used across all projects.

## How to Use Context Engineering with TotHub

### 1. Starting a New Feature

Create an INITIAL.md file describing your feature:
```markdown
# Feature: Parent Mobile App Notifications

## Goal
Enable parents to receive push notifications about their child's activities

## Requirements
- Real-time notifications for check-in/out
- Daily activity summaries
- Emergency alerts
- Configurable notification preferences
```

### 2. Generate a PRP (Product Requirements Prompt)

Run in your terminal or Claude Code:
```
/generate-prp INITIAL.md
```

This creates a comprehensive PRP in `Context Engineering/PRPs/` with:
- Detailed requirements
- Technical design
- Implementation steps
- Validation criteria

### 3. Execute the PRP

Run the generated PRP:
```
/execute-prp Context Engineering/PRPs/parent-notifications.md
```

The AI will:
- Follow TotHub patterns from examples
- Implement according to CLAUDE.md rules
- Update TASK.md with progress
- Create tests as specified

### 4. Track Progress

- Check TASK.md for active tasks
- Mark tasks complete when done
- Add discovered issues
- Update replit.md with major changes

## Best Practices

### Before Starting Work
1. Read PLANNING.md to understand architecture
2. Check TASK.md for current priorities
3. Review relevant example patterns
4. Ensure you have latest code

### During Development
1. Follow patterns in examples folder
2. Keep files under 500 lines
3. Use storage interface for DB operations
4. Validate with Zod schemas
5. Test thoroughly

### After Completing Features
1. Update TASK.md
2. Update replit.md if architecture changed
3. Ensure tests are passing
4. Document any new patterns

## Common Workflows

### Adding a New API Endpoint
1. Define schema in `shared/schema.ts`
2. Add storage method in `server/storage.ts`
3. Create route in `server/routes.ts`
4. Follow `tothub-api-pattern.ts` example

### Creating a New Component
1. Use shadcn/ui components
2. Implement with React Hook Form
3. Use TanStack Query for API calls
4. Follow `tothub-component-pattern.tsx` example

### Database Changes
1. Update schema in `shared/schema.ts`
2. Run `npm run db:push`
3. Update storage interface
4. Test migrations thoroughly

## Troubleshooting

### Memory Issues
- Check auto-restart service status
- Monitor with `/api/memory-stats`
- Clear caches if needed
- Restart manually if over 85%

### Failed Tests
- Check test structure matches examples
- Ensure mocks are properly set up
- Validate against schemas
- Check for async issues

### API Errors
- Verify auth tokens
- Check request validation
- Review error handling
- Check storage layer

## Resources

### Project Files
- **PLANNING.md** - Architecture reference
- **TASK.md** - Current work items
- **CLAUDE.md** - Development rules
- **replit.md** - Project context

### Context Engineering
- **~/.context-engineering/** - Global installation
- **/generate-prp** - Create PRPs
- **/execute-prp** - Run PRPs
- **Examples folder** - Pattern references

## Getting Help

1. Check existing patterns in examples
2. Review CLAUDE.md for rules
3. Look for similar features in codebase
4. Ask for clarification in INITIAL.md
5. Use validation loops in PRPs

---

Remember: Context Engineering ensures consistent, high-quality development by providing comprehensive context to AI assistants. Use it for all new features!