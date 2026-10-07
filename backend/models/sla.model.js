/**
 * SLA Rules Model
 */

const db = require('../config/db');

const memoryStore = db.getMemoryStore();
if (memoryStore.sla_rules.length === 0) {
  memoryStore.sla_rules = [
    { id: 1, priority: 'CRITICAL', resolution_time_hours: 1, response_time_minutes: 15 },
    { id: 2, priority: 'HIGH', resolution_time_hours: 4, response_time_minutes: 30 },
    { id: 3, priority: 'MEDIUM', resolution_time_hours: 12, response_time_minutes: 60 },
    { id: 4, priority: 'LOW', resolution_time_hours: 24, response_time_minutes: 120 }
  ];
}

const SLAModel = {
  async findAll() {
    if (db.isDbConnected()) {
      return await db.query('SELECT * FROM sla_rules ORDER BY resolution_time_hours ASC');
    }
    return [...memoryStore.sla_rules];
  },

  async findByPriority(priority) {
    const key = String(priority).toUpperCase();
    if (db.isDbConnected()) {
      const rows = await db.query('SELECT * FROM sla_rules WHERE priority = ? LIMIT 1', [key]);
      return rows && rows.length > 0 ? rows[0] : null;
    }
    return memoryStore.sla_rules.find(s => s.priority === key) || null;
  }
};

module.exports = SLAModel;
