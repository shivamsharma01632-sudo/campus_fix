/**
 * CampusFix - Admin Executive Operations & RBAC Tests
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

async function runAdminTests() {
  const server = app.listen(0);
  console.log('\n--- Running Admin Operations & RBAC Tests ---');
  let passed = 0;
  let failed = 0;

  try {
    // 0. Authenticate as Admin, Student, and Technician
    const adminLogin = await makeRequest(server, '/api/auth/login', 'POST', {
      email: 'admin@campus.edu',
      password: 'admin123'
    });
    const adminToken = adminLogin.body.token || (adminLogin.body.data && adminLogin.body.data.token);
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    const studentLogin = await makeRequest(server, '/api/auth/login', 'POST', {
      email: 'test12345@gmail.com',
      password: 'password123'
    });
    const studentToken = studentLogin.body.token || (studentLogin.body.data && studentLogin.body.data.token);
    const studentHeaders = { Authorization: `Bearer ${studentToken}` };

    const techLogin = await makeRequest(server, '/api/auth/login', 'POST', {
      email: 'marcus.vance@campus.edu',
      password: 'password123'
    });
    const techToken = techLogin.body.token || (techLogin.body.data && techLogin.body.data.token);
    const techHeaders = { Authorization: `Bearer ${techToken}` };

    // 1. Executive command center summary with Admin token
    const cmdRes = await makeRequest(server, '/api/admin/command-center', 'GET', null, adminHeaders);
    if (cmdRes.status === 200 && cmdRes.body.data.totalTickets >= 5) {
      console.log('  [PASS] GET /api/admin/command-center returns facility KPIs for Admin (HTTP 200)');
      passed++;
    } else {
      console.error('  [FAIL] Command center failed', cmdRes);
      failed++;
    }

    // 2. Reassign ticket to another technician with Admin token
    const reassignRes = await makeRequest(server, '/api/admin/tickets/CF-1004/reassign', 'POST', {
      assigned_tech_id: 1,
      assigned_tech_name: 'Marcus Vance',
      reason: 'Workload rebalance by chief facilities director'
    }, adminHeaders);
    if (reassignRes.status === 200 && reassignRes.body.data.assignedTech === 'Marcus Vance') {
      console.log('  [PASS] POST /api/admin/tickets/:id/reassign successfully changes technician for Admin');
      passed++;
    } else {
      console.error('  [FAIL] Reassignment failed', reassignRes);
      failed++;
    }

    // 3. Priority override with Admin token
    const overrideRes = await makeRequest(server, '/api/admin/tickets/CF-1004/priority', 'PATCH', {
      priority: 'High',
      reason: 'Instructional exam priority upgrade'
    }, adminHeaders);
    if (overrideRes.status === 200 && overrideRes.body.data.priority === 'High') {
      console.log('  [PASS] PATCH /api/admin/tickets/:id/priority upgrades priority level for Admin');
      passed++;
    } else {
      console.error('  [FAIL] Priority override failed', overrideRes);
      failed++;
    }

    // 4. Register new physical plant asset with Admin token
    const assetRes = await makeRequest(server, '/api/assets', 'POST', {
      asset_tag: `GEN-${Date.now()}`,
      name: 'Diesel Backup Generator 500kVA',
      category: 'Electrical',
      location: 'Substation Yard'
    }, adminHeaders);
    if (assetRes.status === 201 && assetRes.body.data.asset_tag) {
      console.log('  [PASS] POST /api/assets registers physical plant asset for Admin (HTTP 201)');
      passed++;
    } else {
      console.error('  [FAIL] Asset registration failed', assetRes);
      failed++;
    }

    // 5. User management: Admin accesses GET /api/users (HTTP 200)
    const usersRes = await makeRequest(server, '/api/users', 'GET', null, adminHeaders);
    if (usersRes.status === 200 && Array.isArray(usersRes.body.data)) {
      console.log(`  [PASS] User management: Admin accesses GET /api/users (${usersRes.body.data.length} users returned)`);
      passed++;
    } else {
      console.error('  [FAIL] Admin user management failed', usersRes);
      failed++;
    }

    // 6. Departments management: Admin accesses GET /api/departments (HTTP 200)
    const deptRes = await makeRequest(server, '/api/departments', 'GET', null, adminHeaders);
    if (deptRes.status === 200 && Array.isArray(deptRes.body.data)) {
      console.log(`  [PASS] Department management: Admin accesses GET /api/departments (${deptRes.body.data.length} depts returned)`);
      passed++;
    } else {
      console.error('  [FAIL] Admin department management failed', deptRes);
      failed++;
    }

    // 7. SLA configuration: Admin accesses GET /api/sla/rules (HTTP 200)
    const slaRulesRes = await makeRequest(server, '/api/sla/rules', 'GET', null, adminHeaders);
    if (slaRulesRes.status === 200 && Array.isArray(slaRulesRes.body.data)) {
      console.log(`  [PASS] SLA configuration: Admin accesses GET /api/sla/rules (${slaRulesRes.body.data.length} rules returned)`);
      passed++;
    } else {
      console.error('  [FAIL] Admin SLA configuration failed', slaRulesRes);
      failed++;
    }

    // 8. System settings: Admin accesses GET /api/admin/settings (HTTP 200)
    const settingsRes = await makeRequest(server, '/api/admin/settings', 'GET', null, adminHeaders);
    if (settingsRes.status === 200 && settingsRes.body.data.storageEngine) {
      console.log('  [PASS] System settings: Admin accesses GET /api/admin/settings (HTTP 200)');
      passed++;
    } else {
      console.error('  [FAIL] Admin system settings failed', settingsRes);
      failed++;
    }

    // --- STUDENT ACCESS DENIAL TESTS (HTTP 403) ---
    // 9. STUDENT token rejected from /api/admin/command-center with 403
    const studentOnCmd = await makeRequest(server, '/api/admin/command-center', 'GET', null, studentHeaders);
    if (studentOnCmd.status === 403 && studentOnCmd.body.message === 'Access denied') {
      console.log('  [PASS] RBAC: Student token rejected from /api/admin/command-center with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Student was not rejected from command-center with 403', studentOnCmd);
      failed++;
    }

    // 10. STUDENT token rejected from User Management /api/users with 403
    const studentOnUsers = await makeRequest(server, '/api/users', 'GET', null, studentHeaders);
    if (studentOnUsers.status === 403 && studentOnUsers.body.message === 'Access denied') {
      console.log('  [PASS] RBAC: Student token rejected from /api/users with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Student was not rejected from /api/users with 403', studentOnUsers);
      failed++;
    }

    // 11. STUDENT token rejected from Department Management /api/departments with 403
    const studentOnDepts = await makeRequest(server, '/api/departments', 'GET', null, studentHeaders);
    if (studentOnDepts.status === 403 && studentOnDepts.body.message === 'Access denied') {
      console.log('  [PASS] RBAC: Student token rejected from /api/departments with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Student was not rejected from /api/departments with 403', studentOnDepts);
      failed++;
    }

    // 12. STUDENT token rejected from Asset Creation /api/assets with 403
    const studentOnAssets = await makeRequest(server, '/api/assets', 'POST', { name: 'Test' }, studentHeaders);
    if (studentOnAssets.status === 403 && studentOnAssets.body.message === 'Access denied') {
      console.log('  [PASS] RBAC: Student token rejected from POST /api/assets with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Student was not rejected from POST /api/assets with 403', studentOnAssets);
      failed++;
    }

    // 13. STUDENT token rejected from SLA configuration /api/sla/rules with 403
    const studentOnSla = await makeRequest(server, '/api/sla/rules', 'GET', null, studentHeaders);
    if (studentOnSla.status === 403 && studentOnSla.body.message === 'Access denied') {
      console.log('  [PASS] RBAC: Student token rejected from /api/sla/rules with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Student was not rejected from /api/sla/rules with 403', studentOnSla);
      failed++;
    }

    // --- TECHNICIAN ACCESS DENIAL TESTS (HTTP 403) ---
    // 14. TECHNICIAN token rejected from /api/admin/command-center with 403
    const techOnCmd = await makeRequest(server, '/api/admin/command-center', 'GET', null, techHeaders);
    if (techOnCmd.status === 403 && techOnCmd.body.message === 'Access denied') {
      console.log('  [PASS] RBAC: Technician token rejected from /api/admin/command-center with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Technician was not rejected from command-center with 403', techOnCmd);
      failed++;
    }

    // 15. TECHNICIAN token rejected from User Management /api/users with 403
    const techOnUsers = await makeRequest(server, '/api/users', 'GET', null, techHeaders);
    if (techOnUsers.status === 403 && techOnUsers.body.message === 'Access denied') {
      console.log('  [PASS] RBAC: Technician token rejected from /api/users with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Technician was not rejected from /api/users with 403', techOnUsers);
      failed++;
    }

    // 16. TECHNICIAN token rejected from Department Management /api/departments with 403
    const techOnDepts = await makeRequest(server, '/api/departments', 'GET', null, techHeaders);
    if (techOnDepts.status === 403 && techOnDepts.body.message === 'Access denied') {
      console.log('  [PASS] RBAC: Technician token rejected from /api/departments with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Technician was not rejected from /api/departments with 403', techOnDepts);
      failed++;
    }

    // 17. TECHNICIAN token rejected from Asset Creation /api/assets with 403
    const techOnAssets = await makeRequest(server, '/api/assets', 'POST', { name: 'Test' }, techHeaders);
    if (techOnAssets.status === 403 && techOnAssets.body.message === 'Access denied') {
      console.log('  [PASS] RBAC: Technician token rejected from POST /api/assets with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Technician was not rejected from POST /api/assets with 403', techOnAssets);
      failed++;
    }

    // 18. TECHNICIAN token rejected from SLA configuration /api/sla/rules with 403
    const techOnSla = await makeRequest(server, '/api/sla/rules', 'GET', null, techHeaders);
    if (techOnSla.status === 403 && techOnSla.body.message === 'Access denied') {
      console.log('  [PASS] RBAC: Technician token rejected from /api/sla/rules with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Technician was not rejected from /api/sla/rules with 403', techOnSla);
      failed++;
    }

    // 19. Unauthenticated request to /api/admin/command-center rejected with 401
    const unauthCmd = await makeRequest(server, '/api/admin/command-center', 'GET');
    if (unauthCmd.status === 401) {
      console.log('  [PASS] RBAC: Unauthenticated request rejected from /api/admin/command-center with 401');
      passed++;
    } else {
      console.error('  [FAIL] Unauthenticated request was not rejected with 401', unauthCmd);
      failed++;
    }

    // 20. Technician profile creation restricted to Admin: Student & Tech denied with 403, Admin succeeds with 201
    const studentTechCreate = await makeRequest(server, '/api/technicians', 'POST', { name: 'Fake Tech' }, studentHeaders);
    if (studentTechCreate.status === 403) {
      console.log('  [PASS] RBAC: Student token rejected from POST /api/technicians with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Student allowed to create technician profile', studentTechCreate);
      failed++;
    }

    const techTechCreate = await makeRequest(server, '/api/technicians', 'POST', { name: 'Fake Tech' }, techHeaders);
    if (techTechCreate.status === 403) {
      console.log('  [PASS] RBAC: Technician token rejected from POST /api/technicians with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Technician allowed to create technician profile', techTechCreate);
      failed++;
    }

    const adminTechCreate = await makeRequest(server, '/api/technicians', 'POST', {
      name: `Specialist Tech ${Date.now()}`,
      email: `tech.${Date.now()}@campus.edu`,
      department_id: 1,
      specialty: 'High Voltage Testing'
    }, adminHeaders);
    if (adminTechCreate.status === 201) {
      console.log('  [PASS] RBAC: Admin successfully registers technician profile (POST /api/technicians HTTP 201)');
      passed++;
    } else {
      console.error('  [FAIL] Admin failed to register technician profile', adminTechCreate);
      failed++;
    }

    // 21. /api/locations: 401 unauthenticated, 200 for authenticated Student/Tech/Admin
    const unauthLoc = await makeRequest(server, '/api/locations', 'GET');
    if (unauthLoc.status === 401) {
      console.log('  [PASS] RBAC: Unauthenticated GET /api/locations rejected with 401');
      passed++;
    } else {
      console.error('  [FAIL] Unauthenticated GET /api/locations allowed', unauthLoc);
      failed++;
    }

    const authLoc = await makeRequest(server, '/api/locations', 'GET', null, studentHeaders);
    if (authLoc.status === 200 && Array.isArray(authLoc.body.data)) {
      console.log(`  [PASS] RBAC: Authenticated user accesses GET /api/locations (${authLoc.body.data.length} locations)`);
      passed++;
    } else {
      console.error('  [FAIL] Authenticated GET /api/locations failed', authLoc);
      failed++;
    }

    // 22. /api/tickets/stats/operations: 401 unauthenticated, 200 for authenticated
    const unauthStats = await makeRequest(server, '/api/tickets/stats/operations', 'GET');
    if (unauthStats.status === 401) {
      console.log('  [PASS] RBAC: Unauthenticated GET /api/tickets/stats/operations rejected with 401');
      passed++;
    } else {
      console.error('  [FAIL] Unauthenticated GET /api/tickets/stats/operations allowed', unauthStats);
      failed++;
    }

  } finally {
    server.close();
  }

  console.log(`Admin Tests: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
}

if (require.main === module) {
  runAdminTests().then(res => {
    if (res.failed > 0) process.exit(1);
  });
}

module.exports = runAdminTests;
