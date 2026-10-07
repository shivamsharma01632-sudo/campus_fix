/**
 * Department Routes
 * Protected with RBAC: Department management is restricted to ADMIN
 */

const express = require('express');
const router = express.Router();
const DepartmentController = require('../controllers/department.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// Department operations: ADMIN only
router.use(authMiddleware, authorize('ADMIN'));

router.get('/', DepartmentController.getAllDepartments);
router.get('/:id', DepartmentController.getDepartmentById);
router.post('/', DepartmentController.createDepartment);

module.exports = router;
