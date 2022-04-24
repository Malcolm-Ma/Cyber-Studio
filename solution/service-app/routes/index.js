var express = require('express');
var router = express.Router();

var initDB = require('../controllers/init');
// initDB.init();

const storyController = require('../controllers/story');
const assetController = require('../controllers/asset');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/get_story_list', storyController.getStoryList);

router.post('/create_story', storyController.createStory);

router.get('/get_story_detail', storyController.getStoryDetail);

router.post('/upload_image', assetController.uploadImage);

module.exports = router;
