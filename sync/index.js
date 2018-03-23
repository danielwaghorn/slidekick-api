module.exports = server => {
    var io = require('socket.io')(server);

    io.on('connection', socket => require('./events')(io, socket));
}