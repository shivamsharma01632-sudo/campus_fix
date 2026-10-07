/**
 * CampusFix Priority Engine
 * Evaluates impact, user density, exam schedules, and safety hazards
 */

const { PRIORITIES } = require('../utils/constants');

const PriorityService = {
  /**
   * Determine normalized priority level
   */
  evaluatePriority(params) {
    const { text = '', category = '', location = '', impact = '', manualOverride = null } = params;

    // Respect explicit manual admin override if provided
    if (manualOverride && Object.values(PRIORITIES).map(p => p.toUpperCase()).includes(manualOverride.toUpperCase())) {
      return manualOverride.charAt(0).toUpperCase() + manualOverride.slice(1).toLowerCase();
    }

    const combined = `${text} ${impact} ${location} ${category}`.toLowerCase();

    // 1. CRITICAL Criteria (Safety hazards, exam halls, server infrastructure, live flooding)
    if (
      combined.includes('spark') ||
      combined.includes('fire') ||
      combined.includes('shock') ||
      combined.includes('smoke') ||
      combined.includes('flood') ||
      combined.includes('exam') ||
      combined.includes('server room') ||
      combined.includes('data center') ||
      combined.includes('substation') ||
      combined.includes('power outage')
    ) {
      return PRIORITIES.CRITICAL;
    }

    // 2. HIGH Criteria (Active classrooms, projectors in lectures, major washroom leaks, lab equipment)
    if (
      combined.includes('projector') ||
      combined.includes('lecture') ||
      combined.includes('class') ||
      combined.includes('lab') ||
      combined.includes('wifi') ||
      combined.includes('internet') ||
      combined.includes('leak') ||
      combined.includes('overflow') ||
      combined.includes('air condition') ||
      combined.includes('ac in')
    ) {
      return PRIORITIES.HIGH;
    }

    // 3. LOW Criteria (Cosmetic, individual furniture, single chair)
    if (
      combined.includes('chair') ||
      combined.includes('desk') ||
      combined.includes('paint') ||
      combined.includes('curtain') ||
      combined.includes('cosmetic') ||
      combined.includes('minor scratch')
    ) {
      return PRIORITIES.LOW;
    }

    // 4. Default to MEDIUM
    return PRIORITIES.MEDIUM;
  }
};

module.exports = PriorityService;
