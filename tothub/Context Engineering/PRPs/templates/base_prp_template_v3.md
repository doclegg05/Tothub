"Base PRP Template v3 - Replit-Optimized for Web/DB Features with Enhanced Validation"

description: |

Purpose

Template for AI agents in Replit to implement website features (e.g., database integrations) with rich context, iterative validation, and Replit-specific adaptations for reliable, deployable code.
Core Principles

Context is King: Provide ALL docs, examples, codebase patterns, and Replit environment details.
Validation Loops: Include runnable tests, lints, and Replit shell commands for self-fixing.
Information Dense: Use exact keywords, file paths, and patterns from the project.
Progressive Success: Build incrementally—validate basics before enhancements.
Replit Rules: Follow Replit's package limits, use shell for runs, preview in browser; no external installs beyond built-ins. Reference project guidelines in [e.g., RULES.md] if available.

Goal

[Specific end state: e.g., "Implement a user authentication system with database storage that handles login/signup securely."]
Why

[Business/user value: e.g., "Enables secure user sessions, reducing unauthorized access and improving UX for 10k+ users."]
[Integration: e.g., "Ties into existing API routes and frontend forms."]
[Problems solved: e.g., "Fixes data inconsistency in current DB, benefits admins and end-users."]

What

[User behavior & tech specs: e.g., "Users submit forms to create/read/update DB entries; backend validates inputs, stores in SQLite/Postgres; frontend shows success/error messages."]
Success Criteria

[Measurable: e.g., "All tests pass with 100% coverage; endpoint responds in <200ms; no security vulnerabilities in manual review; DB queries handle 100 concurrent requests without errors."]

All Needed Context

Documentation & References (list all required for this feature)
text# MUST INCLUDE IN CONTEXT  
- url: [e.g., https://docs.sqlalchemy.org/en/20/]  
  why: [e.g., Sections on ORM models and query optimization for DB performance.]  
- file: [e.g., /src/db/models.py]  
  why: [e.g., Follow existing schema patterns; avoid duplicate table definitions.]  
- doc: [e.g., https://replit.com/docs]  
  section: [e.g., "Hosting & Databases"]  
  critical: [e.g., Replit DB uses key-value store by default; switch to SQLite for relational needs.]  
- docfile: [e.g., /docs/project_rules.md]  
  why: [e.g., Custom guidelines pasted into project for consistent coding style.]
Current Codebase Tree (run tree in Replit shell for overview)
text[Paste output here, e.g.:  
.  
├── src/  
│   ├── main.py  
│   └── db/  
└── tests/  
]
Desired Codebase Tree (add files and their responsibilities)
text[e.g.:  
.  
├── src/  
│   ├── main.py (updated: add new routes)  
│   ├── db/  
│   │   └── new_model.py (defines DB schemas and queries)  
│   └── api/  
│       └── new_endpoint.py (handles HTTP requests/responses)  
└── tests/  
    └── test_new_feature.py (unit/integration tests)  
]
Known Gotchas (Codebase & Libraries, Replit-Specific)
text# CRITICAL: Replit's async support is limited—use threading for long ops if needed.  
# Example: SQLAlchemy requires explicit session commits in Replit DB.  
# Example: Avoid large datasets; Replit memory caps at 1GB—paginate queries.  
# Example: Frontend previews in Replit browser may not reflect production hosting.
Implementation Blueprint

Data Models and Structures (Ensure type safety, especially for DB)
textExamples:  
- ORM Models: Use SQLAlchemy Base for tables.  
- Pydantic Schemas: For API validation/serialization.  
- Validators: Custom fields for emails, passwords.
Task List (Ordered, with dependencies)
textTask 1: [e.g., Define DB models] (Depends on: None)  
- CREATE /src/db/new_model.py  
- MIRROR from: /src/db/existing_model.py  
- ADD: Class with fields (e.g., id: int, name: str)  
Task 2: [e.g., Implement API endpoint] (Depends on: Task 1)  
- MODIFY /src/api/routes.py  
- INJECT: New route after existing ones  
- PRESERVE: Async patterns if using FastAPI  
...  
Task N: [e.g., Add tests] (Depends on: All prior)
Per-Task Pseudocode (Critical details only, not full code)
text# Task 1: DB Model  
class NewModel(Base):  
    __tablename__ = 'new_table'  
    id = Column(Integer, primary_key=True)  
    # GOTCHA: Add indexes for frequent queries  
    name = Column(String, index=True)  
    # PATTERN: Use validators from pydantic
text# Task 2: Endpoint  
@app.post("/new_endpoint")  
async def handle_request(data: NewSchema):  
    # VALIDATE: Raise HTTPException on invalid  
    with Session(engine) as session:  # Replit DB connection  
        # QUERY: session.add(NewModel(...))  
        session.commit()  
    # RETURN: Standardized JSON (see /src/utils.py)
Integration Points
textDATABASE:  
- Migration: "CREATE TABLE new_table (id INTEGER PRIMARY KEY, ...)"  
- Index: "CREATE INDEX idx_name ON new_table(name)"  
CONFIG:  
- Add to: /config.py  
- Pattern: DB_URL = os.getenv('REPLIT_DB_URL', 'sqlite:///app.db')  
ROUTES:  
- Add to: /src/main.py  
- Pattern: app.include_router(new_router, prefix='/api/new')  
FRONTEND:  
- Update: /static/js/app.js  
- Pattern: Fetch('/api/new').then(...)  # Replit browser testable
Validation Loop

Level 1: Syntax & Style (Run in Replit shell)
text# Fix basics first  
pip install ruff mypy  # If not pre-installed  
ruff check /src/new_file.py --fix  
mypy /src/new_file.py  
# Expected: No errors; fix by reading output.
Level 2: Unit Tests (Mirror existing patterns)
text# CREATE /tests/test_new_feature.py  
import pytest  
def test_happy_path():  
    result = new_function("valid")  
    assert result == "success"  
def test_db_error():  
    with pytest.raises(DBError):  
        new_function("invalid")  
# Run: pytest /tests/test_new_feature.py -v  
# Iterate: Fix code based on failures, no mocks for passing.
Level 3: Integration & Security Tests (Replit-Specific)
text# Start server: python /src/main.py  
# Test endpoint in Replit console or browser preview  
curl -X POST http://0.0.0.0:8080/new -d '{"key": "value"}'  # Replit port  
# Expected: 200 OK, valid JSON  
# Security: Check for SQL injection—test with malformed input  
# If fails: View logs in Replit console
Final Validation Checklist

All tests pass: pytest /tests/ -v (100% coverage target)
No lints/types: ruff check /src/ && mypy /src/
Manual test: [e.g., Browser preview shows DB data updated]
Performance: [e.g., Endpoint <200ms via curl timing]
Security: No exposed secrets; inputs sanitized
Docs updated: [e.g., Add to README.md]
Replit deploy: Runs without crashes in hosted mode

Anti-Patterns to Avoid

❌ Invent new patterns—reuse existing ones
❌ Skip validations/tests—"it works locally" isn't enough
❌ Ignore Replit limits (e.g., no infinite loops)
❌ Use sync in async web contexts
❌ Hardcode DB creds—use env vars
❌ Broad exceptions—catch specifics like ValueError
❌ Forget frontend-DB sync for web features