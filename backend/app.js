/**
 * CampusFix Express Application Setup
 */

const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const db = require('./config/db');
const logger = require('./utils/logger');
const errorMiddleware = require('./middleware/error.middleware');
const { successResponse, errorResponse } = require('./utils/response');

// Route imports
const authRoutes = require('./routes/auth.routes');
const ticketRoutes = require('./routes/ticket.routes');
const studentRoutes = require('./routes/student.routes');
const userRoutes = require('./routes/user.routes');
const technicianRoutes = require('./routes/technician.routes');
const departmentRoutes = require('./routes/department.routes');
const locationRoutes = require('./routes/location.routes');
const assetRoutes = require('./routes/asset.routes');
const slaRoutes = require('./routes/sla.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const adminRoutes = require('./routes/admin.routes');
const path = require('path');

const app = express();

// Security & Parsing Middleware
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for incident uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request Logger
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  const dbConnected = db.isDbConnected();
  return successResponse(res, {
    status: 'ONLINE',
    service: 'CampusFix Backend REST API',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    database: {
      driver: 'mysql2',
      connected: dbConnected,
      mode: dbConnected ? 'MySQL Server Active' : 'Local Fallback Store Active'
    },
    version: '1.0.0'
  }, 'System is healthy');
});

// Mount Resource Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/sla', slaRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// Serve Frontend static assets
app.use(express.static(path.join(__dirname, '../frontend')));

// 404 Route Handler
app.use((req, res) => {
  return errorResponse(res, `Endpoint '${req.originalUrl}' not found on CampusFix API`, 404);
});

// Centralized Error Handling Middleware
app.use(errorMiddleware);

module.exports = app;
