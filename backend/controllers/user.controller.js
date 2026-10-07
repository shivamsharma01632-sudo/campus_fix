/**
 * User Controller
 */

const UserModel = require('../models/user.model');
const { successResponse, errorResponse } = require('../utils/response');

const UserController = {
  async getAllUsers(req, res, next) {
    try {
      const users = await UserModel.findAll();
      return successResponse(res, users, 'Users retrieved');
    } catch (err) {
      next(err);
    }
  },

  async getUserById(req, res, next) {
    try {
      const user = await UserModel.findById(req.params.id);
      if (!user) return errorResponse(res, 'User not found', 404);
      return successResponse(res, user, 'User details');
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req, res, next) {
    try {
      const current = await UserModel.findById(req.user.id);
      if (!current) return errorResponse(res, 'User not found', 404);

      if (req.body.name) current.name = req.body.name;
      if (req.body.phone) current.phone = req.body.phone;

      return successResponse(res, current, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = UserController;
