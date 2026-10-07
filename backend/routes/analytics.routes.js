/**
 * Analytics Routes
 * Protected with RBAC: Executive telemetry is restricted to ADMIN
 */

const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analytics.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// Executive telemetry is strictly restricted to ADMIN
router.get('/', authMiddleware, authorize('ADMIN'), AnalyticsController.getDashboardAnalytics);

module.exports = router;

