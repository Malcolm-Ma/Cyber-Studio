/*
 * @Author: Jipu Li 
 * @Date: 2022-03-17 12:05:22 
 * @Last Modified by: Jipu Li
 * @Last Modified time: 2022-03-20 17:50:38
 */



window.addEventListener("load", () => {
  const canvas = document.querySelector('#canvas')
  const ctx = canvas.getContext('2d')

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

    ctx.lineTo(e.clientX, e.clientY)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(e.clientX, e.clientY)
  }

  canvas.addEventListener('mousedown', startPosition)
  canvas.addEventListener('mouseup', finishPosition)
  canvas.addEventListener('mousemove', draw)

})

const params = window.location.pathname
const regex = /[0-9]+/
const roomId = params.match(regex)[0]

const socket = io()

const sentMsg = document.getElementById('send_msg')
const comment = document.getElementById('comment')

socket.emit('joinRoom', roomId)


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


