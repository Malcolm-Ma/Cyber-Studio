/*
 * @Author: Jipu Li 
 * @Date: 2022-03-17 12:05:22 
 * @Last Modified by: Jipu Li
 * @Last Modified time: 2022-04-22 18:48:25
 */

let chat = io.connect('/chat')
let roomNo = null
let name = null
let color = randomColor()

const initForm = document.querySelector('#initial_form')
const chatInterface = document.querySelector('#chat_interface')
const storyInfo = document.querySelector('#story_info')
const canvasForm = document.querySelector('#canvas_form')

function init() {
  initForm.style.display = 'block'
  chatInterface.style.display = 'none'
  storyInfo.style.display = 'block'
  canvasForm.style.display = 'none'
}
window.onload = init

/**
 * called to generate a random room number
 * This is a simplification. A real world implementation would ask the server to generate a unique room number
 * so to make sure that the room number is not accidentally repeated across uses
 */
function generateRoom() {
  roomNo = Math.round(Math.random() * 10000);
  return 'R' + roomNo;
}

const roomNoGenerator = document.querySelector('#roomNoGenerator')
roomNoGenerator.addEventListener('click', (e) => {
  e.preventDefault()
  let roomNo = generateRoom()
  document.querySelector('#roomNo').value = roomNo
})

/**
 * used to connect to a room. It gets the user name and room number from the
 * interface
 */
const connect = document.querySelector('a#connect')
connect.addEventListener('click', async (e) => {
  e.preventDefault()
  roomNo = document.getElementById('roomNo').value;
  name = document.getElementById('name').value;
  let imageUrl = connect.dataset.doc
  console.log("imageUrl: ", imageUrl)
  if (!roomNo) {
    document.querySelector('#warning').style.display = 'block'
    document.querySelector('#roomNo').focus()
    return
  }
  if (!name) name = 'Unknown-' + Math.random();
  
  //@todo join the chat room
  chat.emit('create or join', roomNo, name)
  initCanvas(chat, imageUrl, color);
  hideLoginInterface(roomNo, name);
  await initMessageDB();
})

/**
 * it hides the initial form, shows the chat and join the room
 * @param room the selected room
 * @param userId the user name
 */
function hideLoginInterface(room, userId) {
  initForm.style.display = 'none'
  chatInterface.style.display = 'block'
  storyInfo.style.display = 'none'
  canvasForm.style.display = 'block'
  document.getElementById('who_you_are').innerHTML = userId;
  document.getElementById('in_room').innerHTML = ' ' + room;
}

const sentMsg = document.getElementById('send_msg')
const comment = document.getElementById('comment')
chat.on('message', message => {
  outputMessage(message)
})

sentMsg.addEventListener('click', (e) => {
  e.preventDefault()
  const message = comment.value
  chat.emit('chatMessage', roomNo, name, message)
  comment.value = ''
  comment.focus()
})

/**
 * it create message on the chat interface
 * @param message message reviced by socket to append
 */
function outputMessage(message) {
  // Construct the data item and store it in the database
  getMsgNum(roomNo).then(messageNum => {
    storeMessage({ roomId: roomNo, username:name, isSelf: true, msgNum: messageNum+1, content:message.text, time:message.time})
        .then(response => console.log('Inserting message worked!!'))
        .catch(error => console.log("Error inserting: "+ JSON.stringify(error)))
  })

  const li = document.createElement('li')
  li.classList.add('list-group-item')
  li.classList.add('border-0')
  li.innerHTML = `<span class="fs-6 text-success">${message.name} : </span>
                  <span class="fs-5">${message.text}</span><br>
                  <span>${message.time}</span>`
  document.getElementById('message-list').appendChild(li)
}

/**
 * it create random color for line style
 */
function randomColor() {
  let r = Math.floor(Math.random() * 256);
  let g = Math.floor(Math.random() * 256);
  let b = Math.floor(Math.random() * 256);
  let rgb = 'rgb(' + r + ',' + g + ',' + b + ')';
  return rgb;
}
