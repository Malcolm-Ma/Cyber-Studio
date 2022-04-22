/**
 * @file init mongo db
 * @author Mingze Ma
 */

var database = require('../database');

var initDB = require('../controllers/init');

initDB.init().then(() => {
  process.exit();
});
