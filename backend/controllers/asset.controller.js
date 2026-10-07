/**
 * Asset Controller
 */

const AssetModel = require('../models/asset.model');
const { successResponse, errorResponse } = require('../utils/response');

const AssetController = {
  async getAllAssets(req, res, next) {
    try {
      const assets = await AssetModel.findAll();
      return successResponse(res, assets, 'Assets retrieved');
    } catch (err) {
      next(err);
    }
  },

  async getAssetById(req, res, next) {
    try {
      const asset = await AssetModel.findById(req.params.id);
      if (!asset) return errorResponse(res, 'Asset not found', 404);
      return successResponse(res, asset, 'Asset details');
    } catch (err) {
      next(err);
    }
  },

  async getChronicIssues(req, res, next) {
    try {
      const chronic = await AssetModel.findChronicIssues();
      return successResponse(res, chronic, 'Chronic recurring equipment issues retrieved');
    } catch (err) {
      next(err);
    }
  },

  async createAsset(req, res, next) {
    try {
      const created = await AssetModel.create(req.body);
      return successResponse(res, created, 'Asset registered', 201);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = AssetController;
