/**
 * CampusFix Database Connector
 * Uses mysql2/promise with connection pooling
 * Includes automated fallback to local state store when MySQL server is unreachable
 */

const mysql = require('mysql2/promise');
const env = require('./env');
const logger = require('../utils/logger');

let pool = null;
let isConnected = false;

try {
  pool = mysql.createPool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true
  });
} catch (err) {
  logger.warn('MySQL pool initialization failed, using in-memory store:', err.message);
}

// In-memory fallback dataset for seamless local execution if MySQL server is not running
const memoryStore = {
  users: [],
  departments: [],
  locations: [],
  technicians: [],
  assets: [],
  sla_rules: [],
  tickets: [],
  ticket_history: []
};

/**
 * Test database connectivity
 */
async function testConnection() {
  if (!pool) return false;
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    isConnected = true;
    logger.info(`Successfully connected to MySQL database: ${env.DB_NAME} at ${env.DB_HOST}:${env.DB_PORT}`);
    return true;
  } catch (err) {
    isConnected = false;
    logger.warn(`MySQL connection unavailable (${err.message}). Active mode: In-memory fallback data store.`);
    return false;
  }
}

/**
 * Generic query executor
 */
async function query(sql, params = []) {
  if (isConnected && pool) {
    try {
      const [results] = await pool.execute(sql, params);
      return results;
    } catch (err) {
      logger.error('MySQL Query Execution Error', err);
      throw err;
    }
  }
  // Return memory store reference for model adapters
  return null;
}

module.exports = {
  pool,
  query,
  testConnection,
  isDbConnected: () => isConnected,
  getMemoryStore: () => memoryStore
};
