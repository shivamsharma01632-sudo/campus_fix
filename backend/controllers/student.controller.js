/**
 * Student Controller
 * Dedicated endpoints for student portal actions
 */

const TicketService = require('../services/ticket.service');
const TicketModel = require('../models/ticket.model');
const UserModel = require('../models/user.model');
const { successResponse, errorResponse } = require('../utils/response');

class StudentController {
  /**
   * GET /api/student/dashboard
   * Returns recent tickets, student stats, and active alerts
   */
  async getDashboard(req, res, next) {
    try {
      const email = req.user ? req.user.email : null;
      const userId = req.user ? req.user.id : null;
      const allTickets = await TicketModel.findAll({});
      const myTickets = allTickets.filter(t => 
        (email && (t.studentEmail === email || t.reporter_email === email)) ||
        (userId && t.reporter_id === userId)
      );

      const resolved = myTickets.filter(t => t.status === 'Resolved').length;
      const open = myTickets.filter(t => t.status !== 'Resolved').length;

      return successResponse(res, {
        stats: {
          totalReported: myTickets.length,
          activeOpen: open,
          resolvedCount: resolved
        },
        recentTickets: myTickets.slice(0, 6),
        user: req.user
      }, 'Student dashboard data retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/student/tickets
   */
  async getMyTickets(req, res, next) {
    try {
      const email = req.user ? req.user.email : null;
      const userId = req.user ? req.user.id : null;
      const { status, search } = req.query;

      const tickets = await TicketModel.findAll({
        reporter_id: userId,
        reporter_email: email,
        status,
        search
      });

      return successResponse(res, tickets, 'Student tickets retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/student/report
   * Report an issue with AI triage
   */
  async reportIssue(req, res, next) {
    try {
      const user = req.user || {
        id: 1,
        name: 'Test12345',
        email: 'tester123@gmail.com',
        role: 'student'
      };

      const result = await TicketService.createTicket(req.body, user);
      return successResponse(res, result.ticket, 'Maintenance ticket created and auto-routed via AI triage', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/student/profile
   */
  async getProfile(req, res, next) {
    try {
      const user = req.user || await UserModel.findByEmail('tester123@gmail.com');
      return successResponse(res, {
        name: user.name || 'Alex Mercer',
        email: user.email || 'tester123@gmail.com',
        room: user.room || 'Hostel Block A, Room 204',
        department: user.department || 'Computer Science & Engineering',
        notifications: {
          emailStatusAlerts: true,
          slaCountdownReminders: true
        }
      }, 'Profile retrieved');
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/student/profile
   */
  async updateProfile(req, res, next) {
    try {
      const { name, room, department } = req.body;
      const user = req.user;
      if (user && user.id) {
        await UserModel.update(user.id, { name, room, department });
      }
      return successResponse(res, { name, room, department }, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new StudentController();
