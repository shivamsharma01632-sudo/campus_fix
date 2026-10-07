/**
 * Location Controller
 */

const LocationModel = require('../models/location.model');
const { successResponse, errorResponse } = require('../utils/response');

class LocationController {
  async getAllLocations(req, res, next) {
    try {
      const locations = await LocationModel.findAll();
      return successResponse(res, locations, 'Locations retrieved');
    } catch (err) {
      next(err);
    }
  }

  async getLocationById(req, res, next) {
    try {
      const location = await LocationModel.findById(req.params.id);
      if (!location) {
        return errorResponse(res, 'Location not found', 404);
      }
      return successResponse(res, location, 'Location retrieved');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new LocationController();
