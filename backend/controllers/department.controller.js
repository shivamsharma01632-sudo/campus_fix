/**
 * Department Controller
 */

const DepartmentModel = require('../models/department.model');
const { successResponse, errorResponse } = require('../utils/response');

const DepartmentController = {
  async getAllDepartments(req, res, next) {
    try {
      const depts = await DepartmentModel.findAll();
      return successResponse(res, depts, 'Departments retrieved');
    } catch (err) {
      next(err);
    }
  },

  async getDepartmentById(req, res, next) {
    try {
      const dept = await DepartmentModel.findById(req.params.id);
      if (!dept) return errorResponse(res, 'Department not found', 404);
      return successResponse(res, dept, 'Department details');
    } catch (err) {
      next(err);
    }
  },

  async createDepartment(req, res, next) {
    try {
      const created = await DepartmentModel.create(req.body);
      return successResponse(res, created, 'Department registered', 201);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = DepartmentController;
