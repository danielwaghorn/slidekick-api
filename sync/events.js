module.exports = (socket) => {
    // Join the room
  socket.on('joined-room', newUserData => {
    const {presentationId, user} = newUserData
    if (user) {
      if (socket.room) {
        socket.leave(socket.room)
      }

      const room = `room-${presentationId}`
      socket.user = user
      console.log(`${user.forename} joined room ${presentationId}`)

      socket.room = room
      socket.join(room)
      socket.to(room).emit('user-joined-room', user)
    }
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
