/**
 * Admin Routes
 * Protected with RBAC: Requires authentication and ADMIN role
 */

const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/admin.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// Strictly enforce authentication and ADMIN role on all admin routes
router.use(authMiddleware, authorize('ADMIN'));

router.get('/command-center', AdminController.getCommandCenter);
router.post('/reassign/:ticketId', AdminController.reassignTicket);
router.post('/tickets/:id/reassign', AdminController.reassignTicket);
router.patch('/tickets/:id/priority', AdminController.overridePriority);
router.get('/settings', AdminController.getSettings);
router.put('/settings', AdminController.updateSettings);

module.exports = router;
