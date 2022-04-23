/**
 * @file Controller for assets
 * @author Mingze Ma
 */

const Asset = require('../models/assets');

const findAssetByPath = (pathName) => {
  return Asset.findOne({ url: pathName });
};

module.exports = {
  findAssetByPath,
};
