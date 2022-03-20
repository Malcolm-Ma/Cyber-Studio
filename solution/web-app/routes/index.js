var express = require('express');
var router = express.Router();

const { getStories, getStory, createStore } = require('../utils/story')

/* GET home page. */
router.get('/', function (req, res, next) {
  const stories = getStories()
  console.log(stories.length)
  res.render('index', { stories });
});

router.get('/create', (req, res, next) => {
  res.render('create_story')
})

router.post('/create', (req, res, next) => {
  console.log(res.body)
})

module.exports = router;