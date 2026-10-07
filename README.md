# CampusFix - Enterprise Smart Campus Incident & Facilities Management Platform

CampusFix is a production-quality, modular, and resilient campus maintenance management backend. Engineered using **Node.js, Express.js, MySQL, REST APIs, JWT, and Server-Side AI Integration**, it automates incident triage, deterministic priority calculation, dynamic SLA countdown monitoring, workload-balanced technician dispatching, and chronic equipment defect detection.

---

## 📁 Repository Structure

```
CampusFix/
├── backend/                         # Complete Node.js & Express REST API Backend
│   ├── server.js                    # HTTP listener & lifecycle management
│   ├── app.js                       # Express app configuration & middleware pipeline
│   ├── package.json                 # Dependencies & test runners
│   ├── .env                         # Active configuration
│   ├── .env.example                 # Reference template
│   ├── .gitignore                   # Git ignore rules
│   ├── config/                      # Database (dual-mode MySQL), env & AI configs
│   ├── routes/                      # Modular RESTful endpoint routers
│   ├── controllers/                 # Request handlers & validation wrappers
│   ├── services/                    # AI triage, SLA, assignment & recurrence engines
│   ├── middleware/                  # JWT auth, RBAC, error & upload middlewares
│   ├── models/                      # MySQL parameterized models with in-memory fallback
│   ├── utils/                       # Logger, response wrappers, constants & validators
│   ├── database/                    # schema.sql, seed.sql & migrations
│   ├── uploads/                     # Media attachment directory
│   └── tests/                       # 7 automated test suites (31 assertions, 100% pass)
├── docs/                            # Comprehensive System Architecture Documents
│   ├── TRD.md                       # Technical Requirements Document
│   ├── APP_FLOW.md                  # Detailed Application Flow & State Machines
│   ├── IMPLEMENTATION_PLAN.md       # Implementation Plan & Architecture
│   └── TESTING.md                   # Complete Test Strategy & Verification Report
├── frontend/                        # Interactive CampusFix Web Frontend
└── README.md                        # Master Documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher)
- **MySQL Server** (8.0+ optional — if MySQL is offline or not installed, CampusFix automatically activates its built-in in-memory transactional store for immediate testing and evaluation!)

### 1. Installation
Navigate to the `backend/` directory and install dependencies:
```bash
cd backend
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Review and adjust settings in `.env` if desired:
```env
PORT=5000
NODE_ENV=development

# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=campusfix
DB_PORT=3306

# Security & Authentication
JWT_SECRET=campusfix_jwt_super_secret_production_key_2026
JWT_EXPIRES_IN=7d

# Optional AI API Key (Leave blank to use the built-in Deterministic Safe Fallback)
AI_API_KEY=
AI_MODEL=gpt-4o-mini
```

### 3. MySQL Database Initialization (Optional)
If running a live MySQL instance, run the schema and seed scripts:
```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS campusfix;"
mysql -u root -p campusfix < database/schema.sql
mysql -u root -p campusfix < database/seed.sql
```
*Note: If no MySQL instance is available, CampusFix starts seamlessly in **resilient in-memory fallback mode** with identical demo data and functionality.*

### 4. Running the Backend Server
Start the development server:
```bash
npm run dev
```
Or start in standard production mode:
```bash
npm start
```
The server will bind to: `http://localhost:5000`  
Health check endpoint: `http://localhost:5000/api/health`

### 5. Running Automated Tests
Run the entire 7-suite test verification pipeline:
```bash
npm test
```
All 31 assertions will execute, demonstrating:
- User authentication & JWT generation
- Ticket lifecycle from creation to resolution
- AI incident triage and classification
- Technician roster and duty status toggling
- Dynamic SLA countdown calculation and breach detection
- Chronic equipment recurrence tracking
- Executive analytics and MTTR velocity reporting

---

## 🔑 Demo User Credentials

The database is pre-seeded with role-specific accounts ready for authentication testing:

| Role | Email | Password | Name / Title |
|---|---|---|---|
| **STUDENT** | `student@campus.edu` | `Password123!` | Alex Rivera (Student Body Rep) |
| **TECHNICIAN** | `marcus.vance@campus.edu` | `Password123!` | Marcus Vance (Lead AV Specialist) |
| **ADMIN** | `admin@campus.edu` | `Password123!` | Dr. Arthur Vance (Chief Facilities Director) |

---

## 📡 Core API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Create new student or staff account
- `POST /api/auth/login` — Authenticate and receive signed Bearer JWT
- `GET /api/auth/me` — Retrieve currently authenticated user profile
- `POST /api/auth/logout` — Invalidate user session

### Tickets & Incident Workflow (`/api/tickets`)
- `GET /api/tickets` — Query tickets with filters (`status`, `priority`, `category`, `search`)
- `POST /api/tickets` — Report new incident (runs AI categorization, SLA calculation, recurrence audit & technician dispatch)
- `POST /api/tickets/ai-preview` — Real-time AI triage preview from problem description
- `GET /api/tickets/:id` — Get ticket details, SLA clock metrics, and resolution countdown
- `PUT /api/tickets/:id` — Update ticket status (`In Progress`, `Resolved`, `Closed`) with work notes
- `DELETE /api/tickets/:id` — Delete ticket (Admin only)
- `GET /api/tickets/:id/history` — Retrieve immutable audit trail of all state transitions
- `GET /api/tickets/stats/operations` — Quick operational summary for navbars and counters

### Technician Operations (`/api/technicians`)
- `GET /api/technicians` — List all technicians with active task counts and ratings
- `GET /api/technicians/assigned` — Query tickets assigned to logged-in or named technician
- `GET /api/technicians/:id` — Retrieve technician profile and workload
- `PATCH /api/technicians/:id/availability` — Toggle on-duty availability (`isAvailable: true/false`)

### Admin Command Center (`/api/admin`)
- `GET /api/admin/command-center` — Comprehensive facility telemetry, open queue, and chronic alerts
- `POST /api/admin/tickets/:id/reassign` — Manually reassign ticket to another technician
- `PATCH /api/admin/tickets/:id/priority` — Manually override priority and recalibrate SLA clock

### Assets & Chronic Issues (`/api/assets`)
- `GET /api/assets` — List campus physical plant assets
- `GET /api/assets/chronic` — Filter assets with repeated failures ($\ge 3$ in rolling 30-day window)
- `POST /api/assets` — Register new physical equipment asset

### Dynamic SLA Engine (`/api/sla`)
- `GET /api/sla/rules` — Query resolution windows per priority level
- `GET /api/sla/monitor` — Real-time compliance monitoring across active incident clocks

### Analytics & Telemetry (`/api/analytics`)
- `GET /api/analytics` — Executive dashboard KPIs, MTTR velocity, 7-day intake trends, and discipline ratios

### System Health (`/api/health`)
- `GET /api/health` — Service status, uptime, and database connectivity mode

---

## 🧠 Business Logic Engines

1. **AI Triage Engine** (`services/ai.service.js`):
   - Extracts category, department, location, asset tag, and urgency indicators from natural language.
   - Built-in Deterministic Safe Fallback enables offline operation without external API dependencies.
2. **Priority Engine** (`services/priority.service.js`):
   - Scores safety hazards, classroom disruption, affected user count, and critical facilities to assign `Low`, `Medium`, `High`, or `Critical`.
3. **Dynamic SLA Engine** (`services/sla.service.js`):
   - Computes guaranteed resolution windows (Critical: 1h, High: 4h, Medium: 12h, Low: 24h).
   - Real-time status evaluation: `ON_TRACK`, `AT_RISK` ($\ge 75\%$), `OVERDUE` ($> 100\%$).
4. **Technician Assignment Engine** (`services/assignment.service.js`):
   - Dispatches incidents using specialty affinity scoring with active ticket load balancing.
5. **Recurrence Engine** (`services/recurrence.service.js`):
   - Detects repeated failures on the same asset or location in a rolling 30-day window and flags chronic defects for capital replacement review.
