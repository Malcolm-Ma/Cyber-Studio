/*
 * @Author: Jipu Li
 * @Date: 2022-03-17 13:42:49
 * @Last Modified by: Jipu Li
 * @Last Modified time: 2022-05-18 16:06:30
 */

var express = require('express')
var router = express.Router()
const storyController = require('../controller/storyController')

router.get('/', storyController.story_index)
router.get('/get_story_list', storyController.story_list)
router.get('/order_by_date', storyController.story_list_date)
router.get('/order_by_author', storyController.sotry_list_author)
router.get('/order_by_date_des', storyController.story_list_date_des)
router.get('/order_by_author_des', storyController.story_list_author_des)
router.get('/create', storyController.story_create_get)
router.post('/create_story', storyController.story_create_post)
router.post('/upload_image', storyController.upload_image)
router.get('/details/:id', storyController.story_details)
router.delete('/stories/:id', storyController.story_delete)

module.exports = router;
