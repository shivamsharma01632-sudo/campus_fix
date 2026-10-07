/**
 * Ticket Controller
 */

const TicketModel = require('../models/ticket.model');
const TicketService = require('../services/ticket.service');
const AIService = require('../services/ai.service');
const SLAService = require('../services/sla.service');
const { successResponse, errorResponse } = require('../utils/response');

const TicketController = {
  /**
   * GET /api/tickets
   */
  async getTickets(req, res, next) {
    try {
      const user = req.user;
      if (!user) {
        return errorResponse(res, 'Authentication required', 401);
      }

      const role = String(user.role).toUpperCase();
      const filters = {
        status: req.query.status,
        category: req.query.category,
        department: req.query.department,
        priority: req.query.priority,
        search: req.query.search
      };

      if (role === 'STUDENT') {
        // Students may view only their own tickets
        filters.reporter_id = user.id;
        filters.reporter_email = user.email;
      } else if (role === 'TECHNICIAN') {
        // Technicians may view only tickets assigned to them
        const tech = await TicketService.getTechnicianForUser(user);
        if (tech) {
          filters.assigned_tech_id = tech.id;
          filters.assigned_tech_name = tech.name;
        } else {
          filters.assigned_tech_id = user.id;
          filters.assigned_tech_name = user.name;
        }
      } else if (role === 'ADMIN') {
        // Admin may view all tickets with optional filter params
        if (req.query.studentEmail || req.query.reporter_email) {
          filters.reporter_email = req.query.studentEmail || req.query.reporter_email;
        }
        if (req.query.assignedTech || req.query.assigned_tech_name) {
          filters.assigned_tech_name = req.query.assignedTech || req.query.assigned_tech_name;
        }
      } else {
        return errorResponse(res, 'Access denied', 403);
      }

      const tickets = await TicketModel.findAll(filters);

      // Backend security layer: strictly filter down by user ownership / assignment
      const authorizedTickets = [];
      for (const t of tickets) {
        const allowed = await TicketService.canUserAccessTicket(t, user, role);
        if (allowed) {
          authorizedTickets.push(t);
        }
      }

      // Enhance with real-time SLA metrics
      const enhanced = authorizedTickets.map(t => {
        const sla = SLAService.evaluateStatus(t.createdAt, t.slaHours, t.resolvedAt);
        return {
          ...t,
          slaEvaluation: sla
        };
      });

      return successResponse(res, enhanced, `Retrieved ${enhanced.length} tickets`);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/tickets/:id
   */
  async getTicketById(req, res, next) {
    try {
      const user = req.user;
      if (!user) {
        return errorResponse(res, 'Authentication required', 401);
      }

      const ticket = await TicketModel.findByIdOrCode(req.params.id);
      if (!ticket) {
        return errorResponse(res, `Ticket '${req.params.id}' not found`, 404);
      }

      const role = String(user.role).toUpperCase();
      const canAccess = await TicketService.canUserAccessTicket(ticket, user, role);
      if (!canAccess) {
        return errorResponse(res, 'Access denied', 403);
      }

      const slaEvaluation = SLAService.evaluateStatus(ticket.createdAt, ticket.slaHours, ticket.resolvedAt);

      return successResponse(res, { ...ticket, slaEvaluation }, 'Ticket details retrieved');
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/tickets
   */
  async createTicket(req, res, next) {
    try {
      const user = req.user;
      if (!user) {
        return errorResponse(res, 'Authentication required', 401);
      }

      const role = String(user.role).toUpperCase();
      // Students may create tickets. Admin may manage and create tickets. Technicians cannot create tickets.
      if (role !== 'STUDENT' && role !== 'ADMIN') {
        return errorResponse(res, 'Access denied', 403);
      }

      if (req.file) {
        req.body.imageUrl = `/uploads/${req.file.filename}`;
      }

      const ticket = await TicketService.processAndCreateTicket(req.body, user);
      return successResponse(res, ticket, 'Ticket created and auto-routed successfully', 201);
    } catch (err) {
      next(err);
    }
  },

  /**
   * PUT /api/tickets/:id or PATCH /api/tickets/:id
   */
  async updateTicket(req, res, next) {
    try {
      const user = req.user;
      if (!user) {
        return errorResponse(res, 'Authentication required', 401);
      }

      const ticket = await TicketModel.findByIdOrCode(req.params.id);
      if (!ticket) {
        return errorResponse(res, `Ticket '${req.params.id}' not found`, 404);
      }

      const role = String(user.role).toUpperCase();
      const canUpdate = await TicketService.canUserUpdateTicket(ticket, user, role, req.body);
      if (!canUpdate) {
        return errorResponse(res, 'Access denied', 403);
      }

      const updated = await TicketService.updateTicketStatus(req.params.id, req.body, user);
      return successResponse(res, updated, `Ticket ${req.params.id} updated successfully`);
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/tickets/:id
   */
  async deleteTicket(req, res, next) {
    try {
      const user = req.user;
      if (!user) {
        return errorResponse(res, 'Authentication required', 401);
      }

      const role = String(user.role).toUpperCase();
      if (role !== 'ADMIN') {
        return errorResponse(res, 'Access denied', 403);
      }

      const deleted = await TicketModel.delete(req.params.id);
      if (!deleted) {
        return errorResponse(res, `Ticket '${req.params.id}' not found`, 404);
      }
      return successResponse(res, { id: req.params.id }, `Ticket ${req.params.id} deleted`);
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/tickets/stats/operations
   */
  async getOperationsStats(req, res, next) {
    try {
      const stats = await TicketService.getOperationsStats();
      return successResponse(res, stats, 'Operations overview stats');
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/tickets/ai-preview
   */
  async previewAI(req, res, next) {
    try {
      const { text } = req.body;
      const analysis = await AIService.analyzeIssue(text);
      return successResponse(res, analysis, 'AI triage preview generated');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = TicketController;
