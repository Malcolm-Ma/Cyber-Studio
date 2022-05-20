/**
 * @file image utils
 * @author Mingze Ma
 */

const http = require('http');

/**
 * Convert image to base64 code string
 * @param url image URL
 */
async function imgUrlToBase64(url) {
  let base64Img
  return new Promise(function (resolve, reject) {
    let req = http.get(url, function (res) {
      var chunks = [];
      var size = 0;
      res.on('data', function (chunk) {
        chunks.push(chunk);
        size += chunk.length;　　//累加缓冲数据的长度
      });
      res.on('end', function (err) {
        var data = Buffer.concat(chunks, size);
        base64Img = data.toString('base64');
        resolve({ success: true, base64Img });
      });
    })
    req.on('error', (e) => {
      resolve({ success: false, errmsg: e.message });
    });
    req.end();
  });
}

module.exports = {
  imgUrlToBase64
};
