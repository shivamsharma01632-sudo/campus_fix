/**
 * Location Routes
 * Protected: Shared authenticated access (STUDENT, TECHNICIAN, ADMIN)
 */

const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', locationController.getAllLocations);
router.get('/:id', locationController.getLocationById);

module.exports = router;

