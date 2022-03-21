/*
 * @Author: Jipu Li 
 * @Date: 2022-03-21 23:05:19 
 * @Last Modified by: Jipu Li
 * @Last Modified time: 2022-03-21 23:44:12
 */

var express = require('express');
var router = express.Router();
const formidable = require('formidable')


const { getStories, getStory, createStory } = require('../utils/story')

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
  const form = formidable({ uploadDir: './public/images' });
  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    const stories = createStory(fields.title, fields.author, files.photo.filepath, fields.content)
    console.log("1+",stories.length)
    res.render('index', {stories})
    return 
  });
});


module.exports = router;