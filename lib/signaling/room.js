const EventEmitter = require('events');
const debugNs = require('debug');
/**
 * 房间用户
 */
class Room extends EventEmitter {
  constructor(id) {
    super();
    this.debug = debugNs(`room#${id}`);
    this.id = id;
    this.maximum = 5;
    this.users = new Map();
    this.forEach = this.users.forEach.bind(this.users);
  }

  len() {
    return this.users.size;
  }

  add(id, payload) {
    if (this.users.size >= 5 && !this.users.has(id)) {
      this.debug('add user failed:overflow %s', id);
      return false;
    }
    this.debug('add user %s %j', id, payload);
    return this.users.set(id, payload);
  }

  all() {
    const users = [];
    this.forEach((user) => {
      users.push(user);
    });
    return users;
  }

  delete(id) {
    this.debug('delete user %s', id);
    this.users.delete(id);
  }

  has(id) {
    return this.users.has(id);
  }

  toJSON() {
    const users = {};
    this.users.forEach((user, id) => {
      users[id] = user;
    });
    return {
      id: this.id,
      maximum: this.maximum,
      users: users
    };
  }
}

module.exports = {
  Room
};