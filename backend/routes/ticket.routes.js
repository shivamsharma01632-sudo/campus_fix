/**
 * Ticket Routes
 * Protected with Ticket-Level Authorization & RBAC
 */

const express = require('express');
const router = express.Router();
const TicketController = require('../controllers/ticket.controller');
const { optionalAuth, authMiddleware } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validateTicketCreate } = require('../middleware/validation.middleware');
const upload = require('../middleware/upload.middleware');

// Operations overview stats: Shared authenticated access
router.get('/stats/operations', authMiddleware, TicketController.getOperationsStats);
router.post('/ai-preview', optionalAuth, TicketController.previewAI);

// Protected ticket operations: Requires authentication and ticket-level authorization
router.get('/', authMiddleware, TicketController.getTickets);
router.get('/:id', authMiddleware, TicketController.getTicketById);

// Creation: Student or Admin only, with optional photo upload
router.post('/', authMiddleware, upload.single('image'), validateTicketCreate, TicketController.createTicket);

// Update status / work notes: Student (own), Technician (assigned), or Admin (all)
router.put('/:id', authMiddleware, TicketController.updateTicket);
router.patch('/:id', authMiddleware, TicketController.updateTicket);

// Delete ticket: Admin only
router.delete('/:id', authMiddleware, authorize('ADMIN'), TicketController.deleteTicket);

module.exports = router;

