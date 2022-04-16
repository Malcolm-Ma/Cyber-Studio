/*
 * @Author: Jipu Li 
 * @Date: 2022-03-17 13:42:49 
 * @Last Modified by: Jipu Li
 * @Last Modified time: 2022-04-16 01:44:50
 */

var express = require('express')
var router = express.Router()


const { getStories, getStory, createStore } = require('../utils/story')

// Get story detail page
router.get('/:id', (req, res) => {
  const story = getStory(parseInt(req.params.id))
  if (story) {
    res.render('story_detail', { story })
  } else {
    console.log('can not find story')
  }
})

router.get('/color', (req, res) => {
  
})

module.exports = router;
