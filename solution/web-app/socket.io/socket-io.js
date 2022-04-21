
var formatMessage = require('../utils/messages')
const botName = 'Chat-Bot'

exports.init = function (io) {
  io.sockets.on('connection', function (socket) {
    try {
      socket.on('joinRoom', room => {
        socket.join(room)

        socket.emit('message', formatMessage(botName, 'welcome to the chat'))

        socket.broadcast.to(room).emit('message', formatMessage(botName, 'an agent has join the chat'))

        socket.on('disconnect', () => {
          io.to(room).emit('message', formatMessage(botName, 'an agent left chat'))
        })

        socket.on('chatMessage', msg => {
          io.to(room).emit('message', formatMessage(msg.chatName, msg.chatMessage))
        })

        socket.on('mouse', data => {
          socket.broadcast.to(room).emit('sendmouse', data)
        })
      })
    } catch (e) {
      console.log(e.message)
    }
  });
}
