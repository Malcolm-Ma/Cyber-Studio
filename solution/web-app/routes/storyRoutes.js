/*
 * @Author: Jipu Li 
 * @Date: 2022-03-17 13:42:49 
 * @Last Modified by: Jipu Li
 * @Last Modified time: 2022-04-16 23:49:09
 */

var express = require('express')
var router = express.Router()
const storyController = require('../controller/storyController')

router.route('/').get(storyController.story_index)
  .post(storyController.story_create_post)
router.get('/create', storyController.story_create_get)
router.get('/stories/:id', storyController.story_details)
router.delete('/stories/:id', storyController.story_delete)

module.exports = router;
