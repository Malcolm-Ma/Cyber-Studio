/**
 * @file Controller for assets
 * @author Mingze Ma
 */

const Asset = require('../models/stories');

const findAssetByPath = async (pathName) => {
  return await Asset.findOne({ url: pathName }).exec();
};

module.exports = {
  findAssetByPath,
};
