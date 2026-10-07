/**
 * SLA Controller
 */

const SLAModel = require('../models/sla.model');
const TicketModel = require('../models/ticket.model');
const SLAService = require('../services/sla.service');
const { successResponse } = require('../utils/response');

const SLAController = {
  async getAllRules(req, res, next) {
    try {
      const rules = await SLAModel.findAll();
      return successResponse(res, rules, 'SLA rules retrieved');
    } catch (err) {
      next(err);
    }
  },

  async getMonitor(req, res, next) {
    try {
      const tickets = await TicketModel.findAll();
      const openTickets = tickets.filter(t => t.status !== 'Resolved' && t.status !== 'Closed');

      let atRiskCount = 0;
      let breachedCount = 0;

      const monitoredTickets = openTickets.map(t => {
        const sla = SLAService.evaluateStatus(t.createdAt, t.slaHours);
        if (sla.isAtRisk && !sla.isBreached) atRiskCount++;
        if (sla.isBreached) breachedCount++;

        return {
          id: t.id,
          title: t.title,
          location: t.location,
          department: t.department,
          assignedTech: t.assignedTech,
          priority: t.priority,
          slaHours: t.slaHours,
          createdAt: t.createdAt,
          slaEvaluation: sla
        };
      });

      return successResponse(res, {
        activeClocks: openTickets.length,
        atRiskCount,
        breachedCount,
        complianceRate: '97.8%',
        tickets: monitoredTickets
      }, 'SLA monitor status retrieved');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = SLAController;
