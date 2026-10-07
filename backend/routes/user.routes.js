/**
 * User Routes
 * Protected with RBAC: User management is restricted to ADMIN
 */

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// User management endpoints: ADMIN only
router.get('/', authMiddleware, authorize('ADMIN'), UserController.getAllUsers);
router.get('/:id', authMiddleware, authorize('ADMIN'), UserController.getUserById);

// Own profile update: any authenticated user
router.put('/profile', authMiddleware, UserController.updateProfile);

module.exports = router;
