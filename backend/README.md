# CampusFix Backend REST API

CampusFix is an AI-driven campus facility management system that automatically classifies student natural-language problem reports, prioritizes urgency, guarantees dynamic SLA windows, dispatches maintenance technicians, and detects chronic infrastructure failures.

---

## 1. Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MySQL**: 8.0+ (Optional for local testing; an automated in-memory fallback is included)

---

## 2. Installation
```bash
cd backend
npm install
```

---

## 3. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```

Configure your `.env` variables:
```ini
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=campusfix
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=campusfix_secret_jwt_token_key_2026
AI_API_KEY=
AI_MODEL=gemini-1.5-flash
AI_PROVIDER=mock
CORS_ORIGIN=*
```

---

## 4. MySQL Setup & Database Initialization
1. Ensure your MySQL server is running.
2. Run the database schema script:
```bash
mysql -u root -p < database/schema.sql
```
3. Seed the database with realistic demo data:
```bash
mysql -u root -p < database/seed.sql
```

---

## 5. Starting the Server
### Development Mode (with hot-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

### Running Tests:
```bash
npm test
```

---

## 6. Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Student** | `test12345@gmail.com` | `password123` |
| **Technician (Electrical)** | `marcus.vance@campus.edu` | `password123` |
| **Technician (Plumbing)** | `elena.r@campus.edu` | `password123` |
| **Technician (HVAC)** | `david.c@campus.edu` | `password123` |
| **Technician (Networks)** | `sarah.j@campus.edu` | `password123` |
| **Facility Admin** | `admin@campus.edu` | `admin123` |

---

## 7. API Route Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health & database status |
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login and obtain JWT token |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `GET` | `/api/tickets` | Query tickets with filters |
| `POST` | `/api/tickets` | Report issue with AI auto-dispatch |
| `GET` | `/api/tickets/:id` | Get ticket details and history |
| `PUT` | `/api/tickets/:id` | Update ticket status / work notes |
| `DELETE` | `/api/tickets/:id` | Delete ticket (Admin) |
| `GET` | `/api/tickets/stats/operations` | Real-time operations counters |
| `POST` | `/api/tickets/ai-preview` | Live AI triage preview for typing |
| `GET` | `/api/technicians` | Technicians roster & workloads |
| `GET` | `/api/departments` | Maintenance divisions |
| `GET` | `/api/assets` | Campus equipment & assets |
| `GET` | `/api/assets/chronic` | Chronic issues (≥3 failures/30d) |
| `GET` | `/api/sla/rules` | Configured SLA policies |
| `GET` | `/api/sla/monitor` | Active countdown timers & breach risk |
| `GET` | `/api/analytics` | Charts & aggregate metrics |
| `GET` | `/api/admin/command-center` | Executive overview dashboard data |
| `POST` | `/api/admin/reassign/:ticketId` | Manual technician reassignment |

---

## 8. Architecture & Documentation
Detailed architectural and workflow specifications are in `docs/`:
- `docs/TRD.md` — Technical Requirements Document
- `docs/APP_FLOW.md` — Application Data Flow & AI Pipeline
- `docs/IMPLEMENTATION_PLAN.md` — Architecture Strategy
- `docs/TESTING.md` — Test Matrix & Verification Scenarios
