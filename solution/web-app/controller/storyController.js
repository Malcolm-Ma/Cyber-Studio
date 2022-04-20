/*
 * @Author: Jipu Li 
 * @Date: 2022-04-16 23:08:17 
 * @Last Modified by: Jipu Li
 * @Last Modified time: 2022-04-20 16:23:10
 */

const moment = require('moment')
const axios = require('axios');
const randomColor = require('../utils/colors')

// API url from server-app
let url = 'http://localhost:3001/stories'

const story_index = (req, res) => {
  axios.get(url).then(response => {
    res.render('index', { stories: response.data, title: "All Stories" })
  }).catch(err => {
    console.log(err.message)
  })
}

const story_create_get = (req, res) => {
  res.render('create_story', { title: 'Create' })
}

const story_create_post = (req, res) => {

}

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

const story_delete = (req, res) => {

}

const random_color = (req, res) => {
  const color = randomColor()
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ color: color }))
}

module.exports = {
  story_index,
  story_create_get,
  story_create_post,
  story_details,
  story_delete,
  random_color
}
