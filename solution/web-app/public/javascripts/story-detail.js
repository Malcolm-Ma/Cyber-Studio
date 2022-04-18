/*
 * @Author: Jipu Li 
 * @Date: 2022-03-17 12:05:22 
 * @Last Modified by: Jipu Li
 * @Last Modified time: 2022-04-18 00:14:58
 */


let socket = io()
let roomNo = null
let name = null
let imgUrl = '/images/landmark03.jpeg'
var color = ''

const params = window.location.pathname
const regex = /[0-9]+/
const roomId = params.match(regex)[0]

socket.emit('joinRoom', roomId)
// get color from server

function init() {
  initCanvas(socket, imgUrl)
  fetch('/color')
  .then(response => response.json())
  .then(function(data){
    color = data.color
  })
}

window.onload = init

const sentMsg = document.getElementById('send_msg')
const comment = document.getElementById('comment')

socket.on('message', message => {
  outputMessage(message)
})

sentMsg.addEventListener('click', (e) => {
  e.preventDefault()

  const message = comment.value

  socket.emit('chatMessage', message)

  comment.value = ''
  comment.focus()
})

function outputMessage(message) {
  const li = document.createElement('li')
  li.classList.add('list-group-item')
  li.classList.add('border-0')
  li.innerHTML = `<span class="fs-6 text-success">${message.name} : </span>
                  <span class="fs-5">${message.text}</span><br>
                  <span>${message.time}</span>`
  document.getElementById('message-list').appendChild(li)
}

async function fetchColor(){
  const response = await fetch('/color')
  const color = await response.json()
  return color
}