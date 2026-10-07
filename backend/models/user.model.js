/**
 * User Model
 */

const db = require('../config/db');
const bcrypt = require('bcryptjs');

// Seed default fallback users
const memoryStore = db.getMemoryStore();
if (memoryStore.users.length === 0) {
  const hash = bcrypt.hashSync('password123', 10);
  const adminHash = bcrypt.hashSync('admin123', 10);

  memoryStore.users = [
    { id: 1, name: 'Test12345', email: 'test12345@gmail.com', password_hash: hash, role: 'STUDENT', phone: '+1-555-0100', created_at: new Date().toISOString() },
    { id: 2, name: 'Aarav Sharma', email: 'aarav.s@campus.edu', password_hash: hash, role: 'STUDENT', phone: '+1-555-0101', created_at: new Date().toISOString() },
    { id: 3, name: 'Priya Patel', email: 'priya.p@campus.edu', password_hash: hash, role: 'STUDENT', phone: '+1-555-0102', created_at: new Date().toISOString() },
    { id: 4, name: 'Marcus Vance', email: 'marcus.vance@campus.edu', password_hash: hash, role: 'TECHNICIAN', phone: '+1-555-0201', created_at: new Date().toISOString() },
    { id: 5, name: 'Elena Rostova', email: 'elena.r@campus.edu', password_hash: hash, role: 'TECHNICIAN', phone: '+1-555-0202', created_at: new Date().toISOString() },
    { id: 6, name: 'David Chen', email: 'david.c@campus.edu', password_hash: hash, role: 'TECHNICIAN', phone: '+1-555-0203', created_at: new Date().toISOString() },
    { id: 7, name: 'Sarah Jenkins', email: 'sarah.j@campus.edu', password_hash: hash, role: 'TECHNICIAN', phone: '+1-555-0204', created_at: new Date().toISOString() },
    { id: 8, name: 'Admin Staff', email: 'admin@campus.edu', password_hash: adminHash, role: 'ADMIN', phone: '+1-555-0300', created_at: new Date().toISOString() }
  ];
}

const UserModel = {
  async findByEmail(email) {
    if (db.isDbConnected()) {
      const rows = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
      return rows && rows.length > 0 ? rows[0] : null;
    }
    const clean = String(email).trim().toLowerCase();
    return memoryStore.users.find(u => u.email.toLowerCase() === clean) || null;
  },

  async findById(id) {
    if (db.isDbConnected()) {
      const rows = await db.query('SELECT id, name, email, role, phone, created_at FROM users WHERE id = ? LIMIT 1', [id]);
      return rows && rows.length > 0 ? rows[0] : null;
    }
    const user = memoryStore.users.find(u => u.id === parseInt(id, 10));
    if (!user) return null;
    const { password_hash, ...safe } = user;
    return safe;
  },

  async create(userData) {
    const { name, email, password, role = 'STUDENT', phone = null } = userData;
    const password_hash = await bcrypt.hash(password, 10);
    const normalizedRole = String(role).toUpperCase();

    if (db.isDbConnected()) {
      const result = await db.query(
        'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)',
        [name, email.toLowerCase(), password_hash, normalizedRole, phone]
      );
      return { id: result.insertId, name, email: email.toLowerCase(), role: normalizedRole, phone };
    }

    const newId = memoryStore.users.length + 1;
    const newUser = {
      id: newId,
      name,
      email: email.toLowerCase(),
      password_hash,
      role: normalizedRole,
      phone,
      created_at: new Date().toISOString()
    };
    memoryStore.users.push(newUser);
    const { password_hash: p, ...safe } = newUser;
    return safe;
  },

  async findAll() {
    if (db.isDbConnected()) {
      return await db.query('SELECT id, name, email, role, phone, created_at FROM users ORDER BY id ASC');
    }
    return memoryStore.users.map(({ password_hash, ...u }) => u);
  },

  async comparePassword(inputPassword, storedHash) {
    return await bcrypt.compare(inputPassword, storedHash);
  }
};

module.exports = UserModel;
