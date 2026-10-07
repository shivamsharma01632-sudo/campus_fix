/**
 * CampusFix - SLA Service & Monitor Integration Tests
 */

const http = require('http');
const app = require('../app');
const SLAService = require('../services/sla.service');

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

async function runSLATests() {
  const server = app.listen(0);
  console.log('\n--- Running Dynamic SLA Engine Tests ---');
  let passed = 0;
  let failed = 0;

  try {
    // 1. SLA Unit calculation: Critical priority -> 1 hour
    const critRule = SLAService.calculateSLA('Critical', 'HVAC');
    if (critRule.hours === 1) {
      console.log('  [PASS] Critical priority calculates 1 hour SLA window');
      passed++;
    } else {
      console.error('  [FAIL] Critical SLA calculation failed', critRule);
      failed++;
    }

    // 2. SLA Unit calculation: High priority -> 4 hours
    const highRule = SLAService.calculateSLA('High', 'AV Equipment');
    if (highRule.hours === 4) {
      console.log('  [PASS] High priority calculates 4 hours SLA window');
      passed++;
    } else {
      console.error('  [FAIL] High SLA calculation failed', highRule);
      failed++;
    }

    // 3. Status Evaluation: Overdue calculation
    const pastCreated = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const evalOverdue = SLAService.evaluateStatus(pastCreated, 4, null);
    if (evalOverdue.status === 'OVERDUE' && evalOverdue.isOverdue === true) {
      console.log('  [PASS] Past-due ticket flagged as OVERDUE with negative countdown');
      passed++;
    } else {
      console.error('  [FAIL] Overdue evaluation failed', evalOverdue);
      failed++;
    }

    // 4. Status Evaluation: On Track calculation
    const recentCreated = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const evalOnTrack = SLAService.evaluateStatus(recentCreated, 4, null);
    if (evalOnTrack.status === 'ON_TRACK' && evalOnTrack.isOverdue === false) {
      console.log('  [PASS] Recent ticket classified as ON_TRACK');
      passed++;
    } else {
      console.error('  [FAIL] On Track evaluation failed', evalOnTrack);
      failed++;
    }

    // 5. Query /api/sla/monitor endpoint: RBAC verification
    const unauthRes = await makeRequest(server, '/api/sla/monitor', 'GET');
    if (unauthRes.status === 401) {
      console.log('  [PASS] RBAC: Unauthenticated GET /api/sla/monitor rejected with 401');
      passed++;
    } else {
      console.error('  [FAIL] Unauthenticated monitor access allowed', unauthRes);
      failed++;
    }

    const studentLogin = await makeRequest(server, '/api/auth/login', 'POST', {
      email: 'test12345@gmail.com',
      password: 'password123'
    });
    const sToken = studentLogin.body.token || (studentLogin.body.data && studentLogin.body.data.token);
    const studentRes = await makeRequest(server, '/api/sla/monitor', 'GET', null, { Authorization: `Bearer ${sToken}` });
    if (studentRes.status === 403) {
      console.log('  [PASS] RBAC: Student token rejected on /api/sla/monitor with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Student allowed on SLA monitor', studentRes);
      failed++;
    }

    const techLogin = await makeRequest(server, '/api/auth/login', 'POST', {
      email: 'marcus.vance@campus.edu',
      password: 'password123'
    });
    const tToken = techLogin.body.token || (techLogin.body.data && techLogin.body.data.token);
    const monitorRes = await makeRequest(server, '/api/sla/monitor', 'GET', null, { Authorization: `Bearer ${tToken}` });
    if (monitorRes.status === 200 && monitorRes.body.data.activeClocks) {
      console.log(`  [PASS] GET /api/sla/monitor returns active clocks and compliance: ${monitorRes.body.data.complianceRate}`);
      passed++;
    } else {
      console.error('  [FAIL] SLA monitor endpoint failed', monitorRes);
      failed++;
    }

  } finally {
    server.close();
  }

  console.log(`SLA Tests: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
}

if (require.main === module) {
  runSLATests().then(res => {
    if (res.failed > 0) process.exit(1);
  });
}

module.exports = runSLATests;
