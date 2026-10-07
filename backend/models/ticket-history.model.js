/**
 * Ticket History Model
 */

const db = require('../config/db');

const TicketHistoryModel = {
  async findByTicketId(ticketId) {
    if (db.isDbConnected()) {
      return await db.query(
        'SELECT status, note, performed_by_name, created_at AS time FROM ticket_history WHERE ticket_id = ? ORDER BY id ASC',
        [ticketId]
      );
    }
    const store = db.getMemoryStore();
    const t = store.tickets.find(item => item.id === ticketId || item.ticket_code === ticketId);
    return t ? t.history || [] : [];
  },

  async addEntry(ticketId, status, note, performedByName = 'System') {
    if (db.isDbConnected()) {
      await db.query(
        'INSERT INTO ticket_history (ticket_id, status, note, performed_by_name) VALUES (?, ?, ?, ?)',
        [ticketId, status, note, performedByName]
      );
    } else {
      const store = db.getMemoryStore();
      const t = store.tickets.find(item => item.id === ticketId || item.ticket_code === ticketId);
      if (t) {
        if (!t.history) t.history = [];
        t.history.push({
          status,
          note,
          performed_by_name: performedByName,
          time: new Date().toISOString()
        });
      }
    }
  }
};

module.exports = TicketHistoryModel;
