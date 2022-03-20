/*
 * @Author: Jipu Li 
 * @Date: 2022-03-19 13:58:11 
 * @Last Modified by: Jipu Li
 * @Last Modified time: 2022-03-20 23:38:54
 */

const stories = [
  {
    id: 1,
    title: 'this is a story title',
    photo: 'this is photo path',
    content: 'this is story content',
    author: 'John',
    date: '2022/4/1'
  },
  {
    id: 2,
    title: 'this is a story title',
    photo: 'this is photo path',
    content: 'this is story content',
    author: 'Kim',
    date: '2022/4/1'
  },
  {
    id: 3,
    title: 'this is a story title',
    photo: 'this is photo path',
    content: 'this is story content',
    author: 'Park',
    date: '2022/4/1'
  },
  {
    id: 4,
    title: 'this is a story title',
    photo: 'this is photo path',
    content: 'this is story content',
    author: 'Lee',
    date: '2022/4/1'
  }
]


function getStories() {
  return stories
}

function getStory(id) {
  return stories.find(story => story.id === id)
}

function createStory(id, title, photo, author, content, date) {
  const story = { id, title, photo, author, content, date }
  stories.push(story)
  return stories
}

module.exports = { getStories, getStory, createStory }