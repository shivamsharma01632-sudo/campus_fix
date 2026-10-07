/**
 * Location Model
 */

const db = require('../config/db');

const memoryStore = db.getMemoryStore();
if (memoryStore.locations.length === 0) {
  memoryStore.locations = [
    { id: 1, name: 'Room 118', building: 'Academic Block A', floor: '1st Floor', room_number: '118' },
    { id: 2, name: 'Room 304', building: 'Academic Block A', floor: '3rd Floor', room_number: '304' },
    { id: 3, name: '2nd Floor Washroom, Block A', building: 'Academic Block A', floor: '2nd Floor', room_number: 'W-201' },
    { id: 4, name: 'Lab 110', building: 'Science & Engineering Complex', floor: '1st Floor', room_number: '110' },
    { id: 5, name: 'Library Wing C', building: 'Central Library', floor: '2nd Floor', room_number: 'C-205' },
    { id: 6, name: 'Main Campus Grounds', building: 'Central Campus', floor: 'Ground Floor', room_number: 'G-01' }
  ];
}

const LocationModel = {
  async findAll() {
    if (db.isDbConnected()) {
      return await db.query('SELECT * FROM locations ORDER BY id ASC');
    }
    return [...memoryStore.locations];
  },

  async findById(id) {
    if (db.isDbConnected()) {
      const rows = await db.query('SELECT * FROM locations WHERE id = ? LIMIT 1', [id]);
      return rows && rows.length > 0 ? rows[0] : null;
    }
    return memoryStore.locations.find(l => l.id === parseInt(id, 10)) || null;
  },

  async findByName(name) {
    if (db.isDbConnected()) {
      const rows = await db.query('SELECT * FROM locations WHERE name LIKE ? LIMIT 1', [`%${name}%`]);
      return rows && rows.length > 0 ? rows[0] : null;
    }
    const clean = String(name).toLowerCase();
    return memoryStore.locations.find(l => l.name.toLowerCase().includes(clean)) || null;
  },

  async findOrCreate(locationName) {
    if (!locationName) return null;
    const existing = await this.findByName(locationName);
    if (existing) return existing;

    if (db.isDbConnected()) {
      const res = await db.query(
        'INSERT INTO locations (name, building, floor, room_number) VALUES (?, ?, ?, ?)',
        [locationName, 'Campus Facility', 'General', 'N/A']
      );
      return { id: res.insertId, name: locationName, building: 'Campus Facility' };
    }

    const newLoc = {
      id: memoryStore.locations.length + 1,
      name: locationName,
      building: 'Campus Facility',
      floor: 'General',
      room_number: 'N/A'
    };
    memoryStore.locations.push(newLoc);
    return newLoc;
  }
};

module.exports = LocationModel;
