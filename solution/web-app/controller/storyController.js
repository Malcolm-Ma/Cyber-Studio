/*
 * @Author: Jipu Li 
 * @Date: 2022-04-16 23:08:17 
 * @Last Modified by: Jipu Li
 * @Last Modified time: 2022-04-22 18:49:43
 */

const axios = require('axios');

// API url from server-app
let url = 'http://localhost:3001/stories'

/**
 * index view, will show a list of stories
 * @req request from user  
 * @res response to the user
 */
const story_index = (req, res) => {
  axios.get(url).then(response => {
    res.render('index', { stories: response.data, title: "All Stories" })
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
  axios.get(url + "/" + storyId).then(response => {
    res.render('details', { story: response.data, title: "Story Details" })
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
