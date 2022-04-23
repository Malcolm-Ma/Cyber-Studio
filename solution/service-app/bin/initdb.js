/**
 * @file init mongo db
 * @author Mingze Ma
 */

const fs = require("fs");

const database = require('../database');

const initDB = require('../controllers/init');

const { STATIC_IMAGE_PATH } = require("../configure/database");

const { removeDir } = require('../utils/fileUtils');


const staticPath = './public' + STATIC_IMAGE_PATH;
const staticFatherPath = staticPath.split('/').slice(0, -2).join('/');
if (fs.existsSync(staticPath)) {
  removeDir(staticPath);
}
if (!fs.existsSync(staticFatherPath)) {
  fs.mkdirSync(staticFatherPath);
}
fs.mkdirSync(staticPath);

initDB.init().then(() => {
  process.exit();
});
