/*
 * @Author: Jipu Li 
 * @Date: 2022-03-17 13:42:49 
 * @Last Modified by: Jipu Li
 * @Last Modified time: 2022-03-19 17:31:06
 */

var express = require('express')
var router = express.Router()

const { getStories, getStory, createStore } = require('../utils/story')

router.get('/', function (req, res, next) {
  res.render('story_detail');
});

module.exports = router;
