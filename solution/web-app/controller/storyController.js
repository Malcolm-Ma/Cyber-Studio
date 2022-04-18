/*
 * @Author: Jipu Li 
 * @Date: 2022-04-16 23:08:17 
 * @Last Modified by: Jipu Li
 * @Last Modified time: 2022-04-17 19:27:28
 */

const moment = require('moment')
const axios = require('axios');
const randomColor = require('../utils/colors')

// API url from server-app
let url = 'http://localhost:3001/stories'

const story_index = (req, res) => {
  var stories = []
  axios.get(url).then(response => {
    stories = response.data
    res.render('index', { stories })
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
  var story = []
  const id = req.params.id
  console.log("story_details", id)
  axios.get(url + "/" + id).then(response => {
    story = response.data
    res.render('story_detail', { story })
  }).catch(err => {
    console.log(err.message)
  })
}

const story_delete = (req, res) => {

}

const random_color = (req, res) => {
  const color  = randomColor()
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({color: color}))
}

module.exports = {
  story_index,
  story_create_get,
  story_create_post,
  story_details,
  story_delete,
  random_color
}
