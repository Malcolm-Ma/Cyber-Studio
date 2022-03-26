var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var http = require('http')
var bodyParser = require('body-parser')
const socketio = require('socket.io')



var indexRouter = require('./routes/index');
var storyRouter = require('./routes/storyDetail')

var formatMessage = require('./utils/messages')


var app = express();
var server = http.createServer(app)


const io = socketio(server)


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


app.use('/', indexRouter);
app.use('/story', storyRouter)

const randName = '007'

io.on('connection', socket => {
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

    socket.on('mouse', newDraw=>{
      socket.broadcast.to(room).emit('mouseDraw', newDraw)
    })
  })
})


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = { app: app, server: server };
