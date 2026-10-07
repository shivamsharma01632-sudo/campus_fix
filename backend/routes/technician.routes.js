/**
 * Technician Routes
 * Protected with RBAC: Requires authentication and TECHNICIAN / ADMIN roles
 */

const express = require('express');
const router = express.Router();
const TechnicianController = require('../controllers/technician.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// 1. Technician roster & workload (accessible to Technicians and Admins)
router.get('/', authMiddleware, authorize('TECHNICIAN', 'ADMIN'), TechnicianController.getAllTechnicians);

// 2. Personal assigned tickets queue (strictly technician-only)
router.get('/assigned', authMiddleware, authorize('TECHNICIAN'), TechnicianController.getAssignedTickets);

// 3. Specific technician details & profile (accessible to Technicians and Admins)
router.get('/:id', authMiddleware, authorize('TECHNICIAN', 'ADMIN'), TechnicianController.getTechnicianById);

// 4. Update technician on-duty availability (accessible to Technicians and Admins)
router.patch('/:id/availability', authMiddleware, authorize('TECHNICIAN', 'ADMIN'), TechnicianController.updateAvailability);

// 5. Register new technician profile (Admin only)
router.post('/', authMiddleware, authorize('ADMIN'), TechnicianController.createTechnician);

module.exports = router;
