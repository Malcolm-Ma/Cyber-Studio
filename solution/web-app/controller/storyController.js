/*
 * @Author: Jipu Li 
 * @Date: 2022-04-16 23:08:17 
 * @Last Modified by: Jipu Li
 * @Last Modified time: 2022-04-23 16:28:21
 */

const axios = require('axios');

// API url from server-app
// let url = 'http://localhost:3001/stories'
let url = 'http://localhost:3100'


/**
 * index view, will show a list of stories
 * @req request from user  
 * @res response to the user
 */
const story_index = (req, res) => {
  axios.get(url + '/get_story_list').then(response => {
    if(response.data.status === 0){
      var story_list = []
      story_list = response.data
      res.render('index', { stories: story_list.data, title: "All Stories" })
    }else{
      console.log(response.data.message)
    }
  }).catch(err => {
    console.log(err.message)
  })
}

/**
 * redirect to the create_story view
 * @req request from user  
 * @res response to the user
 */
const story_create_get = (req, res) => {
  res.render('create_story', { title: 'Create' })
}

/**
 * Create a new Story, and send new story info to server-app
 * @req request from user  
 * @res response to the user
 */
const story_create_post = (req, res) => {

}

/**
 * Show the story details, include photo, title and content
 * @req request from user  
 * @res response to the user
 */
const story_details = (req, res) => {
  // const roomId = req.body.roomId
  // const storyId = req.body.storyId
  const storyId = req.params.id
  console.log("details", storyId)
  axios.get(url + "/get_story_detail?story_id=" + storyId).then(response => {
    var story = []
    if (response.data.status === 0) {
      story = response.data
      res.render('details', { story: story.data, title: "Story Details" })
    } else {
      console.log(response.data.message)
    }
  }).catch(err => {
    console.log(err.message)
  })
}

/**
 * Delete the story by id
 * @req request from user  
 * @res response to the user
 */
const story_delete = (req, res) => {

}

module.exports = {
  story_index,
  story_create_get,
  story_create_post,
  story_details,
  story_delete,
}
