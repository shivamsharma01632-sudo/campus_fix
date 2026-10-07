# CampusFix - Backend Implementation Plan & Architecture Specification

## 1. Project Overview & Scope
The CampusFix backend is designed to provide complete operational parity with the interactive CampusFix frontend while adhering to strict architectural constraints:
- Node.js & Express.js architecture with clean layered separation of concerns.
- MySQL 8.0+ relational storage with dual-mode operational capability (live MySQL connection pool with automatic fallback to an in-memory transactional store for testing/sandboxed execution).
- Production-grade security, deterministic intelligence engines (AI triage, dynamic SLA, priority scoring, automated technician assignment, 30-day recurrence auditing), and automated testing suites.

---

## 2. Phase-by-Phase Execution Architecture

### Phase 1: Environment & Foundational Configuration
- Configure `.env`, `.env.example`, `.gitignore`, and `package.json` with required scripts and dependencies.
- Implement `config/env.js`: strict environment variable validation and sensible production defaults.
- Implement `config/db.js`: dual-mode MySQL pool with automatic fallback to an in-memory transactional store for resilient operation.
- Implement `config/ai.js`: LLM API client initialization with fallback mock heuristics.

### Phase 2: Relational Data Models & Normalized Schemas
- Draft relational schemas in `database/schema.sql` and migrations (`001_initial_schema.sql`, `002_ticket_history.sql`, `003_indexes.sql`).
- Implement seed dataset in `database/seed.sql` populated with demo users, technicians, locations, assets, SLA rules, tickets, and audit trails.
- Build clean, parameter-safe models:
  - `models/user.model.js`: User query logic and credential retrieval.
  - `models/ticket.model.js`: Full incident lifecycle operations and search filters.
  - `models/ticket-history.model.js`: Immutable audit logging.
  - `models/technician.model.js`: Roster queries, availability toggling, and workload counters.
  - `models/department.model.js`: Maintenance division metrics.
  - `models/location.model.js`: Campus buildings and classroom registries.
  - `models/asset.model.js`: Equipment tracking, 30-day failure counter, and chronic defect queries.
  - `models/sla.model.js`: Resolution target windows.

### Phase 3: Middleware Pipeline & Utility Subsystems
- `middleware/auth.middleware.js`: Bearer JWT token verification with optional authentication fallback.
- `middleware/role.middleware.js`: Role-Based Access Control (`STUDENT`, `TECHNICIAN`, `ADMIN`).
- `middleware/validation.middleware.js`: Request payload sanitizer and validator.
- `middleware/upload.middleware.js`: Multipart attachment processor.
- `middleware/error.middleware.js`: Centralized error handler returning structured JSON errors.
- `utils/logger.js`: ISO-timestamped structured log handler.
- `utils/response.js`: Uniform API envelope wrappers (`successResponse`, `errorResponse`, `paginatedResponse`).
- `utils/constants.js`: Application-wide SLA constants, roles, and status enums.
- `utils/validators.js`: Regex email, password, and code validators.
- `utils/helpers.js`: Ticket code generators, sanitize utilities, and time calculations.

### Phase 4: Core Domain Business Logic Engines
- **AI Triage Engine** (`services/ai.service.js`):
  - Natural language parsing for issue categorization and priority scoring.
  - Safe mock fallback regex classifier identifying keywords across AV, plumbing, HVAC, electrical, and networking.
- **Priority Scoring Engine** (`services/priority.service.js`):
  - Weighted safety, instructional impact, user count, and critical facility scoring.
- **Dynamic SLA Engine** (`services/sla.service.js`):
  - Deterministic resolution windows (Critical = 1h, High = 4h, Medium = 12h, Low = 24h).
  - Dynamic evaluation state machine (`ON_TRACK`, `AT_RISK`, `OVERDUE`).
- **Technician Assignment Engine** (`services/assignment.service.js`):
  - Workload-balanced matching using specialty affinity bonus and active ticket penalties.
- **Recurrence & Chronic Defect Engine** (`services/recurrence.service.js`):
  - Rolling 30-day failure counter and chronic asset flagging ($\ge 3$ failures).
- **Executive Analytics Engine** (`services/analytics.service.js`):
  - KPI aggregations, 7-day intake vs. resolution trends, and MTTR telemetry.
- **Notification Bus** (`services/notification.service.js`):
  - Event-driven mock notification dispatcher for email, SMS, and technician push alerts.

### Phase 5: RESTful API Controllers & Routes
- Implement standard REST routes and controllers for:
  - `auth`: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`
  - `tickets`: `/api/tickets`, `/api/tickets/ai-preview`, `/api/tickets/:id`, `/api/tickets/stats/operations`
  - `students`: `/api/student/tickets`, `/api/student/summary`
  - `technicians`: `/api/technicians`, `/api/technicians/assigned`, `/api/technicians/:id/availability`
  - `admin`: `/api/admin/command-center`, `/api/admin/tickets/:id/reassign`, `/api/admin/tickets/:id/priority`
  - `users`: `/api/users`, `/api/users/:id`, `/api/users/profile`
  - `departments`: `/api/departments`
  - `locations`: `/api/locations`
  - `assets`: `/api/assets`, `/api/assets/chronic`
  - `sla`: `/api/sla/rules`, `/api/sla/monitor`
  - `analytics`: `/api/analytics`
  - `health`: `/api/health`

### Phase 6: Automated Testing & Verification
- Unit and integration test suites:
  - `tests/auth.test.js`
  - `tests/ticket.test.js`
  - `tests/technician.test.js`
  - `tests/admin.test.js`
  - `tests/sla.test.js`
  - `tests/recurrence.test.js`
  - `tests/analytics.test.js`
- Comprehensive runner `tests/test.js` executing all 7 suites sequentially and producing a final validation report.

### Phase 7: Documentation & Packaging
- Comprehensive technical documentation in `CampusFix/docs/` (`TRD.md`, `APP_FLOW.md`, `IMPLEMENTATION_PLAN.md`, `TESTING.md`).
- Master `CampusFix/README.md` containing complete onboarding, database setup, and API specifications.
- Bundled archive packaged as `backend.zip`.
