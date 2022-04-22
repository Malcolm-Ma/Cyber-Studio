var express = require('express');
var router = express.Router();

var initDB = require('../controllers/init');
// initDB.init();

const storyController = require('../controllers/story');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/get_story_list', storyController.getStoryList);

module.exports = router;
