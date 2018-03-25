class Rooms {
  constructor () {
    this.rooms = new Map()
  }

  numberOfRooms () {
    return this.rooms.size
  }

  roomExists (room) {
    return this.rooms.has(room)
  }

  getRoom (room) {
    return this.roomExists(room) ? this.rooms.get(room) : false
  }

  createRoom (room) {
    return this.rooms.set(room, {
      users: new Map()
    })
  }

  createIfNotExists (room) {
    if (!this.roomExists(room)) {
      this.createRoom(room)
    }

    return this.rooms.get(room)
  }

  addUserToRoom (room, user) {
    const thisRoom = this.createIfNotExists(room)

    if (!thisRoom.users.has(user)) {
      console.log(`${user.forename} joined ${room}`)
      return thisRoom.users.set(user.id, user.forename)
    }
  }

  ejectUserFromRoom (room, user) {
    console.log(`${user.forename} left ${room}`)
    return this.rooms.get(room).users.delete(user.id)
  }

  usersInRoom (room) {
    return Array.from(this.rooms.get(room).users).map(([id, name]) => ({
      id,
      name
    }))
  }
}

module.exports = new Rooms()
