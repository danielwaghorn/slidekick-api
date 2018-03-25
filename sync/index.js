module.exports = server => {
  const io = require('socket.io')(server)
  const events = require('./events')

  io.on('connection', socket => events(io, socket))
}
