/**
 * Student Routes
 * Protected with RBAC: Requires authentication and STUDENT role
 */

const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');

// Require authentication and STUDENT role on all student portal endpoints
router.use(authMiddleware, authorize('STUDENT'));

router.get('/dashboard', studentController.getDashboard);
router.get('/tickets', studentController.getMyTickets);
router.post('/report', upload.single('image'), studentController.reportIssue);
router.get('/profile', studentController.getProfile);
router.put('/profile', studentController.updateProfile);

module.exports = router;
