/**
 * Asset Routes
 * Protected with RBAC:
 * - Chronic equipment alerts: TECHNICIAN and ADMIN
 * - Physical plant asset inventory management: ADMIN only
 */

const express = require('express');
const router = express.Router();
const AssetController = require('../controllers/asset.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

// Chronic equipment alert query: TECHNICIAN and ADMIN
router.get('/chronic', authMiddleware, authorize('TECHNICIAN', 'ADMIN'), AssetController.getChronicIssues);

// Physical plant asset inventory management: ADMIN only
router.get('/', authMiddleware, authorize('ADMIN'), AssetController.getAllAssets);
router.get('/:id', authMiddleware, authorize('ADMIN'), AssetController.getAssetById);
router.post('/', authMiddleware, authorize('ADMIN'), AssetController.createAsset);

module.exports = router;

