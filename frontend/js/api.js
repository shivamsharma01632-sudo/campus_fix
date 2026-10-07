/**
 * CampusFix - API Client & Mock Data Store
 * Prepared for future Node.js + Express + MySQL backend
 */

const SEED_TICKETS = [
  {
    id: 'CF-1001',
    title: 'fan in room 118 is not working',
    description: 'Ceiling fan in room 118 makes grinding noise and fails to spin.',
    category: 'AV / Electrical',
    location: 'Room 118',
    department: 'Electrical Maintenance',
    assignedTech: 'Marcus Vance',
    priority: 'High',
    status: 'Resolved',
    slaHours: 4,
    createdAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    reportedBy: 'tester123@gmail.com',
    studentName: 'Alex Mercer',
    isChronic: false,
    assetTag: 'FAN-118-A',
    timeline: [
      { status: 'Open', timestamp: '10h ago', note: 'Issue submitted via mobile portal' },
      { status: 'Assigned', timestamp: '9h ago', note: 'Auto-triaged to Electrical Maintenance' },
      { status: 'In Progress', timestamp: '5h ago', note: 'Technician Marcus Vance inspected motor' },
      { status: 'Resolved', timestamp: '2h ago', note: 'Capacitor replaced. Fan fully operational.' }
    ]
  },
  {
    id: 'CF-1002',
    title: "Projector in Room 304 isn't working",
    description: "Optoma projector in Room 304 won't power on. Power LED blinking red.",
    category: 'AV / Electrical',
    location: 'Room 304',
    department: 'Electrical Maintenance',
    assignedTech: 'Marcus Vance',
    priority: 'High',
    status: 'Resolved',
    slaHours: 4,
    createdAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    reportedBy: 'tester123@gmail.com',
    studentName: 'Alex Mercer',
    isChronic: true,
    chronicCount: 7,
    assetTag: 'Optoma Projector P-304',
    timeline: [
      { status: 'Open', timestamp: '10h ago', note: 'Reported by Student during lecture' },
      { status: 'Assigned', timestamp: '8h ago', note: 'Assigned to Marcus Vance' },
      { status: 'In Progress', timestamp: '4h ago', note: 'Lamp ballast reset' },
      { status: 'Resolved', timestamp: '1h ago', note: 'Rebooted and lamp tested.' }
    ]
  },
  {
    id: 'CF-1003',
    title: 'Water leaking under the sink in 2nd floor washroom, Block A',
    description: 'Continuous water drip from plumbing pipe under sink #2 in Block A 2nd floor restroom.',
    category: 'Plumbing',
    location: 'Block A 2nd Floor',
    department: 'Civil & Plumbing',
    assignedTech: 'Elena Rostova',
    priority: 'High',
    status: 'In Progress',
    slaHours: 2,
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    reportedBy: 'student2@campus.edu',
    studentName: 'Jordan Lee',
    isChronic: false,
    assetTag: 'PLUMB-W2-04',
    overdueTime: '-4h 12m',
    timeline: [
      { status: 'Open', timestamp: '6h ago', note: 'Auto-triaged by CampusFix AI' },
      { status: 'Assigned', timestamp: '5h ago', note: 'Dispatched to Elena Rostova' },
      { status: 'In Progress', timestamp: '3h ago', note: 'Main valve shut off, replacement gasket requested' }
    ]
  },
  {
    id: 'CF-1004',
    title: 'AC in lab 110 blowing warm air during exams',
    description: 'Central air handler unit blowing room temperature air. Thermostat reads 31C.',
    category: 'HVAC',
    location: 'Lab 110',
    department: 'HVAC Operations',
    assignedTech: 'David Chen',
    priority: 'Medium',
    status: 'Open',
    slaHours: 6,
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    reportedBy: 'student3@campus.edu',
    studentName: 'Samira Khan',
    isChronic: false,
    assetTag: 'HVAC-CHILL-110',
    timeline: [
      { status: 'Open', timestamp: '5h ago', note: 'Logged in queue awaiting technician pickup' }
    ]
  },
  {
    id: 'CF-1005',
    title: 'WiFi signal dropping constantly in Library Wing C',
    description: 'Access Point AP-C2 loses uplink every 10 minutes. Students disconnected during study hours.',
    category: 'Network',
    location: 'Library Wing C',
    department: 'Campus IT & Networks',
    assignedTech: 'Sarah Jenkins',
    priority: 'High',
    status: 'Assigned',
    slaHours: 4,
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    reportedBy: 'tester123@gmail.com',
    studentName: 'Alex Mercer',
    isChronic: false,
    assetTag: 'AP-LIB-WING-C',
    timeline: [
      { status: 'Open', timestamp: '5h ago', note: 'Reported by Student' },
      { status: 'Assigned', timestamp: '4h ago', note: 'Assigned to Sarah Jenkins (Network Team)' }
    ]
  },
  {
    id: 'CF-1006',
    title: 'Ceiling leak in library',
    description: 'Water leaking from ceiling in library 2nd floor directly onto computer terminal tables.',
    category: 'Plumbing',
    location: 'Room Library L2',
    department: 'Civil & Plumbing',
    assignedTech: 'Elena Rostova',
    priority: 'High',
    status: 'Open',
    slaHours: 4,
    createdAt: new Date(Date.now() - 25 * 3600 * 1000).toISOString(),
    reportedBy: 'librarian@campus.edu',
    studentName: 'Library Staff',
    isChronic: false,
    overdueTime: '-25h 17m',
    assetTag: 'ROOF-LIB-2',
    timeline: [
      { status: 'Open', timestamp: '1d ago', note: 'Emergency ticket opened by facility desk' }
    ]
  },
  {
    id: 'CF-1007',
    title: 'Unstable WiFi in hostel',
    description: 'WiFi keeps dropping in hostel block B, 3rd floor corridor switch ping drops.',
    category: 'IT & AV',
    location: 'Room Hostel B',
    department: 'Campus IT & Networks',
    assignedTech: 'Sarah Jenkins',
    priority: 'Medium',
    status: 'In Progress',
    slaHours: 12,
    createdAt: new Date(Date.now() - 31 * 3600 * 1000).toISOString(),
    reportedBy: 'hostel_warden@campus.edu',
    studentName: 'Hostel Resident',
    isChronic: false,
    overdueTime: '-31h 17m',
    assetTag: 'SW-HOSTEL-B3',
    timeline: [
      { status: 'Open', timestamp: '2d ago', note: 'Created via student complaint form' },
      { status: 'Assigned', timestamp: '1d ago', note: 'Assigned to Sarah Jenkins' },
      { status: 'In Progress', timestamp: '18h ago', note: 'VLAN switch reconfigured' }
    ]
  }
];

const SEED_TECHNICIANS = [
  { id: 'TECH-1', name: 'Marcus Vance', department: 'Electrical Maintenance', activeTasks: 2, maxTasks: 5, rating: 4.9, email: 'm.vance@campus.edu', status: 'Active' },
  { id: 'TECH-2', name: 'Elena Rostova', department: 'Civil & Plumbing', activeTasks: 3, maxTasks: 5, rating: 4.8, email: 'e.rostova@campus.edu', status: 'Active' },
  { id: 'TECH-3', name: 'David Chen', department: 'HVAC Operations', activeTasks: 1, maxTasks: 5, rating: 4.7, email: 'd.chen@campus.edu', status: 'Active' },
  { id: 'TECH-4', name: 'Sarah Jenkins', department: 'Campus IT & Networks', activeTasks: 2, maxTasks: 5, rating: 4.9, email: 's.jenkins@campus.edu', status: 'Active' }
];

const SEED_DEPARTMENTS = [
  { id: 'DEP-1', name: 'Electrical Maintenance', head: 'Dr. Arthur Ward', staffCount: 8, openTickets: 2, slaCompliance: '96.2%' },
  { id: 'DEP-2', name: 'Civil & Plumbing', head: 'Eng. Claire Dupuis', staffCount: 6, openTickets: 3, slaCompliance: '88.5%' },
  { id: 'DEP-3', name: 'HVAC Operations', head: 'Robert Vance', staffCount: 5, openTickets: 1, slaCompliance: '94.0%' },
  { id: 'DEP-4', name: 'Campus IT & Networks', head: 'Priya Sharma', staffCount: 10, openTickets: 2, slaCompliance: '98.1%' }
];

const SEED_ASSETS = [
  { id: 'AST-101', name: 'Optoma Projector P-304', location: 'Room 304, Block A', category: 'AV Equipment', status: 'Chronic Risk', failures30d: 7, lastServiced: '2026-09-28' },
  { id: 'AST-102', name: 'Carrier Chiller 400TR Unit 1', location: 'Plant Room Rooftop', category: 'HVAC', status: 'Operational', failures30d: 1, lastServiced: '2026-09-15' },
  { id: 'AST-103', name: 'Cisco Core Switch 9300', location: 'MDF Server Room', category: 'Networking', status: 'Operational', failures30d: 0, lastServiced: '2026-08-10' },
  { id: 'AST-104', name: 'Grundfos Booster Pump #2', location: 'Basement Water Works', category: 'Plumbing', status: 'Maintenance Due', failures30d: 3, lastServiced: '2026-09-02' }
];

class CampusFixAPI {
  constructor() {
    this.baseUrl = (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL)
      ? CONFIG.API_BASE_URL
      : 'http://localhost:5000/api';
    this._initStorage();
  }

  /**
   * Centralized handler for HTTP 401 Unauthorized responses.
   * Triggered when JWT token is missing, expired, or invalid.
   * Clears authentication state and redirects to login.
   */
  handleUnauthorized(response, errorData) {
    console.warn('[CampusFix API] 401 Unauthorized: token missing, invalid, or expired. Clearing session and redirecting to login.');
    if (typeof window !== 'undefined' && window.AUTH && typeof window.AUTH.logout === 'function') {
      window.AUTH.logout();
    } else if (typeof localStorage !== 'undefined') {
      const storageKey = (typeof CONFIG !== 'undefined' && CONFIG.STORAGE_KEYS && CONFIG.STORAGE_KEYS.AUTH_USER)
        ? CONFIG.STORAGE_KEYS.AUTH_USER
        : 'campusfix_auth_user';
      try {
        localStorage.removeItem(storageKey);
        localStorage.removeItem('campusfix_token');
        localStorage.removeItem('campusfix_jwt');
      } catch (e) {}
      if (typeof window !== 'undefined' && window.location) {
        window.location.href = '../login.html';
      }
    }
  }

  /**
   * Centralized handler for HTTP 403 Forbidden responses.
   * Triggered when authenticated user lacks permissions for an operation.
   * Logs error and displays feedback, but DOES NOT log the user out or clear session.
   */
  handleForbidden(response, errorData) {
    const message = (errorData && errorData.message)
      ? errorData.message
      : 'Access denied: You do not have permission to perform this action.';
    console.warn(`[CampusFix API] 403 Forbidden: ${message}`);
    if (typeof window !== 'undefined' && window.UTILS && typeof window.UTILS.showToast === 'function') {
      window.UTILS.showToast(message, 'error');
    }
  }

  /**
   * Centralized response evaluator for all API requests.
   * Intercepts 401 (logout) and 403 (authorization error) appropriately.
   */
  async handleResponse(response) {
    let data = null;
    const contentType = (response && response.headers && typeof response.headers.get === 'function')
      ? response.headers.get('content-type')
      : '';
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (e) {
        data = null;
      }
    } else if (response && typeof response.text === 'function') {
      try {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch (_) {
          data = text;
        }
      } catch (e) {
        data = null;
      }
    }

    // 401 Unauthorized: Token missing, invalid, or expired -> Log out
    if (response && response.status === 401) {
      this.handleUnauthorized(response, data);
      const message = (data && data.message) || 'Session expired or authentication invalid. Please sign in again.';
      const err = new Error(message);
      err.status = 401;
      err.data = data;
      throw err;
    }

    // 403 Forbidden: Role authorization error -> Retain session, do NOT log out
    if (response && response.status === 403) {
      this.handleForbidden(response, data);
      const message = (data && data.message) || 'Access denied: Insufficient permissions for this resource.';
      const err = new Error(message);
      err.status = 403;
      err.data = data;
      throw err;
    }

    // Other HTTP errors (e.g., 400, 404, 500)
    if (response && !response.ok) {
      const message = (data && data.message) || `HTTP request failed with status ${response.status}`;
      const err = new Error(message);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  /**
   * Centralized HTTP client request method with automatic JWT header injection.
   */
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http://') || endpoint.startsWith('https://')
      ? endpoint
      : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const headers = { ...(options.headers || {}) };

    // Inject Bearer JWT from session if available
    let token = null;
    if (typeof window !== 'undefined' && window.AUTH) {
      if (typeof window.AUTH.getToken === 'function') {
        token = window.AUTH.getToken();
      } else if (typeof window.AUTH.getCurrentUser === 'function') {
        const user = window.AUTH.getCurrentUser();
        token = user ? user.token : null;
      }
    }
    if (token && !headers['Authorization'] && !headers['authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
      options.body = JSON.stringify(options.body);
    }

    const fetchOptions = {
      ...options,
      headers
    };

    const fetchFn = (typeof window !== 'undefined' && window.fetch) ? window.fetch : global.fetch;
    if (!fetchFn) {
      throw new Error('No fetch implementation available in current environment');
    }

    const response = await fetchFn(url, fetchOptions);
    return await this.handleResponse(response);
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body: data });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'PATCH', body: data });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body: data });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  _initStorage() {
    if (!localStorage.getItem(CONFIG.STORAGE_KEYS.TICKETS)) {
      localStorage.setItem(CONFIG.STORAGE_KEYS.TICKETS, JSON.stringify(SEED_TICKETS));
    }
    if (!localStorage.getItem(CONFIG.STORAGE_KEYS.TECHNICIANS)) {
      localStorage.setItem(CONFIG.STORAGE_KEYS.TECHNICIANS, JSON.stringify(SEED_TECHNICIANS));
    }
    if (!localStorage.getItem(CONFIG.STORAGE_KEYS.DEPARTMENTS)) {
      localStorage.setItem(CONFIG.STORAGE_KEYS.DEPARTMENTS, JSON.stringify(SEED_DEPARTMENTS));
    }
    if (!localStorage.getItem(CONFIG.STORAGE_KEYS.ASSETS)) {
      localStorage.setItem(CONFIG.STORAGE_KEYS.ASSETS, JSON.stringify(SEED_ASSETS));
    }
  }

  // Tickets API
  async getTickets() {
    this._initStorage();
    let data = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.TICKETS) || '[]');

    // Enforce role-based access if user session is active in browser
    if (typeof window !== 'undefined' && window.AUTH && typeof window.AUTH.getCurrentUser === 'function') {
      const user = window.AUTH.getCurrentUser();
      if (user && user.role) {
        const role = String(user.role).toUpperCase();
        if (role === 'STUDENT') {
          const userEmail = (user.email || '').toLowerCase();
          data = data.filter(t => 
            (t.reporter_id && t.reporter_id === user.id) ||
            (t.reportedBy && t.reportedBy.toLowerCase() === userEmail) ||
            (t.studentEmail && t.studentEmail.toLowerCase() === userEmail) ||
            (t.reporter_email && t.reporter_email.toLowerCase() === userEmail)
          );
        } else if (role === 'TECHNICIAN') {
          const userName = (user.name || '').toLowerCase();
          data = data.filter(t =>
            (t.assigned_tech_id && t.assigned_tech_id === user.id) ||
            (t.assignedTech && t.assignedTech.toLowerCase() === userName) ||
            (t.assigned_tech_name && t.assigned_tech_name.toLowerCase() === userName)
          );
        }
      }
    }

    return data;
  }

  async getTicketById(id) {
    this._initStorage();
    const allData = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.TICKETS) || '[]');
    const ticket = allData.find(t => t.id === id) || null;
    if (!ticket) return null;

    // Enforce role-based access if user session is active in browser
    if (typeof window !== 'undefined' && window.AUTH && typeof window.AUTH.getCurrentUser === 'function') {
      const user = window.AUTH.getCurrentUser();
      if (user && user.role) {
        const role = String(user.role).toUpperCase();
        if (role === 'STUDENT') {
          const userEmail = (user.email || '').toLowerCase();
          const isOwner = (ticket.reporter_id && ticket.reporter_id === user.id) ||
            (ticket.reportedBy && ticket.reportedBy.toLowerCase() === userEmail) ||
            (ticket.studentEmail && ticket.studentEmail.toLowerCase() === userEmail) ||
            (ticket.reporter_email && ticket.reporter_email.toLowerCase() === userEmail);
          if (!isOwner) return null;
        } else if (role === 'TECHNICIAN') {
          const userName = (user.name || '').toLowerCase();
          const isAssigned = (ticket.assigned_tech_id && ticket.assigned_tech_id === user.id) ||
            (ticket.assignedTech && ticket.assignedTech.toLowerCase() === userName) ||
            (ticket.assigned_tech_name && ticket.assigned_tech_name.toLowerCase() === userName);
          if (!isAssigned) return null;
        }
      }
    }

    return ticket;
  }

  async createTicket(ticketData) {
    const tickets = await this.getTickets();
    const newId = `CF-${1000 + tickets.length + 1}`;
    
    // Simulate AI routing
    const aiAnalysis = this.simulateAITriage(ticketData.description);

    const newTicket = {
      id: newId,
      title: ticketData.title || ticketData.description.slice(0, 48) + (ticketData.description.length > 48 ? '...' : ''),
      description: ticketData.description,
      category: ticketData.category || aiAnalysis.category,
      location: ticketData.location || aiAnalysis.location,
      department: ticketData.department || aiAnalysis.department,
      assignedTech: ticketData.assignedTech || aiAnalysis.suggestedTech,
      priority: ticketData.priority || aiAnalysis.priority,
      status: 'Open',
      slaHours: aiAnalysis.slaHours || 4,
      createdAt: new Date().toISOString(),
      reportedBy: ticketData.reportedBy || 'student@campus.edu',
      studentName: ticketData.studentName || 'Student Reporter',
      assetTag: aiAnalysis.assetTag || 'GENERAL-EQUIP',
      imageUrl: ticketData.imageUrl || null,
      timeline: [
        { status: 'Open', timestamp: 'Just now', note: 'Report submitted and triaged via CampusFix AI' }
      ]
    };

    tickets.unshift(newTicket);
    localStorage.setItem(CONFIG.STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
    return newTicket;
  }

  async updateTicket(id, updates) {
    const tickets = await this.getTickets();
    const index = tickets.findIndex(t => t.id === id);
    if (index === -1) return null;

    const existing = tickets[index];
    const updated = { ...existing, ...updates };

    if (updates.status && updates.status !== existing.status) {
      if (!updated.timeline) updated.timeline = [];
      updated.timeline.unshift({
        status: updates.status,
        timestamp: 'Just now',
        note: updates.statusNote || `Status changed to ${updates.status}`
      });
      if (updates.status === 'Resolved') {
        updated.resolvedAt = new Date().toISOString();
      }
    }

    tickets[index] = updated;
    localStorage.setItem(CONFIG.STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
    return updated;
  }

  async deleteTicket(id) {
    let tickets = await this.getTickets();
    tickets = tickets.filter(t => t.id !== id);
    localStorage.setItem(CONFIG.STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
    return true;
  }

  // AI Triage Simulation Engine
  simulateAITriage(text) {
    const lower = (text || '').toLowerCase();
    
    // Projector / AV
    if (lower.includes('projector') || lower.includes('screen') || lower.includes('audio') || lower.includes('mic') || lower.includes('speaker') || lower.includes('fan')) {
      const matchRoom = text.match(/room\s*(\d+[a-zA-Z]?)/i);
      const room = matchRoom ? `Room ${matchRoom[1]}` : (lower.includes('118') ? 'Room 118' : 'Room 304');
      const isRoom304 = room.includes('304');
      return {
        issue: text.slice(0, 40),
        category: 'AV / Electrical',
        location: isRoom304 ? 'Block A, Room 304' : (room || 'Block A, Room 118'),
        department: 'Electrical Maintenance',
        priority: 'High',
        slaHours: 4,
        suggestedTech: 'Marcus Vance',
        confidenceScore: '98.4%',
        assetTag: isRoom304 ? 'Optoma Projector P-304' : 'AV-GEN',
        isChronicRisk: isRoom304,
        notes: isRoom304 ? '7 failures in 30 days. Recommend preventive maintenance.' : 'Normal priority service request.'
      };
    }

    // Plumbing
    if (lower.includes('water') || lower.includes('leak') || lower.includes('sink') || lower.includes('pipe') || lower.includes('washroom') || lower.includes('toilet')) {
      return {
        issue: text.slice(0, 40),
        category: 'Plumbing',
        location: lower.includes('library') ? 'Room Library L2' : 'Block A, 2nd floor washroom',
        department: 'Civil & Plumbing',
        priority: 'High',
        slaHours: 2,
        suggestedTech: 'Elena Rostova',
        confidenceScore: '99.1%',
        assetTag: 'PLUMB-VALVE-01',
        isChronicRisk: false,
        notes: 'Water hazard potential detected. Priority expedited.'
      };
    }

    // HVAC / Air conditioning
    if (lower.includes('ac') || lower.includes('air') || lower.includes('cooling') || lower.includes('heat') || lower.includes('temperature') || lower.includes('vent')) {
      return {
        issue: text.slice(0, 40),
        category: 'HVAC',
        location: 'Lab 110, Science Complex',
        department: 'HVAC Operations',
        priority: 'Medium',
        slaHours: 6,
        suggestedTech: 'David Chen',
        confidenceScore: '97.2%',
        assetTag: 'HVAC-CHILL-110',
        isChronicRisk: false,
        notes: 'Climate sensor diagnostic scheduled.'
      };
    }

    // WiFi / Network
    if (lower.includes('wifi') || lower.includes('internet') || lower.includes('network') || lower.includes('signal') || lower.includes('ethernet')) {
      return {
        issue: text.slice(0, 40),
        category: 'Network',
        location: lower.includes('hostel') ? 'Room Hostel B' : 'Library Wing C',
        department: 'Campus IT & Networks',
        priority: 'High',
        slaHours: 4,
        suggestedTech: 'Sarah Jenkins',
        confidenceScore: '96.8%',
        assetTag: 'AP-LIB-WING-C',
        isChronicRisk: false,
        notes: 'Network AP telemetry signal flagged.'
      };
    }

    // Default Fallback
    return {
      issue: text.slice(0, 40),
      category: 'General Facility',
      location: 'Central Campus Block B',
      department: 'Civil & Plumbing',
      priority: 'Medium',
      slaHours: 8,
      suggestedTech: 'Elena Rostova',
      confidenceScore: '92.5%',
      assetTag: 'GEN-FAC-01',
      isChronicRisk: false,
      notes: 'Standard triage applied based on facility keywords.'
    };
  }

  // Technicians API
  async getTechnicians() {
    this._initStorage();
    return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.TECHNICIANS) || '[]');
  }

  // Departments API
  async getDepartments() {
    this._initStorage();
    return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.DEPARTMENTS) || '[]');
  }

  // Assets API
  async getAssets() {
    this._initStorage();
    return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.ASSETS) || '[]');
  }

  // Chronic Issues API
  async getChronicIssues() {
    return [
      {
        assetName: 'Optoma Projector P-304',
        location: 'Room 304, Block A',
        failuresCount: 7,
        periodDays: 30,
        department: 'Electrical Maintenance',
        assignedTech: 'Marcus Vance',
        recommendation: 'Schedule preventive ballast replacement or full unit decommission.',
        nextAudit: 'Friday, 10:00 AM',
        status: 'Critical Attention'
      },
      {
        assetName: 'Restroom Pump Booster P-2',
        location: 'Hostel Block B Basement',
        failuresCount: 4,
        periodDays: 30,
        department: 'Civil & Plumbing',
        assignedTech: 'Elena Rostova',
        recommendation: 'Replace worn check valve seals to prevent pressure drops.',
        nextAudit: 'Monday, 02:00 PM',
        status: 'High Recurrence'
      }
    ];
  }

  // Summary Analytics
  async getAnalyticsSummary() {
    const tickets = await this.getTickets();
    const open = tickets.filter(t => t.status === 'Open').length;
    const inProgress = tickets.filter(t => t.status === 'In Progress').length;
    const assigned = tickets.filter(t => t.status === 'Assigned').length;
    const resolved = tickets.filter(t => t.status === 'Resolved').length;
    const high = tickets.filter(t => t.priority === 'High' || t.priority === 'Critical').length;
    const overdue = tickets.filter(t => t.overdueTime || (t.status !== 'Resolved' && t.id === 'CF-1006')).length || 3;

    return {
      total: tickets.length,
      openQueue: open + assigned + inProgress,
      inProgress,
      resolved,
      overdue,
      highPriority: high,
      dispatchAccuracy: '98.4%',
      slaComplianceRate: '94.2%',
      averageResolutionHours: '3.6h'
    };
  }
}

// Global API instance
if (typeof window !== 'undefined') {
  window.API = new CampusFixAPI();

  // Install fetch response interceptor for 401 handling on backend API calls
  if (typeof window.fetch === 'function' && !window.__CAMPUSFIX_FETCH_INTERCEPTOR_INSTALLED) {
    window.__CAMPUSFIX_FETCH_INTERCEPTOR_INSTALLED = true;
    const rawFetch = window.fetch;
    window.fetch = async function (...args) {
      const response = await rawFetch.apply(this, args);
      if (response && response.status === 401) {
        const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url ? args[0].url : '');
        const hasAuthHeader = args[1] && args[1].headers && (
          (args[1].headers['Authorization'] || args[1].headers['authorization'])
        );
        if (url.includes('/api') || hasAuthHeader) {
          if (window.API && typeof window.API.handleUnauthorized === 'function') {
            window.API.handleUnauthorized(response);
          }
        }
      }
      return response;
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CampusFixAPI,
    API: (typeof window !== 'undefined' && window.API) ? window.API : new CampusFixAPI()
  };
}
