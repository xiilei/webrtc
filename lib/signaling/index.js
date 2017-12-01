/**
 * webrtc signaling server,
 * webrtc并没有定义signaler规范和交互协议,
 * 这里基于websocket实现自定义协议(json)
 * {
 *   type:'join|offer|answer|error',
 *   payload:'',
 *   from:uid,
 *   to:uid
 * }
 */
const EventEmitter = require('events');
const url = require('url');
const { Server } = require('ws');
const debug = require('debug')('webrtc:signaling');
const { Room } = require('./room');

class Signaler extends EventEmitter {

  constructor() {
    super();
    //ws server
    this.wss = null;
    //所有房间
    this.rooms = new Map();
    //所有客户端连接
    this.sockets = new Map();
  }

  start(options) {
    this.wss = new Server(Object.assign({
      clientTracking: false
    }, options));
    this.wss.on('connection', this.onconnection.bind(this));
  }

  createRoom(id) {
    if (this.rooms.has(id)) {
      return this.rooms.get(id);
    }
    const room = new Room(id);
    this.rooms.set(id, room);
    this.emit('newroom', room);
    return room;
  }

  //当用户断线后,清除用户信息
  //当用户所在房间为空时,删除房间
  //@todo 延迟删除,用户闪现
  cleanRoom(rid, id) {
    if (!this.rooms.has(rid)) {
      return;
    }
    let room = this.rooms.get(rid);
    room.delete(id);
    if (room.len() == 0) {
      debug('remove room %s', rid);
      this.rooms.delete(rid);
    }
    this.broadcast(rid, { type: 'leave', payload: [id] });
    room = null;
    this.emit('leave', rid, id);
  }

  getRoom(rid) {
    return this.rooms.get(rid);
  }

  onconnection(ws, req) {
    const u = url.parse(req.url, true);
    const { rid, id } = u.query;
    if (!rid || !id) {
      debug('bad connection', req.url);
      ws.close();
      return;
    }
    //如果已经存在连接,断开原来的
    if (this.sockets.has(id)) {
      debug('connection again %s', id);
      this.sockets.get(id).close();
    }
    const mfn = this.onmessage.bind(this, rid, id);
    const me = this;
    debug('connection %s', id);
    function cleanup() {
      me.sockets.delete(id);
      ws.removeListener('message', mfn);
      ws.removeListener('error', onerror);
      ws.removeListener('close', onclose);
      me.cleanRoom(rid, id);
    }
    const onerror = (err) => {
      debug('error,%s', id, err);
      cleanup();
    };
    const onclose = (r) => {
      debug('close,%s,%s', id, r);
      cleanup();
    };
    ws.on('message', mfn);
    ws.once('error', onerror);
    ws.once('close', onclose);
    this.sockets.set(id, ws);
  }

  //房间广播消息
  broadcast(rid, message) {
    const { from } = message;
    const room = this.rooms.get(rid);
    if (!room) {
      return;
    }
    if (room.len() == 0) {
      return;
    }
    message = JSON.stringify(message);
    room.forEach((user, id) => {
      if (id == from) {
        return;
      }
      this.send(id, message);
    });
  }

  //发送一条消息
  send(id, message) {
    if (typeof message != 'string') {
      message = JSON.stringify(message);
    }
    const socket = this.sockets.get(id);
    if (!socket) {
      debug('send failed %s %s not connected', id, message);
      return false;
    }
    socket.send(message);
  }

  //错误消息
  sendError(id, info, mid) {
    this.send(id, { type: 'error', payload: info, mid });
  }


  onmessage(rid, id, raw) {
    debug('onmessage %s %s %s', rid, id, raw);
    const message = JSON.parse(raw);
    const mid = message.mid;
    let room = null;
    if (message.type != 'join') {
      room = this.rooms.get(rid);
      if (!room || !room.has(id)) {
        this.sendError(id, 'user not joined', mid);
        return;
      }
    }
    //添加发送方uid
    message.from = id;
    //todo verify message
    switch (message.type) {
      case 'join'://加入房间
        room = this.createRoom(rid);
        if (!room.add(id, message.payload)) {
          this.sendError(id, 'join failed', mid);
        } else {
          this.send(id, { type: 'joinok', payload: room.all(), mid });
        }
        break;
      default:
        //@todo 暂时以消息前缀区分,改为订阅?
        if (message.type.indexOf('mediasoup') != 0) {
          if (message.to) {
            this.send(message.to, message);
          } else {
            this.broadcast(rid, message);
          }
        }
        break;
    }
    this.emit('message', message, this.getRoom(rid));
  }

  toJSON() {
    const data = [];
    this.rooms.forEach(room => {
      data.push(room.toJSON());
    });
    return data;
  }
}

module.exports = Signaler;