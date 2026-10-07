/**
 * Technician Controller
 */

const TechnicianModel = require('../models/technician.model');
const TicketModel = require('../models/ticket.model');
const { successResponse, errorResponse } = require('../utils/response');

const TechnicianController = {
  async getAllTechnicians(req, res, next) {
    try {
      const list = await TechnicianModel.findAll();
      return successResponse(res, list, 'Technicians roster retrieved');
    } catch (err) {
      next(err);
    }
  },

  async getTechnicianById(req, res, next) {
    try {
      const tech = await TechnicianModel.findById(req.params.id);
      if (!tech) return errorResponse(res, 'Technician not found', 404);
      return successResponse(res, tech, 'Technician profile');
    } catch (err) {
      next(err);
    }
  },

  async getAssignedTickets(req, res, next) {
    try {
      const user = req.user;
      let techName = user ? user.name : null;
      let techId = user ? user.id : null;

      // Technicians may only query their own assigned queue; only Admins may filter by another technician
      if (user && String(user.role).toUpperCase() === 'ADMIN' && req.query.name) {
        techName = req.query.name;
        techId = req.query.techId || null;
      }

      const filters = {};
      if (techId) {
        filters.assigned_tech_id = techId;
      }
      if (techName) {
        filters.assigned_tech_name = techName;
      }
      if (req.query.status) {
        filters.status = req.query.status;
      }
      const tickets = await TicketModel.findAll(filters);
      return successResponse(res, tickets, 'Assigned tickets retrieved');
    } catch (err) {
      next(err);
    }
  },

  async createTechnician(req, res, next) {
    try {
      const created = await TechnicianModel.create(req.body);
      return successResponse(res, created, 'Technician registered', 201);
    } catch (err) {
      next(err);
    }
  },

  async updateAvailability(req, res, next) {
    try {
      const isAvailable = req.body.isAvailable !== undefined ? req.body.isAvailable : req.body.is_available;
      const updated = await TechnicianModel.updateAvailability(req.params.id, isAvailable);
      return successResponse(res, updated, 'Technician availability updated');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = TechnicianController;
