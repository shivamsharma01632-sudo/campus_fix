/**
 * CampusFix - Recurrence Engine & Chronic Defect Tests
 */

const http = require('http');
const app = require('../app');
const RecurrenceService = require('../services/recurrence.service');

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

async function runRecurrenceTests() {
  const server = app.listen(0);
  console.log('\n--- Running Recurrence Engine Tests ---');
  let passed = 0;
  let failed = 0;

  try {
    // 1. Audit Projector P-304 recurrence (known chronic asset with 7+ failures)
    const auditResult = await RecurrenceService.checkAndAuditRecurrence('P-304', 'Room 304');
    if (auditResult.isChronic === true && auditResult.count >= 7) {
      console.log(`  [PASS] Recurrence engine flags P-304 as Chronic with ${auditResult.count} failures in 30d`);
      passed++;
    } else {
      console.error('  [FAIL] Chronic asset detection failed', auditResult);
      failed++;
    }

    // 2. Verify recommendation generation
    if (auditResult.recommendation && auditResult.recommendation.toLowerCase().includes('preventive')) {
      console.log('  [PASS] Preventive replacement recommendation generated for chronic defect');
      passed++;
    } else {
      console.error('  [FAIL] Recommendation generation failed', auditResult);
      failed++;
    }

    // 3. Query /api/assets/chronic endpoint: RBAC verification
    const unauthRes = await makeRequest(server, '/api/assets/chronic', 'GET');
    if (unauthRes.status === 401) {
      console.log('  [PASS] RBAC: Unauthenticated GET /api/assets/chronic rejected with 401');
      passed++;
    } else {
      console.error('  [FAIL] Unauthenticated chronic access allowed', unauthRes);
      failed++;
    }

    const studentLogin = await makeRequest(server, '/api/auth/login', 'POST', {
      email: 'test12345@gmail.com',
      password: 'password123'
    });
    const sToken = studentLogin.body.token || (studentLogin.body.data && studentLogin.body.data.token);
    const studentRes = await makeRequest(server, '/api/assets/chronic', 'GET', null, { Authorization: `Bearer ${sToken}` });
    if (studentRes.status === 403) {
      console.log('  [PASS] RBAC: Student token rejected on /api/assets/chronic with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Student allowed on chronic assets', studentRes);
      failed++;
    }

    const techLogin = await makeRequest(server, '/api/auth/login', 'POST', {
      email: 'marcus.vance@campus.edu',
      password: 'password123'
    });
    const tToken = techLogin.body.token || (techLogin.body.data && techLogin.body.data.token);
    const chronicRes = await makeRequest(server, '/api/assets/chronic', 'GET', null, { Authorization: `Bearer ${tToken}` });
    if (chronicRes.status === 200 && Array.isArray(chronicRes.body.data) && chronicRes.body.data.length > 0) {
      console.log(`  [PASS] GET /api/assets/chronic returns ${chronicRes.body.data.length} chronic equipment alerts for Technician`);
      passed++;
    } else {
      console.error('  [FAIL] Chronic assets endpoint failed for technician', chronicRes);
      failed++;
    }

  } finally {
    server.close();
  }

  console.log(`Recurrence Tests: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
}

if (require.main === module) {
  runRecurrenceTests().then(res => {
    if (res.failed > 0) process.exit(1);
  });
}

module.exports = runRecurrenceTests;
