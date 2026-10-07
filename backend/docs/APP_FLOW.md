# CampusFix - End-to-End Application Flow & Interaction Architecture

This document details the complete end-to-end data lifecycle, user flows, and interaction models across the CampusFix platform.

---

## 1. High-Level System Workflow

```
[ Student / User ]
       │
       ▼ (1) Enters Raw Problem Description & Uploads Photo
[ AI Triage Gateway (/api/tickets/ai-preview) ]
       │
       ▼ (2) Extracts Category, Dept, Asset, Safety, Impact
[ Ticket Submission (/api/tickets) ]
       │
       ├─► (3) Priority Engine: Determines LOW/MEDIUM/HIGH/CRITICAL
       │
       ├─► (4) Dynamic SLA Engine: Sets absolute resolution deadline
       │
       ├─► (5) Recurrence Engine: Checks 30d rolling failure history
       │
       └─► (6) Assignment Engine: Assigns least-loaded on-duty technician
       │
       ▼ (7) Audit Trail & Notifications Emitted
[ Technician Dashboard ] ◄── Updates Status: "In Progress" ──► "Resolved"
       │
       ▼ (8) Real-Time SLA Monitor Evaluates Compliance (On Track / At Risk / Overdue)
[ Admin Command Center & Analytics Telemetry ]
```

---

## 2. Detailed Role-Based Workflows

### 2.1 Student Incident Reporting Workflow
1. **Authentication / Session Initiation**:
   - Student navigates to the CampusFix portal.
   - Logs in via `POST /api/auth/login` (or submits as authenticated user with JWT stored in session).
2. **Interactive AI Triage**:
   - As the student types issue details in the Report Issue interface (e.g., *"Optoma projector in Room 304 keeps flickering and turning off"*):
   - Frontend calls `POST /api/tickets/ai-preview`.
   - The backend AI triage service evaluates the text:
     - Detects Category: `AV Equipment / Electrical`
     - Detects Department: `Electrical Maintenance`
     - Identifies Room: `Room 304` and Asset Tag: `P-304`
     - Detects Classroom Impact: `High` (instructional disruption)
     - Proposes Priority: `High` (4h SLA)
   - Student reviews the auto-populated metadata and can attach an image.
3. **Ticket Submission**:
   - Student submits via `POST /api/tickets`.
   - Backend performs:
     1. Creates ticket record with unique code (e.g. `CF-1006`).
     2. Runs `RecurrenceService`: flags `failures_30d = 7` (marked as Chronic defect).
     3. Runs `AssignmentService`: dispatches to available specialist with lowest workload (e.g. `Marcus Vance`).
     4. Appends record in `ticket_history` (`Ticket created and assigned`).
     5. Dispatches confirmation notification to student and assignment alert to technician.
4. **Tracking & Progress Monitoring**:
   - Student views status progression on Student Dashboard (`/api/student/tickets`).
   - Real-time SLA badge displays remaining countdown.

---

### 2.2 Technician Incident Resolution Workflow
1. **Duty Status & Task Queue**:
   - Technician logs in via `POST /api/auth/login`.
   - Sets availability status via `PATCH /api/technicians/:id/availability`.
   - Views assigned queue via `GET /api/technicians/assigned?name=Marcus+Vance`.
2. **Work Inception**:
   - Technician opens ticket modal and begins work.
   - Updates status to `In Progress` via `PUT /api/tickets/CF-1006` with note: *"Replaced HDMI cable and inspected power supply."*
   - Backend records history transition and updates notification bus.
3. **Ticket Completion**:
   - Technician completes work and updates status to `Resolved` via `PUT /api/tickets/CF-1006` with resolution notes: *"Overhaul completed. Tested 1080p projection for 15 minutes."*
   - Backend records `resolved_at = NOW()`.
   - SLAService checks whether resolution was before `sla_deadline` (computes `RESOLVED_ON_TIME` or `RESOLVED_LATE`).
   - Technician's `resolved_month` is incremented and active ticket count is decremented.

---

### 2.3 Executive & Facilities Admin Workflow
1. **Command Center Oversight**:
   - Administrator accesses `/api/admin/command-center`.
   - Views high-level KPI tiles:
     - Total tickets, open queue, overdue tickets, high-priority emergencies.
     - Live roster of all technicians with active task loads and capacity bars.
     - Chronic equipment alert spotlight.
2. **Manual Reassignment & Workload Rebalancing**:
   - When a technician has multiple concurrent emergencies, admin reassigns via `POST /api/admin/tickets/:id/reassign`.
   - Backend updates technician assignment, decrements previous technician's active count, increments new technician's count, and logs administrative audit note.
3. **Emergency Priority Override**:
   - When an issue escalates (e.g., examination scheduled in classroom), admin calls `PATCH /api/admin/tickets/:id/priority`.
   - System recalibrates the SLA clock and triggers priority alert.
4. **Fleet Analytics & Preventive Maintenance**:
   - Admin inspects `/api/analytics` for 7-day incident intake vs. resolution trends, discipline breakdown (Electrical, Plumbing, HVAC, IT), MTTR turnaround hours, and SLA compliance percentages.
   - Reviews chronic equipment alerts (`/api/assets/chronic`) to initiate capital replacement requests.

---

## 3. Real-Time Dynamic SLA State Transition Table

| Current State | Elapsed % | Time Left | System Action | UI Badge |
|---|---|---|---|---|
| **ON_TRACK** | 0% – 74% | > 25% of SLA | Normal monitoring | Green badge (`3h 40m left`) |
| **AT_RISK** | 75% – 99% | < 25% of SLA | Escalation warning logged | Amber badge (`45m left`) |
| **OVERDUE** | $\ge 100\%$ | Past deadline | Incident escalation triggered | Red flashing badge (`Breached by 1h 15m`) |
| **RESOLVED_ON_TIME** | N/A | Resolved $\le$ SLA | Logged in compliance metric | Blue / Green badge (`Resolved in 2.1h`) |
| **RESOLVED_LATE** | N/A | Resolved $>$ SLA | Penalized in compliance metric | Gray / Red badge (`Resolved 45m late`) |
