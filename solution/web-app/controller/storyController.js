/*
 * @Author: Jipu Li 
 * @Date: 2022-04-16 23:08:17 
 * @Last Modified by: Jipu Li
 * @Last Modified time: 2022-04-16 23:50:01
 */

const moment = require('moment')
const axios = require('axios');

let url = 'http://localhost:3001/stories'
var story = []
var stories = []

const story_index = (req, res) => {
  axios.get(url).then(response => {
    stories = response.data
    res.render('index', { stories })
  }).catch(err => {
    console.log(err.message)
  })
}

const story_create_post = (req, res) => {
}

const story_create_get = (req, res) => {
  res.render('create_story', { title: 'Create' })
}

const story_details = (req, res) => {
  const id = req.params.id
  console.log("story_details" ,id)
  axios.get(url + "/" + id).then(response => {
    story = response.data
    res.render('story_detail', { story })
  }).catch(err => {
    console.log(err.message)
  })
}

const story_delete = (req, res) => {

}


module.exports = {
  story_index,
  story_create_get,
  story_create_post,
  story_details,
  story_delete
}
