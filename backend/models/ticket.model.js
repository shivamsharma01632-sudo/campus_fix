/**
 * Ticket Model
 * Normalizes between MySQL schema and Frontend contract
 */

const db = require('../config/db');

const memoryStore = db.getMemoryStore();

// Seed initial memory store matching frontend seed tickets
if (memoryStore.tickets.length === 0) {
  memoryStore.tickets = [
    {
      id: 1,
      ticket_code: 'CF-1001',
      title: 'fan in room 118 is not working',
      description: 'Ceiling fan makes loud grinding noise and stops rotating after 2 minutes.',
      category: 'AV / Electrical',
      location_name: 'Room 118',
      location_id: 1,
      department_id: 1,
      department_name: 'Electrical Maintenance',
      priority: 'Medium',
      status: 'Resolved',
      reporter_id: 1,
      reporter_name: 'Test12345',
      reporter_email: 'test12345@gmail.com',
      assigned_tech_id: 1,
      assigned_tech_name: 'Marcus Vance',
      asset_id: null,
      asset_tag: null,
      sla_hours: 4,
      sla_deadline: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      is_chronic: 0,
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      resolved_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      history: [
        { status: 'Open', time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), note: 'Issue submitted by student via AI triage' },
        { status: 'Assigned', time: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(), note: 'Auto-routed to Electrical Maintenance & assigned to Marcus Vance' },
        { status: 'In Progress', time: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(), note: 'Technician arrived on site with replacement capacitor' },
        { status: 'Resolved', time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), note: 'Capacitor replaced and speed regulator lubricated. Fully operational.' }
      ]
    },
    {
      id: 2,
      ticket_code: 'CF-1002',
      title: "Projector in Room 304 isn't working",
      description: 'Projector flashes red lamp LED and will not connect to HDMI cable during lecture.',
      category: 'AV / Electrical',
      location_name: 'Room 304',
      location_id: 2,
      department_id: 1,
      department_name: 'Electrical Maintenance',
      priority: 'High',
      status: 'Resolved',
      reporter_id: 1,
      reporter_name: 'Test12345',
      reporter_email: 'test12345@gmail.com',
      assigned_tech_id: 1,
      assigned_tech_name: 'Marcus Vance',
      asset_id: 1,
      asset_tag: 'P-304',
      sla_hours: 4,
      sla_deadline: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      is_chronic: 1,
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      resolved_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      history: [
        { status: 'Open', time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), note: 'Reported via natural language' },
        { status: 'Assigned', time: new Date(Date.now() - 4.5 * 60 * 60 * 1000).toISOString(), note: 'AI flagged as High Priority AV issue' },
        { status: 'Resolved', time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), note: 'Lamp module reseated and HDMI switch box power-cycled' }
      ]
    },
    {
      id: 3,
      ticket_code: 'CF-1003',
      title: 'Water leaking under the sink in 2nd floor washroom, Block A',
      description: 'Continuous water drip from the main drainage pipe causing pooling on floor tiles.',
      category: 'Plumbing & Water',
      location_name: 'Block A, 2nd Floor',
      location_id: 3,
      department_id: 2,
      department_name: 'Civil & Plumbing',
      priority: 'High',
      status: 'In Progress',
      reporter_id: 2,
      reporter_name: 'Aarav Sharma',
      reporter_email: 'aarav.s@campus.edu',
      assigned_tech_id: 2,
      assigned_tech_name: 'Elena Rostova',
      asset_id: 3,
      asset_tag: 'WP-01',
      sla_hours: 4,
      sla_deadline: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      is_chronic: 0,
      created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      resolved_at: null,
      history: [
        { status: 'Open', time: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(), note: 'Reported by student' },
        { status: 'In Progress', time: new Date(Date.now() - 45 * 60 * 1000).toISOString(), note: 'Plumber on site, replacing PVC U-bend joint' }
      ]
    },
    {
      id: 4,
      ticket_code: 'CF-1004',
      title: 'AC in lab 110 blowing warm air during exams',
      description: 'Split AC unit running but cooling coil not engaging. Room temperature above 31C.',
      category: 'HVAC / Cooling',
      location_name: 'Lab 110',
      location_id: 4,
      department_id: 3,
      department_name: 'HVAC Operations',
      priority: 'Critical',
      status: 'Open',
      reporter_id: 3,
      reporter_name: 'Priya Patel',
      reporter_email: 'priya.p@campus.edu',
      assigned_tech_id: 3,
      assigned_tech_name: 'David Chen',
      asset_id: 2,
      asset_tag: 'HVAC-02',
      sla_hours: 1,
      sla_deadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      is_chronic: 0,
      created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      resolved_at: null,
      history: [
        { status: 'Open', time: new Date(Date.now() - 25 * 60 * 1000).toISOString(), note: 'High temperature alert flagged by student' }
      ]
    },
    {
      id: 5,
      ticket_code: 'CF-1005',
      title: 'WiFi signal dropping constantly in Library Wing C',
      description: 'Students unable to access research databases due to frequent AP disconnections.',
      category: 'Network & WiFi',
      location_name: 'Library Wing C',
      location_id: 5,
      department_id: 4,
      department_name: 'Campus IT & Networks',
      priority: 'High',
      status: 'Assigned',
      reporter_id: 1,
      reporter_name: 'Test12345',
      reporter_email: 'test12345@gmail.com',
      assigned_tech_id: 4,
      assigned_tech_name: 'Sarah Jenkins',
      asset_id: 4,
      asset_tag: 'NET-SW-01',
      sla_hours: 4,
      sla_deadline: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      is_chronic: 0,
      created_at: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
      resolved_at: null,
      history: [
        { status: 'Open', time: new Date(Date.now() - 50 * 60 * 1000).toISOString(), note: 'Reported' },
        { status: 'Assigned', time: new Date(Date.now() - 20 * 60 * 1000).toISOString(), note: 'Assigned to Network Operations' }
      ]
    }
  ];
}

function formatTicket(t) {
  if (!t) return null;
  return {
    id: t.ticket_code || t.id,
    dbId: t.id,
    ticket_code: t.ticket_code || t.id,
    title: t.title,
    description: t.description,
    category: t.category,
    location: t.location_name || t.location,
    location_name: t.location_name || t.location,
    department: t.department_name || t.department,
    department_name: t.department_name || t.department,
    department_id: t.department_id,
    priority: t.priority,
    status: t.status,
    reporter_id: t.reporter_id,
    studentName: t.reporter_name || t.studentName,
    reporter_name: t.reporter_name || t.studentName,
    studentEmail: t.reporter_email || t.studentEmail,
    reporter_email: t.reporter_email || t.studentEmail,
    assignedTech: t.assigned_tech_name || t.assignedTech,
    assigned_tech_name: t.assigned_tech_name || t.assignedTech,
    assigned_tech_id: t.assigned_tech_id,
    assetTag: t.asset_tag || t.assetTag,
    asset_id: t.asset_id,
    slaHours: t.sla_hours || t.slaHours,
    sla_hours: t.sla_hours || t.slaHours,
    slaDeadline: t.sla_deadline || t.slaDeadline,
    isChronic: !!t.is_chronic,
    createdAt: t.created_at || t.createdAt,
    created_at: t.created_at || t.createdAt,
    resolvedAt: t.resolved_at || t.resolvedAt,
    resolved_at: t.resolved_at || t.resolvedAt,
    history: t.history || []
  };
}

const TicketModel = {
  async findAll(filters = {}) {
    if (db.isDbConnected()) {
      let sql = `
        SELECT t.*, d.name AS department_name
        FROM tickets t
        LEFT JOIN departments d ON t.department_id = d.id
        WHERE 1=1
      `;
      const params = [];

      if (filters.status && filters.status !== 'all') {
        sql += ' AND t.status = ?';
        params.push(filters.status);
      }
      if (filters.category && filters.category !== 'all') {
        sql += ' AND t.category = ?';
        params.push(filters.category);
      }
      if (filters.department && filters.department !== 'all') {
        sql += ' AND d.name = ?';
        params.push(filters.department);
      }
      if (filters.priority && filters.priority !== 'all') {
        sql += ' AND t.priority = ?';
        params.push(filters.priority);
      }
      if (filters.reporter_id) {
        if (filters.reporter_email) {
          sql += ' AND (t.reporter_id = ? OR t.reporter_email = ?)';
          params.push(filters.reporter_id, filters.reporter_email);
        } else {
          sql += ' AND t.reporter_id = ?';
          params.push(filters.reporter_id);
        }
      } else if (filters.reporter_email) {
        sql += ' AND t.reporter_email = ?';
        params.push(filters.reporter_email);
      }
      if (filters.assigned_tech_id) {
        if (filters.assigned_tech_name) {
          sql += ' AND (t.assigned_tech_id = ? OR t.assigned_tech_name = ?)';
          params.push(filters.assigned_tech_id, filters.assigned_tech_name);
        } else {
          sql += ' AND t.assigned_tech_id = ?';
          params.push(filters.assigned_tech_id);
        }
      } else if (filters.assigned_tech_name) {
        sql += ' AND t.assigned_tech_name = ?';
        params.push(filters.assigned_tech_name);
      }
      if (filters.search) {
        sql += ' AND (t.title LIKE ? OR t.location_name LIKE ? OR t.ticket_code LIKE ?)';
        const q = `%${filters.search}%`;
        params.push(q, q, q);
      }

      sql += ' ORDER BY t.created_at DESC';
      const rows = await db.query(sql, params);
      return rows.map(r => formatTicket(r));
    }

    // In-memory filter
    let results = [...memoryStore.tickets];
    if (filters.status && filters.status !== 'all') {
      results = results.filter(t => t.status.toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.category && filters.category !== 'all') {
      results = results.filter(t => t.category.toLowerCase() === filters.category.toLowerCase());
    }
    if (filters.department && filters.department !== 'all') {
      results = results.filter(t => (t.department_name || t.department || '').toLowerCase() === filters.department.toLowerCase());
    }
    if (filters.priority && filters.priority !== 'all') {
      results = results.filter(t => t.priority.toLowerCase() === filters.priority.toLowerCase());
    }
    if (filters.reporter_id) {
      results = results.filter(t => 
        t.reporter_id === filters.reporter_id || 
        (filters.reporter_email && (t.reporter_email === filters.reporter_email || t.studentEmail === filters.reporter_email))
      );
    } else if (filters.reporter_email) {
      results = results.filter(t => t.reporter_email === filters.reporter_email || t.studentEmail === filters.reporter_email);
    }
    if (filters.assigned_tech_id) {
      results = results.filter(t => 
        t.assigned_tech_id === filters.assigned_tech_id || 
        (filters.assigned_tech_name && (t.assigned_tech_name === filters.assigned_tech_name || t.assignedTech === filters.assigned_tech_name))
      );
    } else if (filters.assigned_tech_name) {
      results = results.filter(t => t.assigned_tech_name === filters.assigned_tech_name || t.assignedTech === filters.assigned_tech_name);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.location_name || '').toLowerCase().includes(q) ||
        (t.ticket_code || '').toLowerCase().includes(q)
      );
    }
    results.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
    return results.map(formatTicket);
  },

  async findByIdOrCode(idOrCode) {
    if (!idOrCode) return null;
    const str = String(idOrCode).trim();
    if (db.isDbConnected()) {
      const rows = await db.query(`
        SELECT t.*, d.name AS department_name
        FROM tickets t
        LEFT JOIN departments d ON t.department_id = d.id
        WHERE t.ticket_code = ? OR t.id = ?
        LIMIT 1
      `, [str, isNaN(str) ? 0 : parseInt(str, 10)]);

      if (rows && rows.length > 0) {
        const ticket = rows[0];
        const historyRows = await db.query(
          'SELECT status, note, performed_by_name, created_at AS time FROM ticket_history WHERE ticket_id = ? ORDER BY id ASC',
          [ticket.id]
        );
        ticket.history = historyRows || [];
        return formatTicket(ticket);
      }
      return null;
    }

    const item = memoryStore.tickets.find(t => 
      t.ticket_code === str || 
      String(t.id) === str || 
      (t.id === str)
    );
    return item ? formatTicket(item) : null;
  },

  async create(data) {
    const code = `CF-${1000 + memoryStore.tickets.length + 1}`;
    const deadline = new Date(Date.now() + (data.sla_hours || 4) * 60 * 60 * 1000);

    if (db.isDbConnected()) {
      const res = await db.query(`
        INSERT INTO tickets (
          ticket_code, title, description, category, location_name, location_id,
          department_id, priority, status, reporter_id, reporter_name, reporter_email,
          assigned_tech_id, assigned_tech_name, asset_id, asset_tag, sla_hours,
          sla_deadline, is_chronic
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        code, data.title, data.description || data.title, data.category, data.location_name,
        data.location_id || null, data.department_id || null, data.priority || 'Medium',
        data.status || 'Open', data.reporter_id || null, data.reporter_name || 'Anonymous Student',
        data.reporter_email || 'student@campus.edu', data.assigned_tech_id || null,
        data.assigned_tech_name || null, data.asset_id || null, data.asset_tag || null,
        data.sla_hours || 4, deadline, data.is_chronic ? 1 : 0
      ]);

      const newId = res.insertId;
      await db.query(
        'INSERT INTO ticket_history (ticket_id, status, note, performed_by_name) VALUES (?, ?, ?, ?)',
        [newId, 'Open', 'Issue logged via CampusFix API', data.reporter_name || 'Student']
      );

      return await this.findByIdOrCode(code);
    }

    const newTicket = {
      id: memoryStore.tickets.length + 1,
      ticket_code: code,
      title: data.title,
      description: data.description || data.title,
      category: data.category,
      location_name: data.location_name,
      location_id: data.location_id,
      department_id: data.department_id,
      department_name: data.department_name,
      priority: data.priority || 'Medium',
      status: data.status || 'Open',
      reporter_id: data.reporter_id,
      reporter_name: data.reporter_name,
      reporter_email: data.reporter_email,
      assigned_tech_id: data.assigned_tech_id,
      assigned_tech_name: data.assigned_tech_name,
      asset_id: data.asset_id,
      asset_tag: data.asset_tag,
      sla_hours: data.sla_hours || 4,
      sla_deadline: deadline.toISOString(),
      is_chronic: data.is_chronic ? 1 : 0,
      created_at: new Date().toISOString(),
      resolved_at: null,
      history: [
        {
          status: 'Open',
          time: new Date().toISOString(),
          note: `Issue submitted by ${data.reporter_name || 'student'}. Auto-routed to ${data.department_name || 'Facilities'}.`
        }
      ]
    };

    memoryStore.tickets.unshift(newTicket);
    return formatTicket(newTicket);
  },

  async update(idOrCode, updateData, user) {
    const existing = await this.findByIdOrCode(idOrCode);
    if (!existing) return null;

    const oldStatus = existing.status;
    const newStatus = updateData.status || oldStatus;
    const resolvedAt = (newStatus === 'Resolved' && oldStatus !== 'Resolved') ? new Date() : existing.resolvedAt;

    if (db.isDbConnected()) {
      await db.query(`
        UPDATE tickets SET
          title = COALESCE(?, title),
          status = COALESCE(?, status),
          priority = COALESCE(?, priority),
          assigned_tech_name = COALESCE(?, assigned_tech_name),
          assigned_tech_id = COALESCE(?, assigned_tech_id),
          department_id = COALESCE(?, department_id),
          resolved_at = ?
        WHERE id = ?
      `, [
        updateData.title || null,
        newStatus,
        updateData.priority || null,
        updateData.assigned_tech_name || null,
        updateData.assigned_tech_id || null,
        updateData.department_id || null,
        resolvedAt,
        existing.dbId
      ]);

      if (newStatus !== oldStatus || updateData.note) {
        await db.query(
          'INSERT INTO ticket_history (ticket_id, status, note, performed_by_name) VALUES (?, ?, ?, ?)',
          [existing.dbId, newStatus, updateData.note || `Status changed to ${newStatus}`, user ? user.name : 'System']
        );
      }

      return await this.findByIdOrCode(existing.ticket_code);
    }

    const item = memoryStore.tickets.find(t => t.ticket_code === existing.ticket_code || t.id === existing.dbId);
    if (item) {
      if (updateData.title) item.title = updateData.title;
      if (updateData.priority) item.priority = updateData.priority;
      if (updateData.assigned_tech_name) item.assigned_tech_name = updateData.assigned_tech_name;
      if (updateData.department_name) item.department_name = updateData.department_name;
      if (updateData.status) item.status = updateData.status;

      if (newStatus === 'Resolved' && oldStatus !== 'Resolved') {
        item.resolved_at = new Date().toISOString();
      }

      if (newStatus !== oldStatus || updateData.note) {
        if (!item.history) item.history = [];
        item.history.push({
          status: newStatus,
          time: new Date().toISOString(),
          note: updateData.note || `Status changed from ${oldStatus} to ${newStatus}`
        });
      }
    }
    return formatTicket(item);
  },

  async delete(idOrCode) {
    const existing = await this.findByIdOrCode(idOrCode);
    if (!existing) return false;

    if (db.isDbConnected()) {
      await db.query('DELETE FROM tickets WHERE id = ?', [existing.dbId]);
      return true;
    }

    memoryStore.tickets = memoryStore.tickets.filter(t => t.ticket_code !== existing.ticket_code && t.id !== existing.dbId);
    return true;
  }
};

module.exports = TicketModel;
