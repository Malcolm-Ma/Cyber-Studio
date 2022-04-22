/**
 * @file utils for file
 * @author Mingze Ma
 */

const fs = require("fs");
const path = require("path");

function removeDir(dir) {
  let files = fs.readdirSync(dir)
  for (let i = 0; i < files.length; i++) {
    let newPath = path.join(dir, files[i]);
    let stat = fs.statSync(newPath)
    if (stat.isDirectory()) {
      // If it is a folder, it will recurse
      removeDir(newPath);
    } else {
      // delete file
      fs.unlinkSync(newPath);
    }
  }
  fs.rmdirSync(dir) // If the folder is empty, delete itself
}

module.exports = {
  removeDir,
};
