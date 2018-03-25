const RoomsManager = require('./rooms')

module.exports = (io, socket) => {
    // Join the room
  socket.on('joined-room', newUserData => {
    const {presentationId, user} = newUserData
    if (user) {
      if (socket.room) {
        socket.leave(socket.room)
        RoomsManager.ejectUserFromRoom(socket.room, user)
      }

      const room = `room-${presentationId}`
      socket.user = user
      socket.room = room
      RoomsManager.addUserToRoom(room, user)
      socket.join(room)

      io.in(room).emit('refresh-users-list', RoomsManager.usersInRoom(room))
    }
  })

  socket.on('left-room', () => {
    socket.leave(socket.room)
    RoomsManager.ejectUserFromRoom(socket.room, socket.user)
    io.in(socket.room).emit('refresh-users-list', RoomsManager.usersInRoom(socket.room))
  })

  socket.on('renamed-presentation', ({presentationId, newTitle}) => {
    console.info(`${socket.user.forename} renamed a presentation to '${newTitle}' - telling everyone else..`)
    socket.to(socket.room).emit('renamed-presentation', newTitle)
  })

  socket.on('modified-slides', ({presentationId, slides}) => {
    console.info(`${socket.user.forename} modified slides - telling everyone else..`)
    socket.to(socket.room).emit('modified-slides', slides)
  })

  socket.on('deleted-presentation', presentationId => {
    console.info(`${socket.user.forename} deleted the presentation - telling everyone else..`)
    socket.to(socket.room).emit('deleted-presentation', presentationId)
  })

  socket.on('changed-slide-background-colour', ({slideIndex, slide}) => {
    console.info(`${socket.user.forename} changed the slide background colour - telling everyone else..`)
    socket.to(socket.room).emit('changed-slide-background-colour', {slideIndex, slide})
  })

  socket.on('modified-elements', ({slideIndex, elements}) => {
    console.info(`${socket.user.forename} changed elements - telling everyone else..`)
    socket.to(socket.room).emit('modified-elements', {slideIndex, elements})
  })
}
