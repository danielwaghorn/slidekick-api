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

  createRoom (room, users = []) {
    return this.rooms.set(room, {
      users: new Set(users)
    })
  }

  createIfNotExists (room) {
    if (!this.roomExists(room)) {
      this.createRoom(room)
    }

    return this.rooms.get(room)
  }

  addUserToRoom (room, user) {
    return this.createIfNotExists(room).users.add(user)
  }

  usersInRoom (room) {
    return this.rooms.get(room).users
  }
}

module.exports.Rooms = Rooms
