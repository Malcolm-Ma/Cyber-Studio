// Google Knowledge Graph
const service_url = 'https://kgsearch.googleapis.com/v1/entities:search';
const apiKey = 'AIzaSyAG7w627q-djB4gTTahssufwNOImRqdYKM';

let chat = io.connect('/chat')
let roomNo = null
let name = null
let color = randomColor()


const initForm = document.querySelector('#initial_form')
const chatInterface = document.querySelector('#chat_interface')
const storyInfo = document.querySelector('#story_info')
const canvasForm = document.querySelector('#canvas_form')
const messagelist = document.getElementById('message-list')
const messageContainer = document.querySelector("#message-container")
const canvas = document.querySelector("#canvas")

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
  let storyId = connect.dataset.sid
  console.log("story id: ", storyId)
  console.log("imageUrl: ", imageUrl)
  if (!roomNo) {
    document.querySelector('#warning').style.display = 'block'
    document.querySelector('#roomNo').focus()
    return
  }
  if (!name) name = 'Unknown-' + Math.random();

  //@todo join the chat room
  chat.emit('create or join', roomNo, name)
  initCanvas(chat, imageUrl, color, roomNo);
  hideLoginInterface(roomNo, name);
  canvas.setAttribute('style', `border-width: 2px; border-style: solid; border-color: ${color};`)

  await initMessageDB();
  await initCanvasDB();
  await initRoomToStoryDB();
  await checkRoomAvailable(true, roomNo, storyId)
    .then(async result => {
      // user enter the room with history
      console.log('Result ', result);
      if (result) {
        console.log('Access room ', roomNo, ' successfully.');
        await getMessageList(roomNo)
          .then(list => {
            console.log(JSON.stringify(list));
            outputHistory(list);
          })
      }
      // user enter a new/empty room
      else {
        console.log('Access room ', roomNo, ' successfully.');

      }
    })
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
  document.getElementById('who_you_are').style.color = color;
  document.getElementById('in_room').innerHTML = ' ' + room;
}

const sentMsg = document.getElementById('send_msg')
const comment = document.getElementById('comment')
chat.on('message', message => {
  console.log("Receive a chat!")
  outputMessage(message)
  messageContainer.scrollTop = messageContainer.scrollHeight
})

sentMsg.addEventListener('click', (e) => {

  e.preventDefault()
  const message = comment.value
  if (message !== '') {
    chat.emit('chatMessage', roomNo, name, message)
    comment.value = ''
    comment.focus()
  }

})
comment.addEventListener('keyup', (e) => {
  e.preventDefault()
  const message = comment.value
  if (e.key === "Enter" && message !== '') {
    chat.emit('chatMessage', roomNo, name, message)
    comment.value = ''
    comment.focus()
  }
})

/**
 * it create message on the chat interface
 * @param message message reviced by socket to append
 */
function outputMessage(message) {
  const li = document.createElement('li')
  li.classList.add('list-group-item')
  li.classList.add('border-0')

  if (name == message.name) {
    li.classList.add('text-end')
    li.innerHTML = `
    <span class="fs-5 ">${message.text}</span>
    <span class="fs-6 text-success">: ${message.name}</span><br>
    <span>${message.time}</span>`
    messagelist.appendChild(li)
  } else {
    li.innerHTML = `
    <span class="fs-6 text-success ">${message.name} : </span>
    <span class="fs-5 ">${message.text}</span><br>
    <span>${message.time}</span>`
    messagelist.appendChild(li)
  }

  // Construct the data item and store it in the database
  if (message.name !== "Chat-Bot") {
    getMsgNum(roomNo).then(async messageNum => {
      generateID().then(async result => {
        console.log("Return result !!! ",result);
        storeMessage({ id: result + 1, roomId: roomNo, username: name, isSelf: true, msgNum: messageNum + 1, content: message.text, time: message.time })
          .then(async response => console.log('Inserting message worked!!'))
          .catch(async error => console.log("Error inserting: " + JSON.stringify(error)))
      })
    })
  }
}


/**
 * it create message on the chat interface
 * @param message message reviced by socket to append
 */
function outputMsgHistory(message) {
  for (let msg of message) {
    const li = document.createElement('li')
    li.classList.add('list-group-item')
    li.classList.add('border-0')
    li.innerHTML = `<span class="fs-6 text-success">${msg.username} : </span>
                  <span class="fs-5">${msg.content}</span><br>
                  <span>${msg.time}</span>`
    document.getElementById('message-list').appendChild(li)
  }

  const hint = document.createElement('hint')
  hint.innerHTML = `<span class="text-muted">above is history message</span>`
  document.getElementById('message-list').appendChild(hint)

}

/**
 * it outputs the history of draws in specific room
 * @param test
 */
function outputDrawsHistory(test){
  console.log("draw history!!!");
}

/**
 * it shows the history includes messages and canvas
 * @param message message reviced by socket to append
 */
function outputHistory(message){
  outputMsgHistory(message);
  outputDrawsHistory();
}


/**
 * it inits the widget by selecting the type from the field myType
 * and it displays the Google Graph widget
 * it also hides the form to get the type
 */
function widgetInit() {
  let type = document.getElementById("myType").value;
  if (type) {
    let config = {
      'limit': 10,
      'languages': ['en'],
      'types': [type],
      'maxDescChars': 100,
      'selectHandler': selectItem,
    }
    KGSearchWidget(apiKey, document.getElementById("myInput"), config);
    document.getElementById('typeSet').innerHTML = 'of type: ' + type;
    document.getElementById('widget').style.display = 'block';
    document.getElementById('typeForm').style.display = 'none';
  }
  else {
    alert('Set the type please');
    document.getElementById('widget').style.display = 'none';
    document.getElementById('resultPanel').style.display = 'none';
    document.getElementById('typeSet').innerHTML = '';
    document.getElementById('typeForm').style.display = 'block';
  }
}

/**
 * callback called when an element in the widget is selected
 * @param event the Google Graph widget event {@link https://developers.google.com/knowledge-graph/how-tos/search-widget}
 */
function selectItem(event) {
  let row = event.row;
  // document.getElementById('resultImage').src= row.json.image.url;

  chat.emit('emitKGraph', roomNo,row, name, color)
}

function outputKGraph(row, name, color) {
  const result = `
  <h3 id="resultName">${row.name}</h3>
  <h4 id="resultId">id: ${row.id}</h4>
  <div id="resultDescription">${row.rc}</div>
  <div>
    <a id="resultUrl" target="_blank" href="${row.qc}">
      Link to Webpage
    </a>
  </div>
`;

  const resultContainer = document.querySelector('#resultContainer')
  const resultPanel = document.createElement('div')
  resultPanel.classList.add('p-1')
  resultPanel.innerHTML = result
  resultContainer.appendChild(resultPanel)
  resultPanel.setAttribute('style', `border-width: 2px; border-style: solid; border-color: ${color};`)

}

chat.on('KGraph', data => {
  console.log(data)
  outputKGraph(data.grow, data.gname, data.gcolor)
})

/**
 * currently not used. left for reference
 * @param id
 * @param type
 */
function queryMainEntity(id, type) {
  const params = {
    'query': mainEntityName,
    'types': type,
    'limit': 10,
    'indent': true,
    'key': apiKey,
  };
  $.getJSON(service_url + '?callback=?', params, function (response) {
    $.each(response.itemListElement, function (i, element) {

      $('<div>', { text: element['result']['name'] }).appendTo(document.body);
    });
  });
}