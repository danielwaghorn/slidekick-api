module.exports = (io, socket) => {
    const rooms = {}

    // Join the room
    socket.on('joined-room', newUserData => {
        const {presentationId, user} = newUserData
        if (socket.room) {
            socket.leave(socket.room);
        }

        const room = `room-${presentationId}`

        if (!rooms[room]) {
            rooms[room] = {
                users: [user]
            }
        } else {
            rooms[room].users.push(user)
        }

        socket.room = room
        socket.join(room)

        console.log(`${user.name} joined ${room}. Connected users:`)
        console.log(rooms[room].users)
    });

    socket.on('user-disconnected', leavingUserData => {
        const {presentationId, user} = leavingUserData
        const room = `room-${presentationId}`
        rooms[room].users.splice(rooms[room].indexOf(user.name), 1)

        console.log(`${user.name} left ${room}. Connected users:`)
        console.log(rooms[room].users)
    })

    socket.on('renamed-presentation', presentationId => socket.broadcast.emit('renamed-presentation', presentationId))

    socket.on('reordered-slides', ({presentationId, slides}) => socket.broadcast.emit('reordered-slides', {presentationId, slides}))

    socket.on('deleted-presentation', presentationId => socket.broadcast.emit('deleted-presentation', presentationId))

    socket.on('deleted-slide', slideId => socket.broadcast.emit('deleted-slide', slideId))

    socket.on('changed-slide-background-colour', slide => socket.broadcast.emit('changed-slide-background-colour', slide))

    socket.on('created-element', element => socket.broadcast.emit('created-element', element))

    socket.on('deleted-element', element => socket.broadcast.emit('deleted-element', element))

    socket.on('edited-text-element', element => socket.broadcast.emit('edited-text-element', element))

    socket.on('edited-image-element', element => socket.broadcast.emit('edited-image-element', element))
    
}