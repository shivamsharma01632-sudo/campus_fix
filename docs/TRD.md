# CampusFix - Technical Requirements Document (TRD)

## 1. System Overview & Objectives
**CampusFix** is an enterprise-grade campus facility and maintenance management backend system engineered for educational institutions. The platform delivers end-to-end incident management, automated AI issue triage, deterministic priority calculation, technician workload balancing, real-time dynamic SLA enforcement, and chronic defect detection across campus assets.

### Key Goals:
- **Zero-Drop Incident Ingestion**: Rapid issue intake from students, staff, and faculty with automatic duplicate detection.
- **AI-Driven Triage**: Real-time natural language extraction for category, department, location, asset tag, and urgency assessment.
- **Deterministic SLA Engine**: Continuous compliance evaluation against guaranteed resolution windows (1h, 4h, 12h, 24h).
- **Automated Workload-Balanced Dispatching**: Intelligent matching of issues to the least loaded qualified technician in the relevant department.
- **Chronic Failure Detection**: Rolling 30-day tracking of recurring defects on campus equipment (HVAC, projectors, lab apparatus, pumps).
- **High-Fidelity Security & Auditing**: Role-Based Access Control (RBAC), bcrypt credential hashing, tamper-evident JWTs, and full ticket lifecycle history trails.

---

## 2. Architecture & Technology Stack

### 2.1 Technology Standards
- **Runtime**: Node.js (v18.x - v22.x LTS)
- **Application Framework**: Express.js (v4.21+)
- **Database**: MySQL 8.0+
- **Database Driver**: `mysql2/promise` (connection pooling with automatic reconnect and transaction support)
- **In-Memory Resilient Fallback**: Integrated in-memory data store for testing and offline development
- **Security & Cryptography**: `bcryptjs` (salt rounds: 10), `jsonwebtoken` (HMAC SHA-256)
- **File Uploads**: `multer` with sanitization, file-type allowlists, and unique UUID naming
- **Environment Management**: `dotenv` with strict schema validation in `config/env.js`
- **Logging**: Structured Winston-like ISO timestamped logger (`utils/logger.js`)
- **API Architecture**: Standardized RESTful JSON endpoints with uniform envelope responses

### 2.2 Directory Architecture
The backend strictly adheres to the requested enterprise directory structure:
```
CampusFix/backend/
├── server.js                        # HTTP Server listener, port binding & graceful shutdown
├── app.js                           # Express application configuration, middleware stack & routes
├── package.json                     # Dependency manifests & test runners
├── .env                             # Active environment variable bindings
├── .env.example                     # Reference template for deployments
├── .gitignore                       # Standard ignore definitions
├── config/
│   ├── db.js                        # MySQL connection pool with resilient in-memory fallback
│   ├── env.js                       # Environment validation and defaults
│   └── ai.js                        # LLM provider configuration & safe mock fallback
├── routes/
│   ├── auth.routes.js               # Registration, login, profile me, logout
│   ├── ticket.routes.js             # Ticket CRUD, AI preview, stats, history
│   ├── student.routes.js            # Student-specific ticket queries & draft submission
│   ├── technician.routes.js         # Technician roster, tasks, status updates, availability
│   ├── admin.routes.js              # Command center, manual reassignment, priority override
│   ├── user.routes.js               # User management & profile updates
│   ├── department.routes.js         # Facilities departments & compliance benchmarks
│   ├── location.routes.js           # Campus buildings, zones, and classrooms
│   ├── asset.routes.js              # Campus equipment registry & chronic failure tracking
│   ├── sla.routes.js                # SLA rules & real-time monitoring clocks
│   └── analytics.routes.js          # Executive dashboard telemetry & volume trends
├── controllers/
│   ├── auth.controller.js           # Authentication & token generation logic
│   ├── ticket.controller.js         # Ticket lifecycle, history appending, resolution
│   ├── student.controller.js        # Student-facing ticket handlers
│   ├── technician.controller.js     # Technician operations & duty status
│   ├── admin.controller.js          # Executive operations & dispatch overrides
│   ├── user.controller.js           # User account handlers
│   ├── department.controller.js     # Department catalog operations
│   ├── location.controller.js       # Location registry operations
│   ├── asset.controller.js          # Asset & chronic issue management
│   ├── sla.controller.js            # SLA configuration and monitor queries
│   └── analytics.controller.js      # Aggregated metrics & turnaround velocity
├── services/
│   ├── ai.service.js                # Natural language parser, category & urgency extraction
│   ├── ticket.service.js            # Transactional ticket creation & state transitions
│   ├── priority.service.js          # Deterministic priority scoring algorithm
│   ├── sla.service.js               # Resolution window computation & real-time clock evaluation
│   ├── assignment.service.js        # Department routing & least-loaded technician selection
│   ├── recurrence.service.js        # 30-day failure auditor & chronic asset flagging
│   ├── analytics.service.js         # Executive metrics calculation & MTTR aggregations
│   └── notification.service.js      # Multi-channel notification mock (Email, SMS, Push)
├── middleware/
│   ├── auth.middleware.js           # Bearer JWT verification & user injection
│   ├── role.middleware.js           # RBAC enforcement (STUDENT, TECHNICIAN, ADMIN)
│   ├── validation.middleware.js     # Express request schema validator
│   ├── upload.middleware.js         # Multer multipart/form-data handler
│   └── error.middleware.js          # Centralized error handler with safe HTTP output
├── models/
│   ├── user.model.js                # User DB queries & password hashing hooks
│   ├── ticket.model.js              # Ticket entity persistence & filter query builder
│   ├── ticket-history.model.js      # Immutable audit log queries
│   ├── technician.model.js          # Technician entity & workload incrementors
│   ├── department.model.js          # Department queries & SLA compliance metrics
│   ├── location.model.js            # Location directory queries
│   ├── asset.model.js               # Asset register & 30-day failure counter
│   └── sla.model.js                 # SLA rule records & threshold lookups
├── utils/
│   ├── logger.js                    # Standardized logging utility
│   ├── response.js                  # Standardized response envelopes (success/error/paginate)
│   ├── constants.js                 # Application-wide enums and static configs
│   ├── validators.js                # Email, password, and parameter format validators
│   └── helpers.js                   # Date formatters, ticket code generators, sanitizers
├── database/
│   ├── schema.sql                   # Complete relational DDL schema
│   ├── seed.sql                     # Comprehensive seed dataset matching frontend demo
│   └── migrations/
│       ├── 001_initial_schema.sql   # Core tables DDL
│       ├── 002_ticket_history.sql   # History & audit trail table
│       └── 003_indexes.sql          # Query optimization indexes
├── uploads/
│   └── .gitkeep                     # Storage directory for issue attachments
└── tests/
    ├── auth.test.js                 # Authentication & authorization test suite
    ├── ticket.test.js               # Ticket creation, lifecycle & history test suite
    ├── technician.test.js           # Technician roster & workload test suite
    ├── admin.test.js                # Admin operations & override test suite
    ├── sla.test.js                  # SLA engine calculations & clock tests
    ├── recurrence.test.js           # Recurrence engine & chronic defect tests
    └── analytics.test.js            # Telemetry, MTTR & executive analytics tests
```

---

## 3. Database Schema & Data Integrity

The relational schema implements full 3NF normalization with enforced referential integrity:

### 3.1 Relational Tables
1. **`users`**:
   - `id` INT AUTO_INCREMENT PRIMARY KEY
   - `name` VARCHAR(150) NOT NULL
   - `email` VARCHAR(191) NOT NULL UNIQUE (indexed)
   - `password` VARCHAR(255) NOT NULL (bcrypt hash)
   - `role` ENUM('STUDENT', 'TECHNICIAN', 'ADMIN') NOT NULL DEFAULT 'STUDENT'
   - `phone` VARCHAR(50)
   - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   - `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

2. **`departments`**:
   - `id` INT AUTO_INCREMENT PRIMARY KEY
   - `name` VARCHAR(100) NOT NULL UNIQUE
   - `code` VARCHAR(20) NOT NULL UNIQUE
   - `description` TEXT
   - `sla_compliance` VARCHAR(20) DEFAULT '95.0%'
   - `avg_resolution_hours` DECIMAL(5,2) DEFAULT 4.0

3. **`locations`**:
   - `id` INT AUTO_INCREMENT PRIMARY KEY
   - `name` VARCHAR(150) NOT NULL
   - `building` VARCHAR(100) NOT NULL
   - `floor` VARCHAR(20)
   - `room_number` VARCHAR(50)

4. **`technicians`**:
   - `id` INT AUTO_INCREMENT PRIMARY KEY
   - `user_id` INT NULL, FK → `users.id` ON DELETE SET NULL
   - `name` VARCHAR(150) NOT NULL
   - `email` VARCHAR(191) NOT NULL
   - `department_id` INT NOT NULL, FK → `departments.id`
   - `specialty` VARCHAR(150)
   - `active_tickets` INT DEFAULT 0
   - `resolved_month` INT DEFAULT 0
   - `rating` DECIMAL(3,2) DEFAULT 4.80
   - `is_available` TINYINT(1) DEFAULT 1

5. **`assets`**:
   - `id` INT AUTO_INCREMENT PRIMARY KEY
   - `asset_tag` VARCHAR(50) NOT NULL UNIQUE (indexed)
   - `name` VARCHAR(150) NOT NULL
   - `category` VARCHAR(100) NOT NULL
   - `location_id` INT NULL, FK → `locations.id`
   - `department_id` INT NULL, FK → `departments.id`
   - `failures_30d` INT DEFAULT 0
   - `status` VARCHAR(50) DEFAULT 'Normal'
   - `recommendation` TEXT

6. **`sla_rules`**:
   - `id` INT AUTO_INCREMENT PRIMARY KEY
   - `priority` VARCHAR(20) NOT NULL UNIQUE
   - `category` VARCHAR(100) NULL
   - `resolution_hours` INT NOT NULL
   - `first_response_minutes` INT NOT NULL DEFAULT 30

7. **`tickets`**:
   - `id` INT AUTO_INCREMENT PRIMARY KEY
   - `ticket_code` VARCHAR(30) NOT NULL UNIQUE (indexed, e.g., 'CF-1001')
   - `title` VARCHAR(255) NOT NULL
   - `description` TEXT NOT NULL
   - `category` VARCHAR(100) NOT NULL
   - `priority` ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium'
   - `status` ENUM('Open', 'Assigned', 'In Progress', 'Resolved', 'Closed') NOT NULL DEFAULT 'Open'
   - `created_by_user_id` INT NULL, FK → `users.id`
   - `student_name` VARCHAR(150)
   - `student_email` VARCHAR(191)
   - `location_id` INT NULL, FK → `locations.id`
   - `location_name` VARCHAR(150)
   - `department_id` INT NULL, FK → `departments.id`
   - `department_name` VARCHAR(100)
   - `assigned_tech_id` INT NULL, FK → `technicians.id`
   - `assigned_tech_name` VARCHAR(150)
   - `asset_id` INT NULL, FK → `assets.id`
   - `asset_tag` VARCHAR(50)
   - `is_chronic` TINYINT(1) DEFAULT 0
   - `sla_hours` INT DEFAULT 4
   - `sla_deadline` TIMESTAMP NULL
   - `image_url` VARCHAR(255) NULL
   - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   - `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   - `resolved_at` TIMESTAMP NULL

8. **`ticket_history`**:
   - `id` INT AUTO_INCREMENT PRIMARY KEY
   - `ticket_id` INT NOT NULL, FK → `tickets.id` ON DELETE CASCADE
   - `action` VARCHAR(100) NOT NULL
   - `previous_status` VARCHAR(50)
   - `new_status` VARCHAR(50)
   - `changed_by_name` VARCHAR(150)
   - `note` TEXT
   - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

---

## 4. Business Logic Engines

### 4.1 AI Issue Triage Engine (`services/ai.service.js`)
- Receives unformatted natural language text from users.
- Connects to OpenAI/Gemini/DeepSeek when an API key is configured.
- When no external API key is present, seamlessly invokes a sophisticated **Deterministic Safe Fallback Parser** with regex keyword matching across safety triggers, environmental damage, electrical hazards, network terms, and facility infrastructure.
- Extracts:
  - **Category**: AV / Electrical, Civil & Plumbing, HVAC & Climate, Campus IT & Networks, General.
  - **Department**: Target maintenance group.
  - **Location & Asset**: Detected room numbers, building names, equipment tags.
  - **Impact Factors**: `safetyRisk`, `classroomImpact`, `affectsMultipleUsers`, `criticalFacility`.
  - **Calculated Priority**: `Low`, `Medium`, `High`, or `Critical`.
  - **Executive Summary**: Clean, structured summary for dispatch cards.

### 4.2 Deterministic Priority Engine (`services/priority.service.js`)
Calculates priority through weighted evaluation:
$$\text{Score} = (\text{Safety Risk} \times 10) + (\text{Classroom Impact} \times 5) + (\text{Users Affected} \times 4) + (\text{Critical Facility} \times 3)$$
- Score $\ge 10$: **Critical** (1 hour SLA)
- Score $\ge 5$: **High** (4 hours SLA)
- Score $\ge 2$: **Medium** (12 hours SLA)
- Score $< 2$: **Low** (24 hours SLA)

### 4.3 Dynamic SLA Clock Engine (`services/sla.service.js`)
- Calculates dynamic resolution deadlines from priority level:
  - `Critical`: 1 hour window
  - `High`: 4 hours window
  - `Medium`: 12 hours window
  - `Low`: 24 hours window
- Computes real-time evaluation states:
  - `ON_TRACK`: Elapsed $\le 75\%$
  - `AT_RISK`: Elapsed $> 75\%$ and remaining $> 0$
  - `OVERDUE` / `BREACHED`: Deadline passed ($t > \text{deadline}$)
  - `RESOLVED_ON_TIME` / `RESOLVED_LATE`: Historical audit state for completed tickets.

### 4.4 Automated Technician Assignment Engine (`services/assignment.service.js`)
1. Filters active technicians by target department.
2. Checks availability flag (`is_available = 1`).
3. Computes affinity score combining specialty keyword alignment and active workload penalty:
   $$\text{Score} = \text{Specialty Match Bonus} - (\text{Active Tickets} \times 2)$$
4. Selects highest-scoring technician and automatically updates their active ticket counter.
5. Emits audit trail entry and notification event.

### 4.5 Recurrence & Chronic Defect Engine (`services/recurrence.service.js`)
- Scans for identical asset tag or location within a rolling 30-day window.
- If failure count $\ge 3$, marks `is_chronic = true` and updates asset record with:
  `"High recurrence (X failures in 30d): Schedule preventive overhaul / replacement review."`
- Alerts administrators via the Chronic Equipment Spotlight in the Admin Command Center.

---

## 5. Security & Authentication Model
- **Password Protection**: Passwords are never stored in plaintext; hashed with `bcryptjs` using 10 rounds of cryptographic salting.
- **JWT Authentication**: Secure Bearer tokens encoded with user ID, email, role, and department. Validated via `middleware/auth.middleware.js`.
- **Role-Based Access Control**: Enforced through `middleware/role.middleware.js`:
  - `STUDENT`: Can report issues, view own tickets, and retrieve public facility catalogs.
  - `TECHNICIAN`: Can view assigned tickets, update status (`In Progress`, `Resolved`), submit resolution notes, and update on-duty availability.
  - `ADMIN`: Full system access, manual dispatches, priority overrides, asset creation, and command-center analytics.
- **SQL Injection Prevention**: All MySQL queries utilize parameterized queries (`?` placeholders).
- **CORS Configuration**: Configured with explicit origins and methods in `app.js`.
