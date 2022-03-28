/*
 * @Author: Jipu Li 
 * @Date: 2022-03-19 13:58:11 
 * @Last Modified by: Jipu Li
 * @Last Modified time: 2022-03-28 20:12:34
 */

const moment = require('moment')
const axios = require('axios');


let url = 'http://localhost:3001/stories'
var stories = getStories()
var story = []

function getStories() {
  axios.get(url).then(function (response) {
    stories = response.data
  }).catch(function (err) {
    console.log(err)
  })
  return stories
}

function getStory(id) {
  axios.get(url + "/" + id).then(function (response) {
    story = response.data
  }).catch(err => {
    console.log(err)
  })
  return story
}

function createStory(title, author, photo, content) {
  const date = moment().format('h:mm a')
  const story = { title, photo, author, content, date }


  axios({
    method: 'post',
    url: url,
    data: story,
    headers: { 'Content-Type': 'application/json' }
  }).then(function (response) {
    console.log(response.data)
  }).catch(err => {
    console.log(err)
  })
}

module.exports = { getStories, getStory, createStory }