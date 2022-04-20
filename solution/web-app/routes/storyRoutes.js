/*
 * @Author: Jipu Li 
 * @Date: 2022-03-17 13:42:49 
 * @Last Modified by: Jipu Li
 * @Last Modified time: 2022-04-20 16:24:15
 */

var express = require('express')
var router = express.Router()
const storyController = require('../controller/storyController')

router.route('/').get(storyController.story_index)
  .post(storyController.story_create_post)
router.get('/create', storyController.story_create_get)
router.get('/details/:id', storyController.story_details)
router.delete('/stories/:id', storyController.story_delete)
router.get('/color', storyController.random_color)

module.exports = router;
