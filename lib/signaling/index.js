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
const url = require('url');
const { Server } = require('ws');
const debug = require('debug')('webrtc:signaling');
const { Room } = require('./room');

class Signaler {

  constructor() {
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
    return room;
  }

  cleanRoom(rid, uid) {
    if (!this.rooms.has(rid)) {
      return;
    }
    let room = this.rooms.get(rid);
    room.delete(uid);
    if (this.rooms.size == 0) {
      debug('remove room %s', rid);
      this.rooms.delete(rid);
    }
    room = null;
  }

  onconnection(ws, req) {
    const u = url.parse(req.url, true);
    const { rid, uid } = u.query;
    if (!rid || !uid) {
      debug('bad connection', req.url);
      ws.close();
      return;
    }
    const kuid = this.kuid(rid, uid);
    //如果已经存在连接,断开原来的
    if (this.sockets.has(kuid)) {
      debug('connection again %s', kuid);
      this.sockets.get(kuid).close();
    }
    const mfn = this.onmessage.bind(this, rid, uid);
    const me = this;
    debug('connection %s', kuid);
    function cleanup() {
      me.sockets.delete(kuid);
      ws.removeListener('message', mfn);
      ws.removeListener('error', onerror);
      ws.removeListener('close', onclose);
      me.cleanRoom(rid, uid);
    }
    const onerror = (err) => {
      debug('error,%s', kuid, err);
      cleanup();
    };
    const onclose = (r) => {
      debug('close,%s,%s', kuid, r);
      cleanup();
    };
    ws.on('message', mfn);
    ws.once('error', onerror);
    ws.once('close', onclose);
    this.sockets.set(kuid, ws);
  }

  kuid(rid, uid) {
    return `${rid}/${uid}`;
  }

  //房间广播消息
  broadcast(rid, message) {
    const { from } = message;
    const room = this.rooms.get(rid);
    message = JSON.stringify(message);
    room.forEach((user, uid) => {
      if (uid == from) {
        return;
      }
      const kuid = this.kuid(rid, uid);
      this.send(kuid, message);
    });
  }

  //发送一条消息
  send(kuid, message) {
    if (typeof message != 'string') {
      message = JSON.stringify(message);
    }
    const socket = this.sockets.get(kuid);
    if (!socket) {
      debug('send failed %s %s not connected', kuid, message);
      return false;
    }
    socket.send(message);
  }

  //错误消息
  sendError(kuid, info) {
    this.send(kuid, { type: 'error', payload: info });
  }


  onmessage(rid, uid, raw) {
    debug('onmessage %s %s %s', rid, uid, raw);
    const message = JSON.parse(raw);
    let room = null;
    const kuid = this.kuid(rid, uid);
    if (message.type != 'join') {
      room = this.rooms.get(rid);
      if (!room || !room.has(uid)) {
        this.sendError(kuid, 'user not joined');
        return;
      }
    }
    //添加发送方uid
    message.from = uid;
    //todo verify message
    switch (message.type) {
      case 'join'://加入房间
        room = this.createRoom(rid);
        if (!room.add(uid, message.payload)) {
          this.sendError(kuid, 'join failed');
        } else {
          this.send(kuid, { type: 'joinok' });
        }
        break;
      case 'offer'://ice offer
        this.broadcast(rid, message);
        break;
      case 'answer'://ice answer
        this.send(this.kuid(rid, message.to), message);
        break;
      case 'chat'://聊天
        this.broadcast(rid, message);
        break;
      default:
        debug('unknow message type %s', message.type);
        break;
    }
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