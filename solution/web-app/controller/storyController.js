/*
 * @Author: Jipu Li 
 * @Date: 2022-04-16 23:08:17 
 * @Last Modified by: Jipu Li
 * @Last Modified time: 2022-04-24 16:39:05
 */

const axios = require('axios');
const { response } = require('express');

// API url from server-app
let url = 'http://localhost:3100'

// this is for storing image URL from server-app
let imageURL = ''

/**
 * index view, will show a list of stories
 * @req request from user  
 * @res response to the user
 */
const story_index = (req, res) => {
  axios.get(url + '/get_story_list').then(response => {
    if (response.data.status === 0) {
      var story_list = []
      story_list = response.data
      res.render('index', { stories: story_list.data, title: "All Stories" })
    } else {
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
  const story_info = req.body
  console.log("story_info", story_info)
  console.log("imageURL", imageURL)

  if (story_info != null && imageURL != '') {
    axios.post(url + "/create_story", {
      title: story_info.title,
      content: story_info.content,
      author: story_info.author,
      photo: imageURL
    }).then(response => {
      res.status(201).json({ story: response.data.data.story_id })
    }).catch(err => {
      res.status(400).json({ err: response.data.message })
    })
  } else {
    res.status(400).json({err: "story_info or image cannot be empty"})
  }
}

/**
 * upload the image with base64 format to server-app
 * @req request from user  
 * @res response to the user
 */
const uploadImage = (req, res) => {
  const image = req.body
  axios.post(url + '/upload_image', image).then(response => {
    imageURL = response.data.data.url
    console.log("url", imageURL)
  }).catch(err => {
    console.log(err.message)
    res.json({err: err.message})
  })
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
  uploadImage
}
