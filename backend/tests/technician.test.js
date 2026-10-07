/**
 * CampusFix - Technician Management & RBAC Tests
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

async function runTechnicianTests() {
  const server = app.listen(0);
  console.log('\n--- Running Technician Workload & RBAC Tests ---');
  let passed = 0;
  let failed = 0;

  try {
    // 0. Authenticate as Technician, Student, and Admin
    const techLogin = await makeRequest(server, '/api/auth/login', 'POST', {
      email: 'marcus.vance@campus.edu',
      password: 'password123'
    });
    const techToken = techLogin.body.token || (techLogin.body.data && techLogin.body.data.token);
    const techHeaders = { Authorization: `Bearer ${techToken}` };

    const studentLogin = await makeRequest(server, '/api/auth/login', 'POST', {
      email: 'test12345@gmail.com',
      password: 'password123'
    });
    const studentToken = studentLogin.body.token || (studentLogin.body.data && studentLogin.body.data.token);
    const studentHeaders = { Authorization: `Bearer ${studentToken}` };

    const adminLogin = await makeRequest(server, '/api/auth/login', 'POST', {
      email: 'admin@campus.edu',
      password: 'admin123'
    });
    const adminToken = adminLogin.body.token || (adminLogin.body.data && adminLogin.body.data.token);
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // 1. Fetch technician roster with Technician token
    const rosterRes = await makeRequest(server, '/api/technicians', 'GET', null, techHeaders);
    if (rosterRes.status === 200 && Array.isArray(rosterRes.body.data) && rosterRes.body.data.length >= 4) {
      console.log(`  [PASS] GET /api/technicians with Technician token returns roster of ${rosterRes.body.data.length} technicians`);
      passed++;
    } else {
      console.error('  [FAIL] Technician roster fetch failed', rosterRes);
      failed++;
    }

    // 2. Fetch specific technician details with Technician token
    const techRes = await makeRequest(server, '/api/technicians/1', 'GET', null, techHeaders);
    if (techRes.status === 200 && techRes.body.data.name.includes('Marcus Vance')) {
      console.log('  [PASS] GET /api/technicians/:id with Technician token retrieves Marcus Vance profile');
      passed++;
    } else {
      console.error('  [FAIL] Technician profile fetch failed', techRes);
      failed++;
    }

    // 3. Verify workload calculation
    const workload = techRes.body.data.activeTasks || techRes.body.data.active_tickets;
    if (typeof workload === 'number' && workload >= 0) {
      console.log(`  [PASS] Workload verified: ${workload} active tasks`);
      passed++;
    } else {
      console.error('  [FAIL] Workload check failed', techRes);
      failed++;
    }

    // 4. Update technician availability with Technician token
    const availRes = await makeRequest(server, '/api/technicians/1/availability', 'PATCH', {
      isAvailable: true
    }, techHeaders);
    if (availRes.status === 200) {
      console.log('  [PASS] PATCH /api/technicians/:id/availability updates on-duty status');
      passed++;
    } else {
      console.error('  [FAIL] Availability update failed', availRes);
      failed++;
    }

    // 5. Fetch assigned tickets queue with Technician token (Technician-only endpoint)
    const assignedRes = await makeRequest(server, '/api/technicians/assigned', 'GET', null, techHeaders);
    if (assignedRes.status === 200 && assignedRes.body.success) {
      console.log('  [PASS] GET /api/technicians/assigned succeeds with Technician token (HTTP 200)');
      passed++;
    } else {
      console.error('  [FAIL] Assigned tickets fetch failed', assignedRes);
      failed++;
    }

    // 6. RBAC: Reject STUDENT token on technician roster with 403
    const studentOnRoster = await makeRequest(server, '/api/technicians', 'GET', null, studentHeaders);
    if (studentOnRoster.status === 403 && studentOnRoster.body.message === 'Access denied') {
      console.log('  [PASS] RBAC: Student token rejected on /api/technicians with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Student was not rejected on roster with 403', studentOnRoster);
      failed++;
    }

    // 7. RBAC: Reject STUDENT token on assigned tickets with 403
    const studentOnAssigned = await makeRequest(server, '/api/technicians/assigned', 'GET', null, studentHeaders);
    if (studentOnAssigned.status === 403 && studentOnAssigned.body.message === 'Access denied') {
      console.log('  [PASS] RBAC: Student token rejected on /api/technicians/assigned with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Student was not rejected on assigned tickets with 403', studentOnAssigned);
      failed++;
    }

    // 8. RBAC: Reject STUDENT token on availability update with 403
    const studentOnAvail = await makeRequest(server, '/api/technicians/1/availability', 'PATCH', { isAvailable: false }, studentHeaders);
    if (studentOnAvail.status === 403 && studentOnAvail.body.message === 'Access denied') {
      console.log('  [PASS] RBAC: Student token rejected on /api/technicians/:id/availability with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Student was not rejected on availability update with 403', studentOnAvail);
      failed++;
    }

    // 9. RBAC: Reject unauthenticated request on technician route with 401
    const unauthRes = await makeRequest(server, '/api/technicians', 'GET');
    if (unauthRes.status === 401) {
      console.log('  [PASS] RBAC: Unauthenticated request rejected on /api/technicians with 401');
      passed++;
    } else {
      console.error('  [FAIL] Unauthenticated request not rejected with 401', unauthRes);
      failed++;
    }

    // 10. RBAC: Allow ADMIN token on shared technician endpoints (HTTP 200)
    const adminOnRoster = await makeRequest(server, '/api/technicians', 'GET', null, adminHeaders);
    if (adminOnRoster.status === 200 && adminOnRoster.body.success) {
      console.log('  [PASS] RBAC: Admin token allowed on shared /api/technicians endpoint (HTTP 200)');
      passed++;
    } else {
      console.error('  [FAIL] Admin was not allowed on technician roster', adminOnRoster);
      failed++;
    }

    // 11. RBAC: Deny ADMIN token on strictly technician-only endpoint /api/technicians/assigned (HTTP 403)
    const adminOnAssigned = await makeRequest(server, '/api/technicians/assigned', 'GET', null, adminHeaders);
    if (adminOnAssigned.status === 403 && adminOnAssigned.body.message === 'Access denied') {
      console.log('  [PASS] RBAC: Admin token rejected on technician-only /api/technicians/assigned with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Admin was not rejected on technician-only assigned tickets', adminOnAssigned);
      failed++;
    }

  } finally {
    server.close();
  }

  console.log(`Technician Tests: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
}

if (require.main === module) {
  runTechnicianTests().then(res => {
    if (res.failed > 0) process.exit(1);
  });
}

module.exports = runTechnicianTests;
