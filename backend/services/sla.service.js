/**
 * CampusFix SLA Engine
 * Computes dynamic resolution windows, deadlines, and real-time compliance metrics
 */

const { SLA_HOURS } = require('../utils/constants');

const SLAService = {
  /**
   * Determine guaranteed resolution window in hours
   */
  /**
   * Determine guaranteed resolution window in hours
   */
  resolveHours(priority, category = '') {
    const p = String(priority).toUpperCase();
    if (p === 'CRITICAL') return SLA_HOURS.CRITICAL;
    if (p === 'HIGH') return SLA_HOURS.HIGH;
    if (p === 'LOW') return SLA_HOURS.LOW;
    return SLA_HOURS.MEDIUM;
  },

  /**
   * Calculate SLA rule details
   */
  calculateSLA(priority, category = '') {
    const hours = this.resolveHours(priority, category);
    return {
      priority,
      category,
      hours,
      responseMinutes: hours <= 1 ? 15 : (hours <= 4 ? 30 : 60),
      deadline: this.calculateDeadline(new Date(), hours)
    };
  },

  /**
   * Calculate absolute deadline from start timestamp
   */
  calculateDeadline(createdAt, hours) {
    const start = createdAt ? new Date(createdAt).getTime() : Date.now();
    return new Date(start + hours * 60 * 60 * 1000);
  },

  /**
   * Calculate real-time SLA metrics from backend timestamps
   */
  evaluateStatus(createdAt, slaHours = 4, resolvedAt = null) {
    if (resolvedAt) {
      const created = new Date(createdAt).getTime();
      const resolved = new Date(resolvedAt).getTime();
      const allowedMs = slaHours * 60 * 60 * 1000;
      const met = (resolved - created) <= allowedMs;
      return {
        status: met ? 'RESOLVED_ON_TIME' : 'RESOLVED_LATE',
        isBreached: !met,
        isOverdue: !met,
        isAtRisk: false,
        percentageElapsed: 100,
        label: met ? 'Resolved on time' : 'Resolved after SLA deadline'
      };
    }

    const created = new Date(createdAt).getTime();
    const totalMs = slaHours * 60 * 60 * 1000;
    const deadline = created + totalMs;
    const now = Date.now();
    const diff = deadline - now;

    if (diff <= 0) {
      const breachedMinutes = Math.abs(Math.floor(diff / 60000));
      const breachedHours = Math.floor(breachedMinutes / 60);
      return {
        status: 'OVERDUE',
        isBreached: true,
        isOverdue: true,
        isAtRisk: true,
        percentageElapsed: 100,
        remainingHours: 0,
        remainingMinutes: 0,
        label: breachedHours > 0 ? `Breached by ${breachedHours}h` : `Breached by ${breachedMinutes}m`
      };
    }

    const elapsedMs = totalMs - diff;
    const percentage = Math.min(100, Math.round((elapsedMs / totalMs) * 100));
    const remainingHours = Math.floor(diff / (60 * 60 * 1000));
    const remainingMinutes = Math.floor((diff % (60 * 60 * 1000)) / 60000);

    const isAtRisk = percentage >= 75;

    return {
      status: isAtRisk ? 'AT_RISK' : 'ON_TRACK',
      isBreached: false,
      isOverdue: false,
      isAtRisk,
      percentageElapsed: percentage,
      remainingHours,
      remainingMinutes,
      label: remainingHours > 0 ? `${remainingHours}h ${remainingMinutes}m left` : `${remainingMinutes}m left`
    };
  }
};

module.exports = SLAService;
