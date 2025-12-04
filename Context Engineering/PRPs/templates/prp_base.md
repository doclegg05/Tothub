# PRP: [Feature Name]

## Goal
[One sentence summary of the feature to be implemented]

## Why
- **Business Value**: [Why does the user want this?]
- **Integration**: [How does this fit into the current system?]
- **Problem Solved**: [What pain point does this fix?]

## What
[Description of the user flow and technical specifications]

### Success Criteria
- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]

## Context & Documentation

### Existing Patterns to Follow (Crucial)
* **Database Pattern**: [Reference file, e.g., `shared/schema.ts`]
    * *Why*: [e.g., "Follows specific column naming conventions"]
* **Service/API Pattern**: [Reference file, e.g., `server/services/emailService.ts`]
    * *Why*: [e.g., "Uses reliable error handling wrapper"]
* **UI Pattern**: [Reference file, e.g., `client/src/components/ui/card.tsx`]
    * *Why*: [e.g., "Uses shadcn/ui components"]

### Required Schema/Data Changes
```typescript
// Paste proposed schema changes here (or Python models if applicable)
// e.g. export const newTable = pgTable(...)