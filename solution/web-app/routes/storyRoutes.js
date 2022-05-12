/*
 * @Author: Jipu Li 
 * @Date: 2022-03-17 13:42:49 
 * @Last Modified by: Jipu Li
 * @Last Modified time: 2022-04-24 19:31:42
 */

var express = require('express')
var router = express.Router()
const storyController = require('../controller/storyController')

router.get('/', storyController.story_index)
router.get('/create', storyController.story_create_get)
router.post('/create', storyController.story_create_post)
router.post('/upload_image', storyController.upload_image)
router.get('/details/:id', storyController.story_details)
router.delete('/stories/:id', storyController.story_delete)

module.exports = router;
