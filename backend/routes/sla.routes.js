/**
 * SLA Routes
 * Protected with RBAC:
 * - SLA rules configuration: ADMIN only
 * - SLA countdown monitor: TECHNICIAN and ADMIN
 */

const express = require('express');
const router = express.Router();
const SLAController = require('../controllers/sla.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// 1. SLA Policy Configuration: ADMIN only
router.get('/rules', authMiddleware, authorize('ADMIN'), SLAController.getAllRules);

// 2. SLA Countdown Monitor: TECHNICIAN and ADMIN
router.get('/monitor', authMiddleware, authorize('TECHNICIAN', 'ADMIN'), SLAController.getMonitor);

module.exports = router;

