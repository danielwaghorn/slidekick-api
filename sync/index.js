module.exports = server => {
  var io = require('socket.io')(server)

  io.on('connection', require('./events'))
}
