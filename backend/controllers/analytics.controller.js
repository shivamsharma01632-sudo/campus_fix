/**
 * Analytics Controller
 * Aggregates operational KPIs, category ratios, SLA metrics, and weekly volume
 */

const TicketModel = require('../models/ticket.model');
const DepartmentModel = require('../models/department.model');
const TechnicianModel = require('../models/technician.model');
const AssetModel = require('../models/asset.model');
const AnalyticsService = require('../services/analytics.service');
const { successResponse } = require('../utils/response');

const AnalyticsController = {
  async getDashboardAnalytics(req, res, next) {
    try {
      const data = await AnalyticsService.getExecutiveDashboard();
      return successResponse(res, data, 'Analytics aggregated successfully');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = AnalyticsController;
