/**
 * CampusFix - Authentication Unit & Integration Tests
 */

const http = require('http');
const app = require('../app');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const express = require('express');
const { authMiddleware } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const testRbacApp = express();
testRbacApp.use(express.json());
testRbacApp.get('/admin-only', authMiddleware, authorize('ADMIN'), (req, res) => {
  res.json({ success: true, message: 'Welcome Admin' });
});
testRbacApp.get('/tech-or-admin', authMiddleware, authorize('TECHNICIAN', 'ADMIN'), (req, res) => {
  res.json({ success: true, message: 'Staff area' });
});
testRbacApp.get('/student-only', authMiddleware, authorize('STUDENT'), (req, res) => {
  res.json({ success: true, message: 'Student area' });
});

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

async function runAuthTests() {
  const server = app.listen(0);
  const rbacServer = testRbacApp.listen(0);
  console.log('\n--- Running Auth Tests ---');
  let passed = 0;
  let failed = 0;

  try {
    // 1. Login with demo student & verify STUDENT JWT payload
    const loginRes = await makeRequest(server, '/api/auth/login', 'POST', {
      email: 'test12345@gmail.com',
      password: 'password123'
    });
    const token = loginRes.body.token || (loginRes.body.data && loginRes.body.data.token);
    const userRole = (loginRes.body.user && loginRes.body.user.role) || (loginRes.body.data && loginRes.body.data.user && loginRes.body.data.user.role);
    let studentJwt = null;
    try {
      studentJwt = token ? jwt.verify(token, env.JWT_SECRET) : null;
    } catch (e) {}

    if (
      loginRes.status === 200 &&
      loginRes.body.success &&
      token &&
      userRole === 'STUDENT' &&
      studentJwt &&
      studentJwt.role === 'STUDENT' &&
      studentJwt.id
    ) {
      console.log('  [PASS] Student login returns user with role STUDENT and JWT containing role STUDENT & id');
      passed++;
    } else {
      console.error('  [FAIL] Student login or JWT role verification failed', { loginRes, studentJwt });
      failed++;
    }

    // 2. Login with demo technician & verify TECHNICIAN JWT payload
    const techLoginRes = await makeRequest(server, '/api/auth/login', 'POST', {
      email: 'marcus.vance@campus.edu',
      password: 'password123'
    });
    const techToken = techLoginRes.body.token || (techLoginRes.body.data && techLoginRes.body.data.token);
    const techUserRole = (techLoginRes.body.user && techLoginRes.body.user.role) || (techLoginRes.body.data && techLoginRes.body.data.user && techLoginRes.body.data.user.role);
    let techJwt = null;
    try {
      techJwt = techToken ? jwt.verify(techToken, env.JWT_SECRET) : null;
    } catch (e) {}

    if (
      techLoginRes.status === 200 &&
      techLoginRes.body.success &&
      techToken &&
      techUserRole === 'TECHNICIAN' &&
      techJwt &&
      techJwt.role === 'TECHNICIAN' &&
      techJwt.id
    ) {
      console.log('  [PASS] Technician login returns user with role TECHNICIAN and JWT containing role TECHNICIAN & id');
      passed++;
    } else {
      console.error('  [FAIL] Technician login or JWT role verification failed', { techLoginRes, techJwt });
      failed++;
    }

    // 3. Login with demo admin & verify ADMIN JWT payload
    const adminLoginRes = await makeRequest(server, '/api/auth/login', 'POST', {
      email: 'admin@campus.edu',
      password: 'admin123'
    });
    const adminToken = adminLoginRes.body.token || (adminLoginRes.body.data && adminLoginRes.body.data.token);
    const adminUserRole = (adminLoginRes.body.user && adminLoginRes.body.user.role) || (adminLoginRes.body.data && adminLoginRes.body.data.user && adminLoginRes.body.data.user.role);
    let adminJwt = null;
    try {
      adminJwt = adminToken ? jwt.verify(adminToken, env.JWT_SECRET) : null;
    } catch (e) {}

    if (
      adminLoginRes.status === 200 &&
      adminLoginRes.body.success &&
      adminToken &&
      adminUserRole === 'ADMIN' &&
      adminJwt &&
      adminJwt.role === 'ADMIN' &&
      adminJwt.id
    ) {
      console.log('  [PASS] Admin login returns user with role ADMIN and JWT containing role ADMIN & id');
      passed++;
    } else {
      console.error('  [FAIL] Admin login or JWT role verification failed', { adminLoginRes, adminJwt });
      failed++;
    }

    // 2. Access /api/auth/me with Bearer token
    const meRes = await makeRequest(server, '/api/auth/me', 'GET', null, {
      Authorization: `Bearer ${token}`
    });
    if (meRes.status === 200 && meRes.body.success && meRes.body.data.email === 'test12345@gmail.com') {
      console.log('  [PASS] GET /api/auth/me returns authenticated user details');
      passed++;
    } else {
      console.error('  [FAIL] GET /api/auth/me failed', meRes);
      failed++;
    }

    // 3. Register new user
    const regEmail = `newuser_${Date.now()}@campus.edu`;
    const regRes = await makeRequest(server, '/api/auth/register', 'POST', {
      name: 'New Student',
      email: regEmail,
      password: 'password123',
      role: 'STUDENT'
    });
    if (regRes.status === 201 && regRes.body.success && regRes.body.data.token) {
      console.log('  [PASS] POST /api/auth/register creates user and returns JWT');
      passed++;
    } else {
      console.error('  [FAIL] Registration failed', regRes);
      failed++;
    }

    // 4. Reject invalid credentials
    const badLogin = await makeRequest(server, '/api/auth/login', 'POST', {
      email: 'test12345@gmail.com',
      password: 'wrong_password_123'
    });
    if (badLogin.status === 401 && !badLogin.body.success) {
      console.log('  [PASS] Login properly rejects invalid password with 401');
      passed++;
    } else {
      console.error('  [FAIL] Invalid password test failed', badLogin);
      failed++;
    }

    // 5. Reject unauthorized access to protected route (missing token)
    const unauthRes = await makeRequest(server, '/api/auth/me', 'GET');
    if (unauthRes.status === 401) {
      console.log('  [PASS] Protected endpoint rejects request without token with 401');
      passed++;
    } else {
      console.error('  [FAIL] Unauthorized request not rejected', unauthRes);
      failed++;
    }

    // 6. Reject invalid token string
    const invalidTokenRes = await makeRequest(server, '/api/auth/me', 'GET', null, {
      Authorization: 'Bearer invalid_malformed_token_string'
    });
    if (invalidTokenRes.status === 401 && !invalidTokenRes.body.success) {
      console.log('  [PASS] Middleware rejects invalid/malformed token with 401');
      passed++;
    } else {
      console.error('  [FAIL] Invalid token was not rejected with 401', invalidTokenRes);
      failed++;
    }

    // 7. Reject expired JWT token
    const expiredToken = jwt.sign(
      { id: 1, role: 'STUDENT', email: 'test12345@gmail.com' },
      env.JWT_SECRET,
      { expiresIn: '0s' }
    );
    // Allow brief tick to guarantee expiration
    const expiredTokenRes = await makeRequest(server, '/api/auth/me', 'GET', null, {
      Authorization: `Bearer ${expiredToken}`
    });
    if (expiredTokenRes.status === 401 && !expiredTokenRes.body.success) {
      console.log('  [PASS] Middleware rejects expired JWT token with 401');
      passed++;
    } else {
      console.error('  [FAIL] Expired token was not rejected with 401', expiredTokenRes);
      failed++;
    }

    // 8. Reject token signed with wrong secret (tampered signature)
    const tamperedToken = jwt.sign(
      { id: 1, role: 'STUDENT', email: 'test12345@gmail.com' },
      'wrong_untrusted_secret_key_123',
      { expiresIn: '1h' }
    );
    const tamperedRes = await makeRequest(server, '/api/auth/me', 'GET', null, {
      Authorization: `Bearer ${tamperedToken}`
    });
    if (tamperedRes.status === 401 && !tamperedRes.body.success) {
      console.log('  [PASS] Middleware rejects token signed with wrong secret with 401');
      passed++;
    } else {
      console.error('  [FAIL] Tampered token was not rejected with 401', tamperedRes);
      failed++;
    }

    // 9. Reject non-Bearer format
    const badFormatRes = await makeRequest(server, '/api/auth/me', 'GET', null, {
      Authorization: 'Basic dXNlcjpwYXNz'
    });
    if (badFormatRes.status === 401 && !badFormatRes.body.success) {
      console.log('  [PASS] Middleware rejects non-Bearer authorization format with 401');
      passed++;
    } else {
      console.error('  [FAIL] Non-Bearer header was not rejected with 401', badFormatRes);
      failed++;
    }

    // 10. Verify valid token attaches user with id and role to req.user (accessible via /api/auth/me)
    const validMeRes = await makeRequest(server, '/api/auth/me', 'GET', null, {
      Authorization: `Bearer ${token}`
    });
    const meUser = validMeRes.body.user || (validMeRes.body.data && validMeRes.body.data);
    if (
      validMeRes.status === 200 &&
      validMeRes.body.success &&
      meUser &&
      meUser.id === 1 &&
      meUser.role === 'STUDENT'
    ) {
      console.log('  [PASS] Middleware extracts id and role, attaches them to req.user');
      passed++;
    } else {
      console.error('  [FAIL] req.user verification failed', validMeRes);
      failed++;
    }

    // 11. RBAC: Deny STUDENT from accessing ADMIN-only route (HTTP 403 Access denied)
    const denyStudentRes = await makeRequest(rbacServer, '/admin-only', 'GET', null, {
      Authorization: `Bearer ${token}`
    });
    if (
      denyStudentRes.status === 403 &&
      denyStudentRes.body.success === false &&
      denyStudentRes.body.message === 'Access denied'
    ) {
      console.log('  [PASS] RBAC: Student access to Admin endpoint denied with 403 {success:false,message:"Access denied"}');
      passed++;
    } else {
      console.error('  [FAIL] RBAC: Student was not denied with 403 Access denied', denyStudentRes);
      failed++;
    }

    // 12. RBAC: Allow ADMIN to access ADMIN-only route (HTTP 200)
    const allowAdminRes = await makeRequest(rbacServer, '/admin-only', 'GET', null, {
      Authorization: `Bearer ${adminToken}`
    });
    if (allowAdminRes.status === 200 && allowAdminRes.body.success) {
      console.log('  [PASS] RBAC: Admin successfully accesses Admin endpoint (HTTP 200)');
      passed++;
    } else {
      console.error('  [FAIL] RBAC: Admin access failed', allowAdminRes);
      failed++;
    }

    // 13. RBAC: Allow TECHNICIAN to access TECHNICIAN/ADMIN multi-role route (HTTP 200)
    const allowTechRes = await makeRequest(rbacServer, '/tech-or-admin', 'GET', null, {
      Authorization: `Bearer ${techToken}`
    });
    if (allowTechRes.status === 200 && allowTechRes.body.success) {
      console.log('  [PASS] RBAC: Technician successfully accesses Technician/Admin endpoint (HTTP 200)');
      passed++;
    } else {
      console.error('  [FAIL] RBAC: Technician access failed', allowTechRes);
      failed++;
    }

    // 14. RBAC: Deny STUDENT from accessing TECHNICIAN/ADMIN route (HTTP 403 Access denied)
    const denyStudentFromTechRes = await makeRequest(rbacServer, '/tech-or-admin', 'GET', null, {
      Authorization: `Bearer ${token}`
    });
    if (
      denyStudentFromTechRes.status === 403 &&
      denyStudentFromTechRes.body.success === false &&
      denyStudentFromTechRes.body.message === 'Access denied'
    ) {
      console.log('  [PASS] RBAC: Student access to Technician/Admin endpoint denied with 403 {success:false,message:"Access denied"}');
      passed++;
    } else {
      console.error('  [FAIL] RBAC: Student was not denied from tech route with 403', denyStudentFromTechRes);
      failed++;
    }

    // 15. RBAC: Deny TECHNICIAN from accessing STUDENT-only route (HTTP 403 Access denied)
    const denyTechFromStudentRes = await makeRequest(rbacServer, '/student-only', 'GET', null, {
      Authorization: `Bearer ${techToken}`
    });
    if (
      denyTechFromStudentRes.status === 403 &&
      denyTechFromStudentRes.body.success === false &&
      denyTechFromStudentRes.body.message === 'Access denied'
    ) {
      console.log('  [PASS] RBAC: Technician access to Student endpoint denied with 403 {success:false,message:"Access denied"}');
      passed++;
    } else {
      console.error('  [FAIL] RBAC: Technician was not denied from student route with 403', denyTechFromStudentRes);
      failed++;
    }

    // 16. RBAC: Unauthenticated request to protected route returns 401
    const unauthRbacRes = await makeRequest(rbacServer, '/admin-only', 'GET');
    if (unauthRbacRes.status === 401) {
      console.log('  [PASS] RBAC: Missing authentication returns HTTP 401');
      passed++;
    } else {
      console.error('  [FAIL] RBAC: Missing authentication did not return 401', unauthRbacRes);
      failed++;
    }

    // 17. Student Routes: STUDENT token successfully accesses /api/student/dashboard (HTTP 200)
    const studentDashRes = await makeRequest(server, '/api/student/dashboard', 'GET', null, {
      Authorization: `Bearer ${token}`
    });
    if (studentDashRes.status === 200 && studentDashRes.body.success && studentDashRes.body.data.stats) {
      console.log('  [PASS] Student Routes: STUDENT token accesses /api/student/dashboard (HTTP 200)');
      passed++;
    } else {
      console.error('  [FAIL] Student dashboard access failed', studentDashRes);
      failed++;
    }

    // 18. Student Routes: STUDENT token successfully accesses /api/student/profile (HTTP 200)
    const studentProfileRes = await makeRequest(server, '/api/student/profile', 'GET', null, {
      Authorization: `Bearer ${token}`
    });
    if (studentProfileRes.status === 200 && studentProfileRes.body.success) {
      console.log('  [PASS] Student Routes: STUDENT token accesses /api/student/profile (HTTP 200)');
      passed++;
    } else {
      console.error('  [FAIL] Student profile access failed', studentProfileRes);
      failed++;
    }

    // 19. Student Routes: Unauthenticated request to /api/student/dashboard returns 401
    const unauthStudentDashRes = await makeRequest(server, '/api/student/dashboard', 'GET');
    if (unauthStudentDashRes.status === 401) {
      console.log('  [PASS] Student Routes: Unauthenticated request to /api/student/dashboard rejected with 401');
      passed++;
    } else {
      console.error('  [FAIL] Unauthenticated request not rejected with 401', unauthStudentDashRes);
      failed++;
    }

    // 20. Student Routes: TECHNICIAN token rejected from /api/student/dashboard (HTTP 403 Access denied)
    const techOnStudentDashRes = await makeRequest(server, '/api/student/dashboard', 'GET', null, {
      Authorization: `Bearer ${techToken}`
    });
    if (
      techOnStudentDashRes.status === 403 &&
      techOnStudentDashRes.body.success === false &&
      techOnStudentDashRes.body.message === 'Access denied'
    ) {
      console.log('  [PASS] Student Routes: TECHNICIAN token rejected from /api/student/dashboard with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Technician not denied with 403 on student dashboard', techOnStudentDashRes);
      failed++;
    }

    // 21. Student Routes: ADMIN token rejected from /api/student/dashboard (HTTP 403 Access denied)
    const adminOnStudentDashRes = await makeRequest(server, '/api/student/dashboard', 'GET', null, {
      Authorization: `Bearer ${adminToken}`
    });
    if (
      adminOnStudentDashRes.status === 403 &&
      adminOnStudentDashRes.body.success === false &&
      adminOnStudentDashRes.body.message === 'Access denied'
    ) {
      console.log('  [PASS] Student Routes: ADMIN token rejected from /api/student/dashboard with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Admin not denied with 403 on student dashboard', adminOnStudentDashRes);
      failed++;
    }

    // 22. Cross-Role: STUDENT token denied from accessing Admin endpoint /api/admin/command-center (HTTP 403)
    const studentOnAdminRes = await makeRequest(server, '/api/admin/command-center', 'GET', null, {
      Authorization: `Bearer ${token}`
    });
    if (
      studentOnAdminRes.status === 403 &&
      studentOnAdminRes.body.success === false &&
      studentOnAdminRes.body.message === 'Access denied'
    ) {
      console.log('  [PASS] Cross-Role: STUDENT token denied from /api/admin/command-center with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Student not denied from admin command-center', studentOnAdminRes);
      failed++;
    }

    // 23. Cross-Role: STUDENT token denied from accessing Technician endpoint /api/technicians/assigned (HTTP 403)
    const studentOnTechRes = await makeRequest(server, '/api/technicians/assigned', 'GET', null, {
      Authorization: `Bearer ${token}`
    });
    if (
      studentOnTechRes.status === 403 &&
      studentOnTechRes.body.success === false &&
      studentOnTechRes.body.message === 'Access denied'
    ) {
      console.log('  [PASS] Cross-Role: STUDENT token denied from /api/technicians/assigned with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Student not denied from technician assigned tickets', studentOnTechRes);
      failed++;
    }

  } finally {
    server.close();
    rbacServer.close();
  }

  console.log(`Auth Tests: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
}

if (require.main === module) {
  runAuthTests().then(res => {
    if (res.failed > 0) process.exit(1);
  });
}

module.exports = runAuthTests;
