/**
 * CampusFix - Analytics & Intelligence Tests
 */

const http = require('http');
const app = require('../app');
const AnalyticsService = require('../services/analytics.service');

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

async function runAnalyticsTests() {
  const server = app.listen(0);
  console.log('\n--- Running Analytics & KPI Tests ---');
  let passed = 0;
  let failed = 0;

  try {
    // 1. Analytics Service Direct Call
    const data = await AnalyticsService.getExecutiveDashboard();
    if (data.kpis && data.kpis.dispatchAccuracy === '98.4%') {
      console.log('  [PASS] Analytics service computes 98.4% dispatch accuracy');
      passed++;
    } else {
      console.error('  [FAIL] Dispatch accuracy KPI failed', data);
      failed++;
    }

    if (Array.isArray(data.volumeTrends) && data.volumeTrends.length === 7) {
      console.log('  [PASS] 7-Day volume trends generated successfully');
      passed++;
    } else {
      console.error('  [FAIL] Volume trends failed', data);
      failed++;
    }

    // 2. HTTP GET /api/analytics: RBAC verification
    const unauthRes = await makeRequest(server, '/api/analytics', 'GET');
    if (unauthRes.status === 401) {
      console.log('  [PASS] RBAC: Unauthenticated GET /api/analytics rejected with 401');
      passed++;
    } else {
      console.error('  [FAIL] Unauthenticated analytics access allowed', unauthRes);
      failed++;
    }

    const studentLogin = await makeRequest(server, '/api/auth/login', 'POST', {
      email: 'test12345@gmail.com',
      password: 'password123'
    });
    const sToken = studentLogin.body.token || (studentLogin.body.data && studentLogin.body.data.token);
    const studentRes = await makeRequest(server, '/api/analytics', 'GET', null, { Authorization: `Bearer ${sToken}` });
    if (studentRes.status === 403) {
      console.log('  [PASS] RBAC: Student token rejected on /api/analytics with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Student allowed on analytics', studentRes);
      failed++;
    }

    const techLogin = await makeRequest(server, '/api/auth/login', 'POST', {
      email: 'marcus.vance@campus.edu',
      password: 'password123'
    });
    const tToken = techLogin.body.token || (techLogin.body.data && techLogin.body.data.token);
    const techRes = await makeRequest(server, '/api/analytics', 'GET', null, { Authorization: `Bearer ${tToken}` });
    if (techRes.status === 403) {
      console.log('  [PASS] RBAC: Technician token rejected on /api/analytics with 403 Access denied');
      passed++;
    } else {
      console.error('  [FAIL] Technician allowed on analytics', techRes);
      failed++;
    }

    const adminLogin = await makeRequest(server, '/api/auth/login', 'POST', {
      email: 'admin@campus.edu',
      password: 'admin123'
    });
    const aToken = adminLogin.body.token || (adminLogin.body.data && adminLogin.body.data.token);
    const apiRes = await makeRequest(server, '/api/analytics', 'GET', null, { Authorization: `Bearer ${aToken}` });
    if (apiRes.status === 200 && apiRes.body.data.mttr) {
      console.log('  [PASS] GET /api/analytics returns complete executive telemetry payload for Admin');
      passed++;
    } else {
      console.error('  [FAIL] Analytics API call failed for admin', apiRes);
      failed++;
    }

    if (apiRes.body.data && apiRes.body.data.mttr && apiRes.body.data.mttr.avgRepairTurnaroundHours === 3.6) {
      console.log('  [PASS] MTTR average repair turnaround matches 3.6 hours');
      passed++;
    } else {
      console.error('  [FAIL] MTTR check failed', apiRes);
      failed++;
    }

  } finally {
    server.close();
  }

  console.log(`Analytics Tests: ${passed} passed, ${failed} failed\n`);
  return { passed, failed };
}

if (require.main === module) {
  runAnalyticsTests().then(res => {
    if (res.failed > 0) process.exit(1);
  });
}

module.exports = runAnalyticsTests;
