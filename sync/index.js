module.exports = server => {
    var io = require('socket.io')(server);

    io.on('connection', socket => {
        // Join the room
        socket.on('joined-room', presentationId => {
            if (socket.room) {
                socket.leave(socket.room);
            }

            const room = `room-${presentationId}`
            socket.room = room
            socket.join(room)
        });
    });
}