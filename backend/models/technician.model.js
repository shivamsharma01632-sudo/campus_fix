/**
 * Technician Model
 */

const db = require('../config/db');

const memoryStore = db.getMemoryStore();
if (memoryStore.technicians.length === 0) {
  memoryStore.technicians = [
    { id: 1, user_id: 4, name: 'Marcus Vance', email: 'marcus.vance@campus.edu', department_id: 1, department_name: 'Electrical Maintenance', specialty: 'AV & High Voltage', active_tickets: 2, resolved_month: 48, rating: 4.90, is_available: 1 },
    { id: 2, user_id: 5, name: 'Elena Rostova', email: 'elena.r@campus.edu', department_id: 2, department_name: 'Civil & Plumbing', specialty: 'Hydraulics & Drainage', active_tickets: 3, resolved_month: 42, rating: 4.80, is_available: 1 },
    { id: 3, user_id: 6, name: 'David Chen', email: 'david.c@campus.edu', department_id: 3, department_name: 'HVAC Operations', specialty: 'Chillers & Compressors', active_tickets: 1, resolved_month: 39, rating: 4.70, is_available: 1 },
    { id: 4, user_id: 7, name: 'Sarah Jenkins', email: 'sarah.j@campus.edu', department_id: 4, department_name: 'Campus IT & Networks', specialty: 'Aruba APs & Fiber Optic', active_tickets: 2, resolved_month: 55, rating: 4.95, is_available: 1 }
  ];
}

const TechnicianModel = {
  async findAll() {
    if (db.isDbConnected()) {
      return await db.query(`
        SELECT t.*, d.name AS department_name 
        FROM technicians t
        LEFT JOIN departments d ON t.department_id = d.id
        ORDER BY t.id ASC
      `);
    }
    return [...memoryStore.technicians];
  },

  async findById(id) {
    if (db.isDbConnected()) {
      const rows = await db.query(`
        SELECT t.*, d.name AS department_name 
        FROM technicians t
        LEFT JOIN departments d ON t.department_id = d.id
        WHERE t.id = ? LIMIT 1
      `, [id]);
      return rows && rows.length > 0 ? rows[0] : null;
    }
    return memoryStore.technicians.find(t => t.id === parseInt(id, 10)) || null;
  },

  async findByUserId(userId) {
    if (!userId) return null;
    if (db.isDbConnected()) {
      const rows = await db.query(`
        SELECT t.*, d.name AS department_name 
        FROM technicians t
        LEFT JOIN departments d ON t.department_id = d.id
        WHERE t.user_id = ? LIMIT 1
      `, [userId]);
      return rows && rows.length > 0 ? rows[0] : null;
    }
    return memoryStore.technicians.find(t => t.user_id === parseInt(userId, 10)) || null;
  },

  async findByEmail(email) {
    if (!email) return null;
    const clean = String(email).trim().toLowerCase();
    if (db.isDbConnected()) {
      const rows = await db.query(`
        SELECT t.*, d.name AS department_name 
        FROM technicians t
        LEFT JOIN departments d ON t.department_id = d.id
        WHERE LOWER(t.email) = ? LIMIT 1
      `, [clean]);
      return rows && rows.length > 0 ? rows[0] : null;
    }
    return memoryStore.technicians.find(t => (t.email || '').toLowerCase() === clean) || null;
  },

  async findByDepartmentId(deptId) {
    if (db.isDbConnected()) {
      return await db.query(`
        SELECT t.*, d.name AS department_name 
        FROM technicians t
        LEFT JOIN departments d ON t.department_id = d.id
        WHERE t.department_id = ? AND t.is_available = 1
        ORDER BY t.active_tickets ASC
      `, [deptId]);
    }
    return memoryStore.technicians.filter(t => t.department_id === parseInt(deptId, 10) && t.is_available === 1);
  },

  async findByName(name) {
    if (db.isDbConnected()) {
      const rows = await db.query(`
        SELECT t.*, d.name AS department_name 
        FROM technicians t
        LEFT JOIN departments d ON t.department_id = d.id
        WHERE t.name LIKE ? LIMIT 1
      `, [`%${name}%`]);
      return rows && rows.length > 0 ? rows[0] : null;
    }
    const clean = String(name).toLowerCase();
    return memoryStore.technicians.find(t => t.name.toLowerCase().includes(clean)) || null;
  },

  async updateWorkload(id, delta) {
    if (db.isDbConnected()) {
      await db.query('UPDATE technicians SET active_tickets = GREATEST(0, active_tickets + ?) WHERE id = ?', [delta, id]);
    } else {
      const tech = memoryStore.technicians.find(t => t.id === parseInt(id, 10));
      if (tech) {
        tech.active_tickets = Math.max(0, (tech.active_tickets || 0) + delta);
      }
    }
  },

  async incrementResolved(id) {
    if (db.isDbConnected()) {
      await db.query('UPDATE technicians SET resolved_month = resolved_month + 1 WHERE id = ?', [id]);
    } else {
      const tech = memoryStore.technicians.find(t => t.id === parseInt(id, 10));
      if (tech) {
        tech.resolved_month = (tech.resolved_month || 0) + 1;
      }
    }
  },

  async updateAvailability(id, isAvailable) {
    const val = isAvailable ? 1 : 0;
    if (db.isDbConnected()) {
      await db.query('UPDATE technicians SET is_available = ? WHERE id = ?', [val, id]);
    } else {
      const tech = memoryStore.technicians.find(t => t.id === parseInt(id, 10));
      if (tech) {
        tech.is_available = val;
      }
    }
    return this.findById(id);
  },

  async create(data) {
    const { name, email, department_id, specialty, rating = 4.8 } = data;
    if (db.isDbConnected()) {
      const res = await db.query(
        'INSERT INTO technicians (name, email, department_id, specialty, rating, is_available) VALUES (?, ?, ?, ?, ?, 1)',
        [name, email, department_id, specialty, rating]
      );
      return { id: res.insertId, ...data };
    }
    const newTech = {
      id: memoryStore.technicians.length + 1,
      name,
      email,
      department_id: parseInt(department_id, 10),
      specialty,
      active_tickets: 0,
      resolved_month: 0,
      rating: parseFloat(rating) || 4.8,
      is_available: 1
    };
    memoryStore.technicians.push(newTech);
    return newTech;
  }
};

module.exports = TechnicianModel;
