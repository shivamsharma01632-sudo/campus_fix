/**
 * CampusFix Recurrence & Chronic Issue Intelligence Engine
 * Audits repeated failures across assets and locations over rolling 30 days
 */

const AssetModel = require('../models/asset.model');
const { RECURRENCE_THRESHOLD } = require('../utils/constants');
const logger = require('../utils/logger');

const RecurrenceService = {
  /**
   * Check if a reported ticket is related to an existing chronic equipment issue
   */
  async checkAndFlagRecurrence(params) {
    const { assetTag, locationName, title, category } = params;

    let matchedAsset = null;
    if (assetTag) {
      matchedAsset = await AssetModel.findByTag(assetTag);
    }

    if (!matchedAsset) {
      matchedAsset = await AssetModel.findByLocationOrName(locationName, title);
    }

    if (matchedAsset) {
      // Increment failure count
      const updatedFailures = (matchedAsset.failures_30d || 0) + 1;
      const isChronic = updatedFailures >= RECURRENCE_THRESHOLD.MIN_FAILURES;

      let recommendation = matchedAsset.recommendation;
      if (isChronic && (!recommendation || recommendation === 'Routine filter cleaning scheduled')) {
        recommendation = `High recurrence (${updatedFailures} failures in 30d): Schedule preventive overhaul / replacement review.`;
      }

      await AssetModel.incrementFailures(matchedAsset.id, recommendation);

      logger.info(`Asset recurrence update for ${matchedAsset.asset_tag || matchedAsset.name}: ${updatedFailures} failures in 30d. Chronic: ${isChronic}`);

      return {
        isChronic,
        assetId: matchedAsset.id,
        assetTag: matchedAsset.asset_tag,
        assetName: matchedAsset.name,
        failures30d: updatedFailures,
        recommendation
      };
    }

    return {
      isChronic: false,
      assetId: null,
      assetTag: null,
      assetName: null,
      failures30d: 1,
      recommendation: null
    };
  },

  /**
   * Helper for auditing recurrence directly
   */
  async checkAndAuditRecurrence(assetTag, locationName = '') {
    const asset = await AssetModel.findByTag(assetTag) || await AssetModel.findByLocationOrName(locationName, assetTag);
    if (asset) {
      return {
        isChronic: (asset.failures_30d || 0) >= RECURRENCE_THRESHOLD.MIN_FAILURES || asset.status === 'Chronic Issue',
        count: asset.failures_30d || 0,
        assetTag: asset.asset_tag,
        assetName: asset.name,
        recommendation: asset.recommendation || 'Preventive maintenance review recommended'
      };
    }
    return {
      isChronic: false,
      count: 0,
      assetTag,
      assetName: null,
      recommendation: null
    };
  }
};

module.exports = RecurrenceService;
