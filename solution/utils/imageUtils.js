/**
 * @file image utils
 * @author Mingze Ma
 */

const fs = require('fs');

/**
 * Convert image to base64 code string
 * @param url image URL
 * @param callback callback functions
 * @param outputFormat output data url format
 */
const convertImgToBase64 = (url, callback, outputFormat = 'image/png') => {
  let canvas = document.createElement('CANVAS'),
    ctx = canvas.getContext('2d'),
    img = new Image;
  img.crossOrigin = 'Anonymous';
  img.onload = () => {
    canvas.height = img.height;
    canvas.width = img.width;
    ctx.drawImage(img, 0, 0);
    const dataURL = canvas.toDataURL(outputFormat);
    callback.call(this, dataURL);
    canvas = null;
  };
  img.src = url;
}

module.exports = {
  convertImgToBase64
};
