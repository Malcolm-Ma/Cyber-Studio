/**
 * @file Controller for assets
 * @author Mingze Ma
 */

const fs = require('fs');

const Asset = require('../models/assets');
const requestUtils = require('../utils/requestUtils');

const { STATIC_IMAGE_PATH } = require('../configure/database');
const { HOSTNAME } = require('../configure/network');

const findAssetByPath = (pathName) => {
  return Asset.findOne({ url: pathName });
};

const saveImage = (imageBlob, res) => {
  const fileName = Math.random().toString(36).slice(-6) + new Date().getTime() + '.png';

  const imageBase64 = imageBlob.replace(/^data:image\/\w+;base64,/, "");
  const buf = new Buffer(imageBase64, 'base64');
  fs.writeFile('./public' + STATIC_IMAGE_PATH + fileName, buf, (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  });

  const imageUrl = `${HOSTNAME}${STATIC_IMAGE_PATH}${fileName}`;

  return Asset.insertMany([{
    file_name: fileName,
    base64: imageBase64,
    url: imageUrl,
  }]).then((results) => {
    if (!res) {
      return results[0]._id;
    }
    requestUtils.buildSuccessResponse(res, {
      data: {
        url: imageUrl,
      }
    });
  });
};

const uploadImage = (req, res) => {
  const { imageBlob } = req.body;

  if (!imageBlob) {
    requestUtils.buildErrorResponse(res, {
      status: 400,
      error: new Error('No data sent!'),
      message: 'No data sent!',
    });
    return;
  }
  saveImage(imageBlob, res);
};

module.exports = {
  findAssetByPath,
  uploadImage,
  saveImage,
};
