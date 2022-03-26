/*
 * @Author: Jipu Li 
 * @Date: 2022-03-17 12:05:22 
 * @Last Modified by: Jipu Li
 * @Last Modified time: 2022-03-26 17:29:08
 */

const canvas = document.querySelector('#canvas')
const ctx = canvas.getContext('2d')

const socket = io()

const params = window.location.pathname
const regex = /[0-9]+/
const roomId = params.match(regex)[0]

socket.emit('joinRoom', roomId)

canvas.height = window.innerHeight / 2
canvas.width = window.innerWidth / 2

var data = {
  x: 0,
  y: 0
}

var img = new Image()
img.onload = function () {
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
}
img.src = '/images/landmark01.jpeg'


let painting = false

function startPosition(e) {
  painting = true
  draw(e)
}

function finishPosition() {
  painting = false
  ctx.beginPath()
}


function draw(e) {
  if (!painting) return

  ctx.lineWidth = 5;
  ctx.lineCap = 'round'
  ctx.strokeStyle = 'red'

  var mouseX = e.clientX
  var mouseY = e.clientY - 60

  ctx.lineTo(mouseX, mouseY)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(mouseX, mouseY)
  data.x = mouseX
  data.y = mouseY

  socket.emit('mouse', data)
}

function drawBySocketIo(data) {
  ctx.lineWidth = 5;
  ctx.lineCap = 'round'
  ctx.strokeStyle = 'green'

  var mouseX = data.x
  var mouseY = data.y

  ctx.lineTo(mouseX, mouseY)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(mouseX, mouseY)
}

canvas.addEventListener('mousedown', startPosition)
canvas.addEventListener('mouseup', finishPosition)
canvas.addEventListener('mousemove', draw)

socket.on('mouseDraw', newDraw => {
  console.log(newDraw)
  drawBySocketIo(newDraw)
})


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
  console.log('message add')
  const li = document.createElement('li')
  li.classList.add('list-group-item')
  li.classList.add('border-0')
  li.innerHTML = `<span class="fs-6 text-success">${message.name} : </span>
                  <span class="fs-5">${message.text}</span><br>
                  <span>${message.time}</span>`

  document.getElementById('message-list').appendChild(li)
}


