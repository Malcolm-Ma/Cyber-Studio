
var formatMessage = require('../utils/messages')
const botName = 'Chat-Bot'

exports.init = function (io) {
  const chat = io.of('/chat').on('connection', (socket) => {
    try {
      socket.on('create or join', (roomNo, name) => {
        socket.join(roomNo)
        socket.emit('message', formatMessage(botName, `Hello ${name}, welcome to the chat`))
        socket.broadcast.to(roomNo).emit('message', formatMessage(botName, `${name} has joined the chat`))

        socket.on('disconnect', () => {
          chat.to(roomNo).emit('message', formatMessage(botName, `${name} has left the chat`))
        })

        socket.on('mouse', (data) => {
          socket.broadcast.to(roomNo).emit('sendmouse', data)
        })
      })

      socket.on('chatMessage', (roomNo, name, msg) => {
        chat.to(roomNo).emit('message', formatMessage(name, msg))
      })
      
    } catch (e) {
      console.log(e.message)
    }
  })
}
