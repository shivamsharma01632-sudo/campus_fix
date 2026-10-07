/**
 * CampusFix - Master Integration Test Runner
 * Executes all 7 required test suites
 */

const runAuthTests = require('./auth.test');
const runTicketTests = require('./ticket.test');
const runTechnicianTests = require('./technician.test');
const runAdminTests = require('./admin.test');
const runSLATests = require('./sla.test');
const runRecurrenceTests = require('./recurrence.test');
const runAnalyticsTests = require('./analytics.test');

async function runAllSuites() {
  console.log('========================================================');
  console.log('  CAMPUSFIX BACKEND: RUNNING COMPLETE TEST SUITE');
  console.log('========================================================');

  let totalPassed = 0;
  let totalFailed = 0;

  const suites = [
    { name: 'Authentication Suite', fn: runAuthTests },
    { name: 'Ticket Lifecycle Suite', fn: runTicketTests },
    { name: 'Technician Management Suite', fn: runTechnicianTests },
    { name: 'Admin Executive Suite', fn: runAdminTests },
    { name: 'Dynamic SLA Engine Suite', fn: runSLATests },
    { name: 'Recurrence & Chronic Suite', fn: runRecurrenceTests },
    { name: 'Analytics & Telemetry Suite', fn: runAnalyticsTests }
  ];

  for (const suite of suites) {
    try {
      const res = await suite.fn();
      totalPassed += res.passed;
      totalFailed += res.failed;
    } catch (err) {
      console.error(`Error executing ${suite.name}:`, err);
      totalFailed++;
    }
  }

  console.log('========================================================');
  console.log(`  FINAL RESULTS: ${totalPassed} PASSED, ${totalFailed} FAILED`);
  console.log('========================================================\n');

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runAllSuites();
