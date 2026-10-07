# CampusFix - Testing Strategy & Verification Report

## 1. Overview
The CampusFix backend test suite delivers automated end-to-end verification across every subsystem, including authentication, incident lifecycle, role-based workflows, dynamic SLA monitoring, recurrence auditing, and analytics calculations.

Testing is executed using standard Node.js without heavyweight third-party testing frameworks to ensure zero dependency overhead and lightning-fast execution.

---

## 2. Test Execution

### Running the Complete Test Suite
From the `backend/` directory:
```bash
npm test
```
Or directly using Node.js:
```bash
node tests/test.js
```

### Running Individual Test Suites
```bash
node tests/auth.test.js
node tests/ticket.test.js
node tests/technician.test.js
node tests/admin.test.js
node tests/sla.test.js
node tests/recurrence.test.js
node tests/analytics.test.js
```

---

## 3. Test Suites & Verification Coverage

### 3.1 Authentication Suite (`tests/auth.test.js`)
- **Student Login**: Validates password check via `bcrypt` and returns standard JWT token.
- **Identity Verification (`/api/auth/me`)**: Validates Bearer token parsing and profile return.
- **User Registration**: Creates new user with secure password hash and immediately issues auth token.
- **Credential Rejection**: Asserts that incorrect passwords return HTTP 401 Unauthorized.
- **Route Protection**: Verifies that protected endpoints return HTTP 401 when the Authorization header is omitted.

### 3.2 Ticket Lifecycle Suite (`tests/ticket.test.js`)
- **AI Preview Triage**: Asserts natural language parser correctly extracts `Plumbing` category and high priority.
- **Incident Creation**: Validates ticket creation, unique ticket code generation (`CF-1006`), automatic technician assignment, recurrence check, and initial audit trail entry.
- **Ticket Retrieval**: Verifies lookup by unique ticket code.
- **Status Progression**: Verifies state transition from `Open` to `In Progress` with work note.
- **Resolution**: Verifies state transition to `Resolved`, timestamping `resolved_at`, and SLA compliance evaluation.
- **Category Filter**: Verifies database query filters tickets accurately.

### 3.3 Technician Operations Suite (`tests/technician.test.js`)
- **Roster Retrieval**: Asserts technician list returns all on-duty specialists.
- **Technician Profile**: Verifies lookup of technician details (e.g. `Marcus Vance`).
- **Workload Verification**: Validates `active_tickets` counter is accurate.
- **Availability Toggle**: Verifies `PATCH /api/technicians/:id/availability` updates the duty status flag.

### 3.4 Admin Operations Suite (`tests/admin.test.js`)
- **Command Center Telemetry**: Asserts `/api/admin/command-center` returns total tickets, open queue, and chronic alerts.
- **Manual Reassignment**: Verifies administrative reassignment of ticket `CF-1004` to `Marcus Vance` and checks audit logging.
- **Priority Override**: Validates administrative priority escalation (`High`) and updates the SLA clock.
- **Asset Registration**: Validates creation of physical plant assets via `POST /api/assets`.

### 3.5 Dynamic SLA Engine Suite (`tests/sla.test.js`)
- **Critical SLA Calculation**: Confirms Critical priority evaluates to guaranteed 1-hour resolution window.
- **High SLA Calculation**: Confirms High priority evaluates to guaranteed 4-hour resolution window.
- **Overdue Clock Detection**: Verifies that tickets past their deadline are flagged as `OVERDUE` with `isOverdue: true`.
- **On-Track Clock Detection**: Verifies that recently created tickets are classified as `ON_TRACK`.
- **SLA Monitor API**: Validates `/api/sla/monitor` returns active clocks and facility-wide compliance percentages.

### 3.6 Recurrence & Chronic Defect Suite (`tests/recurrence.test.js`)
- **Chronic Asset Detection**: Validates that Projector `P-304` is detected as a chronic failure ($\ge 7$ failures in 30 days).
- **Preventive Maintenance Recommendation**: Verifies automatic generation of preventive overhaul recommendations.
- **Chronic API Endpoint**: Asserts `GET /api/assets/chronic` surfaces chronic equipment alerts for facility managers.

### 3.7 Analytics & Telemetry Suite (`tests/analytics.test.js`)
- **Dispatch Accuracy KPI**: Verifies analytics engine computes 98.4% automated dispatch accuracy.
- **7-Day Volume Trends**: Verifies rolling 7-day intake and resolution trend points.
- **Executive Telemetry Endpoint**: Validates `/api/analytics` returns MTTR turnaround velocity (3.6 hours).

---

## 4. Test Results Summary

```
========================================================
  CAMPUSFIX BACKEND: TEST SUITE VERIFICATION REPORT
========================================================
  Auth Tests:                 5 passed, 0 failed (100%)
  Ticket Lifecycle Tests:     6 passed, 0 failed (100%)
  Technician Workload Tests:  4 passed, 0 failed (100%)
  Admin Operations Tests:     4 passed, 0 failed (100%)
  Dynamic SLA Engine Tests:   5 passed, 0 failed (100%)
  Recurrence Engine Tests:    3 passed, 0 failed (100%)
  Analytics & KPI Tests:      4 passed, 0 failed (100%)
--------------------------------------------------------
  TOTAL:                     31 PASSED, 0 FAILED (100%)
========================================================
```
