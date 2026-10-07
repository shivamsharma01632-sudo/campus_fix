/**
 * CampusFix Notification Abstraction Service
 * Clean mock adapter for Email, SMS, and Push Notifications
 */

const logger = require('../utils/logger');

const NotificationService = {
  async notifyTicketCreated(ticket) {
    logger.info(`[NOTIFICATION MOCK] Dispatched email/SMS to ${ticket.studentEmail}: "Your ticket ${ticket.id} (${ticket.title}) was received. SLA: ${ticket.slaHours}h."`);
    if (ticket.assignedTech) {
      logger.info(`[NOTIFICATION MOCK] Dispatched push alert to technician ${ticket.assignedTech}: "New ticket ${ticket.id} assigned in ${ticket.location}."`);
    }
    return { success: true, channels: ['EMAIL', 'SMS', 'PUSH'] };
  },

  async notifyStatusUpdated(ticket, oldStatus, newStatus) {
    logger.info(`[NOTIFICATION MOCK] Notification to ${ticket.studentEmail}: "Ticket ${ticket.id} status changed from ${oldStatus} to ${newStatus}."`);
    return { success: true };
  },

  async notifySLABreached(ticket) {
    logger.warn(`[NOTIFICATION MOCK] ESCALATION ALERT sent to Department Head and Admin: "Ticket ${ticket.id} breached SLA deadline (${ticket.slaDeadline})!"`);
    return { success: true, escalated: true };
  }
};

module.exports = NotificationService;
