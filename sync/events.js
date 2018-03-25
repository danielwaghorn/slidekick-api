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

  socket.on('reordered-slides', ({presentationId, slides}) => {
    console.info(`${socket.user.forename} reordered slides - telling everyone else..`)
    socket.to(socket.room).emit('reordered-slides', {presentationId, slides})
  })

  socket.on('deleted-presentation', presentationId => {
    console.info(`${socket.user.forename} deleted the presentation - telling everyone else..`)
    socket.to(socket.room).emit('deleted-presentation', presentationId)
  })

  socket.on('deleted-slide', slideId => {
    console.info(`${socket.user.forename} deleted a slide - telling everyone else..`)
    socket.to(socket.room).emit('deleted-slide', slideId)
  })

  socket.on('changed-slide-background-colour', slide => {
    console.info(`${socket.user.forename} changed the slide background colour - telling everyone else..`)
    socket.to(socket.room).emit('changed-slide-background-colour', slide)
  })

  socket.on('created-element', elements => {
    console.info(`${socket.user.forename} added a new element - telling everyone else..`)
    socket.to(socket.room).emit('created-element', elements)
  })

  socket.on('deleted-element', element => {
    console.info(`${socket.user.forename} deleted an element - telling everyone else..`)
    socket.to(socket.room).emit('deleted-element', element)
  })

  socket.on('edited-text-element', element => {
    console.info(`${socket.user.forename} edited a text element - telling everyone else..`)
    socket.to(socket.room).emit('edited-text-element', element)
  })

  socket.on('edited-image-element', element => {
    console.info(`${socket.user.forename} editing an image element - telling everyone else..`)
    socket.to(socket.room).emit('edited-image-element', element)
  })
}
