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

  socket.on('renamed-presentation', ({presentationId, newTitle}) => socket.to(socket.room).emit('renamed-presentation', {presentationId, newTitle}))

  socket.on('reordered-slides', ({presentationId, slides}) => socket.to(socket.room).emit('reordered-slides', {presentationId, slides}))

  socket.on('deleted-presentation', presentationId => socket.to(socket.room).emit('deleted-presentation', presentationId))

  socket.on('deleted-slide', slideId => socket.to(socket.room).emit('deleted-slide', slideId))

  socket.on('changed-slide-background-colour', slide => socket.to(socket.room).emit('changed-slide-background-colour', slide))

  socket.on('created-element', element => socket.to(socket.room).emit('created-element', element))

  socket.on('deleted-element', element => socket.to(socket.room).emit('deleted-element', element))

  socket.on('edited-text-element', element => socket.to(socket.room).emit('edited-text-element', element))

  socket.on('edited-image-element', element => socket.to(socket.room).emit('edited-image-element', element))
}
