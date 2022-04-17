
var formatMessage = require('../utils/messages')
const randName = 'anonymity'


exports.init = function (io) {
  io.sockets.on('connection', function (socket) {
    try {
      // insert here your event
      socket.on('joinRoom', room => {
        socket.join(room)

        socket.emit('message', formatMessage(randName, 'welcome to the chat'))

        socket.broadcast.to(room).emit('message', formatMessage(randName, 'an agent has join the chat'))

        socket.on('disconnect', () => {
          io.to(room).emit('message', formatMessage(randName, 'an agent left chat'))
        })

        socket.on('chatMessage', msg => {
          io.to(room).emit('message', formatMessage(randName, msg))
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
