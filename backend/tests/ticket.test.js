/**
 * CampusFix - Ticket Lifecycle & Ticket-Level RBAC Integration Tests
 * Enforces ownership/assignment checks across STUDENT, TECHNICIAN, and ADMIN roles
 */

const http = require('http');
const app = require('../app');

function makeRequest(server, path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const req = http.request({
      hostname: 'localhost',
      port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTicketTests() {
  const server = app.listen(0);
  console.log('\n--- Running Ticket Lifecycle & RBAC Authorization Tests ---');
  let passed = 0;
  let failed = 0;

  try {
    // 0. Authenticate users: Student 1, Student 2, Technician 1, Technician 2, and Admin
    const student1Login = await makeRequest(server, '/api/auth/login', 'POST', {
      email: 'test12345@gmail.com',
      password: 'password123'
    });
    const s1Token = student1Login.body.token || (student1Login.body.data && student1Login.body.data.token);
    const s1Headers = { Authorization: `Bearer ${s1Token}` };

    const student2Login = await makeRequest(server, '/api/auth/login', 'POST', {
      email: 'aarav.s@campus.edu',
      password: 'password123'
    });
    const s2Token = student2Login.body.token || (student2Login.body.data && student2Login.body.data.token);
    const s2Headers = { Authorization: `Bearer ${s2Token}` };

    const tech1Login = await makeRequest(server, '/api/auth/login', 'POST', {
      email: 'marcus.vance@campus.edu',
      password: 'password123'
    });
    const t1Token = tech1Login.body.token || (tech1Login.body.data && tech1Login.body.data.token);
    const t1Headers = { Authorization: `Bearer ${t1Token}` };

    const adminLogin = await makeRequest(server, '/api/auth/login', 'POST', {
      email: 'admin@campus.edu',
      password: 'admin123'
    });
    const adminToken = adminLogin.body.token || (adminLogin.body.data && adminLogin.body.data.token);
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // --- SECTION 1: UNAUTHENTICATED ENFORCEMENT (HTTP 401) ---
    const unauthGet = await makeRequest(server, '/api/tickets', 'GET');
    if (unauthGet.status === 401) {
      console.log('  [PASS] RBAC: Unauthenticated GET /api/tickets rejected with 401');
      passed++;
    } else {
      console.error('  [FAIL] Unauthenticated GET /api/tickets allowed', unauthGet);
      failed++;
    }

    const unauthCreate = await makeRequest(server, '/api/tickets', 'POST', { title: 'Test issue' });
    if (unauthCreate.status === 401) {
      console.log('  [PASS] RBAC: Unauthenticated POST /api/tickets rejected with 401');
      passed++;
    } else {
      console.error('  [FAIL] Unauthenticated POST /api/tickets allowed', unauthCreate);
      failed++;
    }

    // --- SECTION 2: AI PREVIEW (ASSISTIVE GATEWAY) ---
    const previewRes = await makeRequest(server, '/api/tickets/ai-preview', 'POST', {
      text: 'Water leaking under the sink in 2nd floor washroom, Block A'
    });
    if (previewRes.status === 200 && previewRes.body.data.category.toLowerCase().includes('plumb')) {
      console.log('  [PASS] AI preview correctly identifies Plumbing category');
      passed++;
    } else {
      console.error('  [FAIL] AI preview failed', previewRes);
      failed++;
    }

    // --- SECTION 3: STUDENT OPERATIONS & OWNERSHIP ENFORCEMENT ---
    // 3a. Student 1 creates ticket
    const createRes = await makeRequest(server, '/api/tickets', 'POST', {
      title: 'Lab 110 AC blowing warm air during midterms',
      description: 'Split unit AC blowing ambient air. Room temperature is 32C.',
      location: 'Lab 110',
      category: 'HVAC / Cooling',
      priority: 'High'
    }, s1Headers);
    if (createRes.status === 201 && createRes.body.data.ticket_code) {
      console.log('  [PASS] POST /api/tickets creates ticket as Student 1: ' + createRes.body.data.ticket_code);
      passed++;
    } else {
      console.error('  [FAIL] Student ticket creation failed', createRes);
      failed++;
    }

    const createdCode = createRes.body.data.ticket_code;

    // 3b. Student 1 retrieves their newly created ticket
    const getRes = await makeRequest(server, `/api/tickets/${createdCode}`, 'GET', null, s1Headers);
    if (getRes.status === 200 && getRes.body.data.id === createdCode) {
      console.log('  [PASS] GET /api/tickets/:id allows Student 1 to view their own ticket');
      passed++;
    } else {
      console.error('  [FAIL] Student retrieval of own ticket failed', getRes);
      failed++;
    }

    // 3c. Student 1 updates their own ticket note/status
    const updateRes = await makeRequest(server, `/api/tickets/${createdCode}`, 'PUT', {
      note: 'Student provided update: room is getting even hotter'
    }, s1Headers);
    if (updateRes.status === 200) {
      console.log('  [PASS] PUT /api/tickets/:id allows Student 1 to update their own ticket');
      passed++;
    } else {
      console.error('  [FAIL] Student update of own ticket failed', updateRes);
      failed++;
    }

    // 3d. Student 1 lists tickets: backend returns ONLY tickets reported by Student 1
    const s1ListRes = await makeRequest(server, '/api/tickets', 'GET', null, s1Headers);
    const s1Tickets = s1ListRes.body.data;
    const allOwnedByS1 = Array.isArray(s1Tickets) && s1Tickets.every(t => 
      t.reporter_email === 'test12345@gmail.com' || t.studentEmail === 'test12345@gmail.com'
    );
    if (s1ListRes.status === 200 && allOwnedByS1) {
      console.log(`  [PASS] GET /api/tickets as Student 1 strictly returns only their ${s1Tickets.length} tickets`);
      passed++;
    } else {
      console.error('  [FAIL] Student 1 ticket list returned unauthorized tickets', s1ListRes);
      failed++;
    }

    // 3e. Student 1 rejected from viewing Student 2's ticket (CF-1003) with 403
    const s1ForbiddenGet = await makeRequest(server, '/api/tickets/CF-1003', 'GET', null, s1Headers);
    if (s1ForbiddenGet.status === 403 && s1ForbiddenGet.body.message === 'Access denied') {
      console.log('  [PASS] RBAC: Student 1 rejected from viewing Student 2 ticket (CF-1003) with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Student 1 was not rejected from Student 2 ticket with 403', s1ForbiddenGet);
      failed++;
    }

    // 3f. Student 1 rejected from updating Student 2's ticket (CF-1003) with 403
    const s1ForbiddenUpdate = await makeRequest(server, '/api/tickets/CF-1003', 'PUT', {
      note: 'Malicious modification by unauthorized student'
    }, s1Headers);
    if (s1ForbiddenUpdate.status === 403 && s1ForbiddenUpdate.body.message === 'Access denied') {
      console.log('  [PASS] RBAC: Student 1 rejected from updating Student 2 ticket (CF-1003) with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Student 1 was not rejected from updating Student 2 ticket with 403', s1ForbiddenUpdate);
      failed++;
    }

    // 3g. Student 1 rejected from deleting ticket with 403
    const s1ForbiddenDelete = await makeRequest(server, `/api/tickets/${createdCode}`, 'DELETE', null, s1Headers);
    if (s1ForbiddenDelete.status === 403) {
      console.log('  [PASS] RBAC: Student 1 rejected from deleting ticket with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Student 1 was not rejected from DELETE with 403', s1ForbiddenDelete);
      failed++;
    }

    // --- SECTION 4: TECHNICIAN OPERATIONS & ASSIGNMENT ENFORCEMENT ---
    // 4a. Technician 1 rejected from creating new ticket with 403
    const techCreateForbidden = await makeRequest(server, '/api/tickets', 'POST', {
      title: 'Technician attempt to report issue',
      description: 'Technicians do not submit tickets'
    }, t1Headers);
    if (techCreateForbidden.status === 403 && techCreateForbidden.body.message === 'Access denied') {
      console.log('  [PASS] RBAC: Technician rejected from creating tickets (POST /api/tickets) with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Technician was not rejected from POST /api/tickets with 403', techCreateForbidden);
      failed++;
    }

    // 4b. Technician 1 retrieves ticket assigned to them (CF-1001)
    const t1AssignedGet = await makeRequest(server, '/api/tickets/CF-1001', 'GET', null, t1Headers);
    if (t1AssignedGet.status === 200 && t1AssignedGet.body.data.id === 'CF-1001') {
      console.log('  [PASS] GET /api/tickets/:id allows Technician 1 to view assigned ticket (CF-1001)');
      passed++;
    } else {
      console.error('  [FAIL] Technician retrieval of assigned ticket failed', t1AssignedGet);
      failed++;
    }

    // 4c. Technician 1 updates assigned ticket to In Progress
    const t1UpdateProgress = await makeRequest(server, '/api/tickets/CF-1001', 'PUT', {
      status: 'In Progress',
      note: 'Technician on-site evaluating capacitor circuit'
    }, t1Headers);
    if (t1UpdateProgress.status === 200 && t1UpdateProgress.body.data.status === 'In Progress') {
      console.log('  [PASS] PUT /api/tickets/:id allows Technician 1 to transition assigned ticket to In Progress');
      passed++;
    } else {
      console.error('  [FAIL] Technician status update to In Progress failed', t1UpdateProgress);
      failed++;
    }

    // 4d. Technician 1 updates assigned ticket to Resolved
    const t1UpdateResolved = await makeRequest(server, '/api/tickets/CF-1001', 'PUT', {
      status: 'Resolved',
      note: 'Capacitor replaced and tested. Full speed rotation verified.'
    }, t1Headers);
    if (t1UpdateResolved.status === 200 && t1UpdateResolved.body.data.status === 'Resolved' && t1UpdateResolved.body.data.resolvedAt) {
      console.log('  [PASS] PUT /api/tickets/:id allows Technician 1 to resolve assigned ticket with timestamp');
      passed++;
    } else {
      console.error('  [FAIL] Technician resolution update failed', t1UpdateResolved);
      failed++;
    }

    // 4e. Technician 1 lists tickets: backend returns ONLY tickets assigned to Marcus Vance
    const t1ListRes = await makeRequest(server, '/api/tickets', 'GET', null, t1Headers);
    const t1Tickets = t1ListRes.body.data;
    const allAssignedToT1 = Array.isArray(t1Tickets) && t1Tickets.every(t => 
      t.assigned_tech_name === 'Marcus Vance' || t.assignedTech === 'Marcus Vance' || t.assigned_tech_id === 1
    );
    if (t1ListRes.status === 200 && allAssignedToT1) {
      console.log(`  [PASS] GET /api/tickets as Technician 1 strictly returns only their ${t1Tickets.length} assigned tickets`);
      passed++;
    } else {
      console.error('  [FAIL] Technician 1 ticket list returned unassigned tickets', t1ListRes);
      failed++;
    }

    // 4f. Technician 1 rejected from viewing ticket assigned to Elena Rostova (CF-1003) with 403
    const t1ForbiddenGet = await makeRequest(server, '/api/tickets/CF-1003', 'GET', null, t1Headers);
    if (t1ForbiddenGet.status === 403 && t1ForbiddenGet.body.message === 'Access denied') {
      console.log('  [PASS] RBAC: Technician 1 rejected from viewing ticket assigned to another tech (CF-1003) with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Technician 1 was not rejected from viewing other tech ticket with 403', t1ForbiddenGet);
      failed++;
    }

    // 4g. Technician 1 rejected from updating ticket assigned to Elena Rostova (CF-1003) with 403
    const t1ForbiddenUpdate = await makeRequest(server, '/api/tickets/CF-1003', 'PUT', {
      status: 'Resolved',
      note: 'Unauthorized resolution attempt'
    }, t1Headers);
    if (t1ForbiddenUpdate.status === 403 && t1ForbiddenUpdate.body.message === 'Access denied') {
      console.log('  [PASS] RBAC: Technician 1 rejected from updating ticket assigned to another tech with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Technician 1 was not rejected from updating other tech ticket with 403', t1ForbiddenUpdate);
      failed++;
    }

    // 4h. Technician 1 rejected from deleting ticket with 403
    const t1ForbiddenDelete = await makeRequest(server, '/api/tickets/CF-1001', 'DELETE', null, t1Headers);
    if (t1ForbiddenDelete.status === 403) {
      console.log('  [PASS] RBAC: Technician 1 rejected from deleting ticket with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Technician 1 was not rejected from DELETE with 403', t1ForbiddenDelete);
      failed++;
    }

    // --- SECTION 5: ADMIN FULL LIFECYCLE MANAGEMENT ---
    // 5a. Admin lists all tickets across all reporters and technicians
    const adminListRes = await makeRequest(server, '/api/tickets', 'GET', null, adminHeaders);
    if (adminListRes.status === 200 && Array.isArray(adminListRes.body.data) && adminListRes.body.data.length >= 5) {
      console.log(`  [PASS] GET /api/tickets allows Admin to view all tickets (${adminListRes.body.data.length} records)`);
      passed++;
    } else {
      console.error('  [FAIL] Admin ticket list failed', adminListRes);
      failed++;
    }

    // 5b. Admin views any ticket (e.g. Student 2's ticket CF-1003)
    const adminGetAny = await makeRequest(server, '/api/tickets/CF-1003', 'GET', null, adminHeaders);
    if (adminGetAny.status === 200 && adminGetAny.body.data.id === 'CF-1003') {
      console.log('  [PASS] GET /api/tickets/:id allows Admin to view any ticket (CF-1003)');
      passed++;
    } else {
      console.error('  [FAIL] Admin viewing ticket failed', adminGetAny);
      failed++;
    }

    // 5c. Admin updates / manages any ticket (CF-1003)
    const adminUpdateAny = await makeRequest(server, '/api/tickets/CF-1003', 'PUT', {
      status: 'In Progress',
      note: 'Admin expedited priority review'
    }, adminHeaders);
    if (adminUpdateAny.status === 200) {
      console.log('  [PASS] PUT /api/tickets/:id allows Admin to update any ticket (CF-1003)');
      passed++;
    } else {
      console.error('  [FAIL] Admin updating ticket failed', adminUpdateAny);
      failed++;
    }

    // 5d. Admin creates a ticket
    const adminCreate = await makeRequest(server, '/api/tickets', 'POST', {
      title: 'Water chiller overhaul for central computer server room',
      description: 'Scheduled preventive maintenance and coolant replacement',
      location: 'Central Chiller Plant',
      category: 'HVAC / Cooling',
      priority: 'High'
    }, adminHeaders);
    if (adminCreate.status === 201 && adminCreate.body.data.ticket_code) {
      console.log('  [PASS] POST /api/tickets allows Admin to create ticket: ' + adminCreate.body.data.ticket_code);
      passed++;
    } else {
      console.error('  [FAIL] Admin creating ticket failed', adminCreate);
      failed++;
    }

    // 5e. Admin deletes a ticket
    const ticketToDelete = adminCreate.body.data.ticket_code;
    const adminDelete = await makeRequest(server, `/api/tickets/${ticketToDelete}`, 'DELETE', null, adminHeaders);
    if (adminDelete.status === 200 && adminDelete.body.success) {
      console.log('  [PASS] DELETE /api/tickets/:id allows Admin to delete ticket');
      passed++;
    } else {
      console.error('  [FAIL] Admin deleting ticket failed', adminDelete);
      failed++;
    }

    // 5f. Filter tickets by category with Admin token
    const filterRes = await makeRequest(server, '/api/tickets?category=AV%20%2F%20Electrical', 'GET', null, adminHeaders);
    if (filterRes.status === 200 && Array.isArray(filterRes.body.data)) {
      console.log(`  [PASS] Filter by category returns ${filterRes.body.data.length} records`);
      passed++;
    } else {
      console.error('  [FAIL] Filter by category failed', filterRes);
      failed++;
    }

  } finally {
    server.close();
  }

  console.log(`Ticket Tests: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
}

if (require.main === module) {
  runTicketTests().then(res => {
    if (res.failed > 0) process.exit(1);
  });
}

module.exports = runTicketTests;
