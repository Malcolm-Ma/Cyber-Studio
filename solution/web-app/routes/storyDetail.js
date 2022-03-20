/*
 * @Author: Jipu Li 
 * @Date: 2022-03-17 13:42:49 
 * @Last Modified by: Jipu Li
 * @Last Modified time: 2022-03-20 15:01:31
 */

var express = require('express')
var router = express.Router()

const { getStories, getStory, createStore } = require('../utils/story')

router.get('/', function (req, res, next) {
  res.render('story_detail');
});

router.get('/:id', (req,res)=>{

  const story = getStory(parseInt(req.params.id))
  console.log(story)
  console.log(req.params.id)
  if(story){
    res.render('story_detail', {story})
  }  else{
    console.log('can not find story')
  }
})

module.exports = router;
