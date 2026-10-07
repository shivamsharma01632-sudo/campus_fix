/**
 * Asset Model
 */

const db = require('../config/db');

const memoryStore = db.getMemoryStore();
if (memoryStore.assets.length === 0) {
  memoryStore.assets = [
    { id: 1, asset_tag: 'P-304', name: 'Optoma Projector P-304', category: 'AV Equipment', location_id: 2, location_name: 'Room 304', department_id: 1, failures_30d: 7, status: 'Chronic Issue', recommendation: 'Preventive maintenance / replacement review' },
    { id: 2, asset_tag: 'HVAC-02', name: 'Carrier Central Chiller #2', category: 'Cooling', location_id: 4, location_name: 'Lab 110', department_id: 3, failures_30d: 1, status: 'Normal', recommendation: 'Routine filter cleaning scheduled' },
    { id: 3, asset_tag: 'WP-01', name: 'Grundfos Hydro Booster Pump', category: 'Plumbing', location_id: 3, location_name: '2nd Floor Washroom, Block A', department_id: 2, failures_30d: 0, status: 'Normal', recommendation: 'Inspected last week' },
    { id: 4, asset_tag: 'NET-SW-01', name: 'Cisco Core Switch 9300', category: 'Networking', location_id: 5, location_name: 'Library Wing C', department_id: 4, failures_30d: 0, status: 'Normal', recommendation: 'Firmware up to date' }
  ];
}

const AssetModel = {
  async findAll() {
    if (db.isDbConnected()) {
      return await db.query(`
        SELECT a.*, l.name AS location_name, d.name AS department_name
        FROM assets a
        LEFT JOIN locations l ON a.location_id = l.id
        LEFT JOIN departments d ON a.department_id = d.id
        ORDER BY a.failures_30d DESC, a.id ASC
      `);
    }
    return [...memoryStore.assets];
  },

  async findById(id) {
    if (db.isDbConnected()) {
      const rows = await db.query(`
        SELECT a.*, l.name AS location_name, d.name AS department_name
        FROM assets a
        LEFT JOIN locations l ON a.location_id = l.id
        LEFT JOIN departments d ON a.department_id = d.id
        WHERE a.id = ? LIMIT 1
      `, [id]);
      return rows && rows.length > 0 ? rows[0] : null;
    }
    return memoryStore.assets.find(a => a.id === parseInt(id, 10)) || null;
  },

  async findByTag(assetTag) {
    if (!assetTag) return null;
    if (db.isDbConnected()) {
      const rows = await db.query(`
        SELECT a.*, l.name AS location_name, d.name AS department_name
        FROM assets a
        LEFT JOIN locations l ON a.location_id = l.id
        LEFT JOIN departments d ON a.department_id = d.id
        WHERE a.asset_tag = ? LIMIT 1
      `, [assetTag]);
      return rows && rows.length > 0 ? rows[0] : null;
    }
    return memoryStore.assets.find(a => a.asset_tag.toLowerCase() === assetTag.toLowerCase()) || null;
  },

  async findByLocationOrName(locationName, name) {
    if (db.isDbConnected()) {
      const rows = await db.query(`
        SELECT a.*, l.name AS location_name, d.name AS department_name
        FROM assets a
        LEFT JOIN locations l ON a.location_id = l.id
        LEFT JOIN departments d ON a.department_id = d.id
        WHERE l.name LIKE ? OR a.name LIKE ?
        LIMIT 1
      `, [`%${locationName || ''}%`, `%${name || ''}%`]);
      return rows && rows.length > 0 ? rows[0] : null;
    }
    const locClean = String(locationName || '').toLowerCase();
    const nameClean = String(name || '').toLowerCase();
    return memoryStore.assets.find(a => 
      (locClean && (a.location_name || '').toLowerCase().includes(locClean)) ||
      (nameClean && a.name.toLowerCase().includes(nameClean))
    ) || null;
  },

  async findChronicIssues() {
    if (db.isDbConnected()) {
      return await db.query(`
        SELECT a.*, l.name AS location_name, d.name AS department_name
        FROM assets a
        LEFT JOIN locations l ON a.location_id = l.id
        LEFT JOIN departments d ON a.department_id = d.id
        WHERE a.status = 'Chronic Issue' OR a.failures_30d >= 3
        ORDER BY a.failures_30d DESC
      `);
    }
    return memoryStore.assets.filter(a => a.status === 'Chronic Issue' || a.failures_30d >= 3);
  },

  async findChronic(days = 30, minFailures = 3) {
    return this.findChronicIssues();
  },

  async incrementFailures(id, recommendation = null) {
    if (db.isDbConnected()) {
      await db.query(`
        UPDATE assets 
        SET failures_30d = failures_30d + 1,
            status = CASE WHEN failures_30d + 1 >= 3 THEN 'Chronic Issue' ELSE status END,
            recommendation = COALESCE(?, recommendation)
        WHERE id = ?
      `, [recommendation, id]);
    } else {
      const asset = memoryStore.assets.find(a => a.id === parseInt(id, 10));
      if (asset) {
        asset.failures_30d = (asset.failures_30d || 0) + 1;
        if (asset.failures_30d >= 3) {
          asset.status = 'Chronic Issue';
        }
        if (recommendation) {
          asset.recommendation = recommendation;
        }
      }
    }
  },

  async create(data) {
    const { asset_tag, name, category, location_id = null, department_id = null, recommendation = null } = data;
    if (db.isDbConnected()) {
      const res = await db.query(
        'INSERT INTO assets (asset_tag, name, category, location_id, department_id, failures_30d, status, recommendation) VALUES (?, ?, ?, ?, ?, 0, "Normal", ?)',
        [asset_tag, name, category, location_id, department_id, recommendation]
      );
      return { id: res.insertId, ...data, failures_30d: 0, status: 'Normal' };
    }
    const newAsset = {
      id: memoryStore.assets.length + 1,
      asset_tag,
      name,
      category,
      location_id,
      department_id,
      failures_30d: 0,
      status: 'Normal',
      recommendation
    };
    memoryStore.assets.push(newAsset);
    return newAsset;
  }
};

module.exports = AssetModel;
