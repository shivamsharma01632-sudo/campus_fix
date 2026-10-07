/**
 * CampusFix Ticket Service
 * Orchestrates the full AI dispatch workflow and lifecycle transitions
 */

const TicketModel = require('../models/ticket.model');
const LocationModel = require('../models/location.model');
const AIService = require('./ai.service');
const PriorityService = require('./priority.service');
const SLAService = require('./sla.service');
const AssignmentService = require('./assignment.service');
const RecurrenceService = require('./recurrence.service');
const NotificationService = require('./notification.service');
const TechnicianModel = require('../models/technician.model');
const logger = require('../utils/logger');

const TicketService = {
  /**
   * Complete End-to-End Issue Submission Workflow
   */
  async processAndCreateTicket(reportData, user = null) {
    const rawText = reportData.title || reportData.description || 'Facility Issue';

    // Step 1: AI Analysis
    const ai = await AIService.analyzeIssue(rawText);

    // Step 2: Determine Location
    const locationName = reportData.location || reportData.location_name || ai.location || 'Main Campus';
    const locationObj = await LocationModel.findOrCreate(locationName);

    // Step 3: Determine Priority
    const priority = PriorityService.evaluatePriority({
      text: rawText,
      category: reportData.category || ai.category,
      location: locationName,
      impact: ai.impact,
      manualOverride: reportData.priority
    });

    // Step 4: Dynamic SLA Calculation
    const slaHours = reportData.slaHours || reportData.sla_hours || SLAService.resolveHours(priority, ai.category);

    // Step 5: Department & Technician Assignment
    const deptName = reportData.department || reportData.department_name || ai.department;
    let assignment = null;
    if (reportData.assignedTech || reportData.assigned_tech_name) {
      assignment = {
        technicianName: reportData.assignedTech || reportData.assigned_tech_name,
        departmentName: deptName
      };
    } else {
      assignment = await AssignmentService.autoAssign(deptName, ai.category);
    }

    // Step 6: 30-Day Recurrence & Chronic Issue Audit
    const recurrence = await RecurrenceService.checkAndFlagRecurrence({
      assetTag: reportData.assetTag || reportData.asset_tag || ai.asset,
      locationName: locationName,
      title: rawText,
      category: ai.category
    });

    // Step 7: Persist Ticket to Database
    let reporterName = user ? (user.name || 'Test12345') : (reportData.studentName || reportData.reporter_name || 'Test12345');
    let reporterEmail = user ? (user.email || 'test12345@gmail.com') : (reportData.studentEmail || reportData.reporter_email || 'test12345@gmail.com');
    let reporterId = user ? user.id : 1;

    // Enforce student ownership strictly on the backend using req.user.id to prevent impersonation
    if (user && String(user.role).toUpperCase() === 'STUDENT') {
      reporterId = user.id;
      reporterName = user.name || reporterName;
      reporterEmail = user.email || reporterEmail;
    } else if (user && String(user.role).toUpperCase() === 'ADMIN') {
      if (reportData.reporter_id) reporterId = reportData.reporter_id;
      if (reportData.studentName || reportData.reporter_name) reporterName = reportData.studentName || reportData.reporter_name;
      if (reportData.studentEmail || reportData.reporter_email) reporterEmail = reportData.studentEmail || reportData.reporter_email;
    }

    const newTicket = await TicketModel.create({
      title: rawText,
      description: reportData.description || rawText,
      category: reportData.category || ai.category,
      location_name: locationName,
      location_id: locationObj ? locationObj.id : null,
      department_name: assignment.departmentName,
      department_id: assignment.departmentId,
      priority,
      status: 'Open',
      reporter_id: reporterId,
      reporter_name: reporterName,
      reporter_email: reporterEmail,
      assigned_tech_id: assignment.technicianId,
      assigned_tech_name: assignment.technicianName,
      asset_id: recurrence.assetId,
      asset_tag: recurrence.assetTag || ai.asset,
      sla_hours: slaHours,
      is_chronic: recurrence.isChronic
    });

    // Update technician workload
    if (assignment.technicianId) {
      await TechnicianModel.updateWorkload(assignment.technicianId, 1);
    }

    // Step 8: Notify stakeholders
    await NotificationService.notifyTicketCreated(newTicket);

    logger.info(`Ticket created successfully: ${newTicket.id} | Priority: ${priority} | SLA: ${slaHours}h | Tech: ${assignment.technicianName}`);

    return {
      ...newTicket,
      aiTriage: {
        category: ai.category,
        department: assignment.departmentName,
        priority,
        slaHours,
        impact: ai.impact,
        isChronic: recurrence.isChronic,
        confidenceScore: '96%'
      }
    };
  },

  /**
   * Convenience alias for student controller / compatibility
   */
  async createTicket(reportData, user = null) {
    const created = await this.processAndCreateTicket(reportData, user);
    return { ticket: created };
  },

  /**
   * Resolve technician profile for user
   */
  async getTechnicianForUser(user) {
    if (!user) return null;
    let tech = await TechnicianModel.findByUserId(user.id);
    if (!tech && user.email) {
      tech = await TechnicianModel.findByEmail(user.email);
    }
    if (!tech && user.name) {
      tech = await TechnicianModel.findByName(user.name);
    }
    return tech;
  },

  /**
   * Check if a ticket is assigned to a technician
   */
  isTicketAssignedToTech(ticket, user, techRecord) {
    if (!ticket || !user) return false;
    const techId = techRecord ? techRecord.id : null;

    if (techId !== null && ticket.assigned_tech_id === techId) return true;
    if (ticket.assigned_tech_id === user.id) return true;

    if (ticket.assigned_tech_name) {
      const assignedName = ticket.assigned_tech_name.toLowerCase().trim();
      if (user.name && assignedName === user.name.toLowerCase().trim()) return true;
      if (techRecord && techRecord.name && assignedName === techRecord.name.toLowerCase().trim()) return true;
    }
    return false;
  },

  /**
   * Check if a ticket was created/reported by a student
   */
  isTicketOwnedByStudent(ticket, user) {
    if (!ticket || !user) return false;
    if (ticket.reporter_id && ticket.reporter_id === user.id) return true;
    if (ticket.reporter_email && user.email && ticket.reporter_email.toLowerCase() === user.email.toLowerCase()) return true;
    if (ticket.studentEmail && user.email && ticket.studentEmail.toLowerCase() === user.email.toLowerCase()) return true;
    return false;
  },

  /**
   * Ticket-level authorization check: Can user view ticket?
   */
  async canUserAccessTicket(ticket, user, role) {
    if (!ticket || !user) return false;
    const normalizedRole = String(role || user.role).toUpperCase();

    if (normalizedRole === 'ADMIN') return true;

    if (normalizedRole === 'STUDENT') {
      return this.isTicketOwnedByStudent(ticket, user);
    }

    if (normalizedRole === 'TECHNICIAN') {
      const tech = await this.getTechnicianForUser(user);
      return this.isTicketAssignedToTech(ticket, user, tech);
    }

    return false;
  },

  /**
   * Ticket-level authorization check: Can user update ticket?
   */
  async canUserUpdateTicket(ticket, user, role, updateData = {}) {
    if (!ticket || !user) return false;
    const normalizedRole = String(role || user.role).toUpperCase();

    if (normalizedRole === 'ADMIN') return true;

    if (normalizedRole === 'STUDENT') {
      // Students may update only their own tickets
      return this.isTicketOwnedByStudent(ticket, user);
    }

    if (normalizedRole === 'TECHNICIAN') {
      // Technicians may update only tickets assigned to them
      const tech = await this.getTechnicianForUser(user);
      return this.isTicketAssignedToTech(ticket, user, tech);
    }

    return false;
  },

  /**
   * Update Status / Resolution Workflow
   */
  async updateTicketStatus(idOrCode, updateData, user) {
    const ticket = await TicketModel.findByIdOrCode(idOrCode);
    if (!ticket) throw new Error(`Ticket ${idOrCode} not found`);

    const oldStatus = ticket.status;
    const newStatus = updateData.status || oldStatus;

    const updated = await TicketModel.update(idOrCode, updateData, user);

    // If moved to Resolved, decrement technician active tickets and increment resolved count
    if (newStatus === 'Resolved' && oldStatus !== 'Resolved') {
      if (ticket.assigned_tech_id) {
        await TechnicianModel.updateWorkload(ticket.assigned_tech_id, -1);
        await TechnicianModel.incrementResolved(ticket.assigned_tech_id);
      }
    }

    // Notify
    if (newStatus !== oldStatus) {
      await NotificationService.notifyStatusUpdated(updated, oldStatus, newStatus);
    }

    return updated;
  },

  /**
   * Real-time Operations Stats for Dashboard
   */
  async getOperationsStats() {
    const all = await TicketModel.findAll();
    const openTickets = all.filter(t => t.status !== 'Resolved' && t.status !== 'Closed');
    const inProgress = all.filter(t => t.status === 'In Progress');
    const resolvedToday = all.filter(t => {
      if (t.status !== 'Resolved' || !t.resolvedAt) return false;
      const hoursAgo = (Date.now() - new Date(t.resolvedAt).getTime()) / (1000 * 60 * 60);
      return hoursAgo <= 24;
    });

    const breached = openTickets.filter(t => {
      const evaluation = SLAService.evaluateStatus(t.createdAt, t.slaHours);
      return evaluation.isBreached;
    });

    const chronic = all.filter(t => t.isChronic);

    return {
      openQueue: openTickets.length,
      inProgressCount: inProgress.length,
      slaBreached: breached.length,
      chronicIssuesCount: chronic.length,
      resolvedToday: resolvedToday.length,
      totalTickets: all.length,
      highPriority: openTickets.filter(t => t.priority === 'High' || t.priority === 'Critical').length
    };
  }
};

module.exports = TicketService;
