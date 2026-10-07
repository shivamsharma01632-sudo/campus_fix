/**
 * Department Model
 */

const db = require('../config/db');

const memoryStore = db.getMemoryStore();
if (memoryStore.departments.length === 0) {
  memoryStore.departments = [
    { id: 1, name: 'Electrical Maintenance', head_name: 'Robert Martinez', total_staff: 8, avg_resolution_hours: 3.2, sla_compliance: '97%' },
    { id: 2, name: 'Civil & Plumbing', head_name: 'Walter White', total_staff: 6, avg_resolution_hours: 4.1, sla_compliance: '94%' },
    { id: 3, name: 'HVAC Operations', head_name: 'Gus Fring', total_staff: 5, avg_resolution_hours: 2.8, sla_compliance: '98%' },
    { id: 4, name: 'Campus IT & Networks', head_name: 'Grace Hopper', total_staff: 7, avg_resolution_hours: 1.9, sla_compliance: '99%' },
    { id: 5, name: 'Campus Facilities', head_name: 'Arthur Dent', total_staff: 12, avg_resolution_hours: 5.4, sla_compliance: '92%' }
  ];
}

const DepartmentModel = {
  async findAll() {
    if (db.isDbConnected()) {
      return await db.query('SELECT * FROM departments ORDER BY id ASC');
    }
    return [...memoryStore.departments];
  },

  async findById(id) {
    if (db.isDbConnected()) {
      const rows = await db.query('SELECT * FROM departments WHERE id = ? LIMIT 1', [id]);
      return rows && rows.length > 0 ? rows[0] : null;
    }
    return memoryStore.departments.find(d => d.id === parseInt(id, 10)) || null;
  },

  async findByName(name) {
    if (db.isDbConnected()) {
      const rows = await db.query('SELECT * FROM departments WHERE name LIKE ? LIMIT 1', [`%${name}%`]);
      return rows && rows.length > 0 ? rows[0] : null;
    }
    const clean = String(name).toLowerCase();
    return memoryStore.departments.find(d => d.name.toLowerCase().includes(clean)) || null;
  },

  async create(deptData) {
    const { name, head_name, total_staff = 1, avg_resolution_hours = 4.0, sla_compliance = '95%' } = deptData;
    if (db.isDbConnected()) {
      const result = await db.query(
        'INSERT INTO departments (name, head_name, total_staff, avg_resolution_hours, sla_compliance) VALUES (?, ?, ?, ?, ?)',
        [name, head_name, total_staff, avg_resolution_hours, sla_compliance]
      );
      return { id: result.insertId, ...deptData };
    }
    const newDept = {
      id: memoryStore.departments.length + 1,
      name,
      head_name,
      total_staff: parseInt(total_staff, 10) || 1,
      avg_resolution_hours: parseFloat(avg_resolution_hours) || 4.0,
      sla_compliance
    };
    memoryStore.departments.push(newDept);
    return newDept;
  }
};

module.exports = DepartmentModel;
