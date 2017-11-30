/**
 * WebRTC SFU (Selective Forwarding Unit).
 * webrtc N对N的数据流传输,sfu通过服务转发将其变为1对N
 * sfu需要实现webrtc api 1.0
 *   RTCPeerConnection
 *   RTCRtpReceiver
 *   ...
 * 这里基于mediasoup v2
 */

const mediasoup = require('mediasoup');
const debug = require('debug')('webrtc:sfu');

const mediaCodecs =
  [
    {
      kind: 'audio',
      name: 'opus',
      clockRate: 48000,
      channels: 2,
      parameters:
        {
          useinbandfec: 1
        }
    },
    {
      kind: 'video',
      name: 'VP8',
      clockRate: 90000
    },
    {
      kind: 'video',
      name: 'H264',
      clockRate: 90000,
      parameters:
        {
          'packetization-mode': 1,
          'profile-level-id': '42e01f',
          'level-asymmetry-allowed': 1
        }
    }
  ];

class Server {
  constructor(conf, signaler) {
    //mediasoup rooms
    this.mrooms = new Map();
    this.mediasoupConf = Object.assign({
      numWorkers: 1,
      logLevel: 'debug',
      rtcIPv4: true,
    }, conf.mediasoup);
    conf.mediasoup = null;
    this.conf = conf;
    this.signaler = signaler;
  }

  start() {
    this.ms = new mediasoup.Server(this.mediasoupConf);
    this.ms.on('newroom', this.traceMediaRoom.bind(this));
    //当signaler创建新的业务房间
    this.signaler.on('newroom', this.handlesroom.bind(this));
    this.signaler.on('message', this.handleMessage.bind(this));
    this.signaler.on('leave', this.handleLeave.bind(this));
  }

  //关联media room
  handlesroom(room) {
    if (this.mrooms.has(room.id)) {
      return;
    }
    //create media room
    const mroom = this.ms.Room(mediaCodecs);
    this.mrooms.set(room.id, mroom);
  }

  //当用户离开
  //删除peer,当房间是空的之后删除room
  handleLeave(rid, id) {
    if (!this.mrooms.has(rid)) {
      return;
    }
    const mroom = this.mrooms.get(rid);
    const peer = mroom.getPeerByName(id);
    if (peer) {
      peer.close();
    }
    if (mroom.peers.length == 0) {
      mroom.close();
    }
    this.mrooms.delete(rid);
  }

  handleMessage(message, room) {
    switch (message.type) {
      case 'mediasoup-request':
        this.handleMediasoupClientRequest(message, room);
        break;
      case 'mediasoup-notification':
        this.handleMediasoupClientNotification(message, room);
        break;
      default:
        break;
    }
  }

  handleMediasoupClientRequest(message, room) {
    const { payload, from, mid } = message;
    let mroom = null, mpeer = null;
    mroom = this.mrooms.get(room.id);
    if (!mroom) {
      this.signaler.sendError(from, 'mroom not init', mid);
      return;
    }
    debug('mediasoup-client request [method:%s, peer:"%s"]', payload.method, from);
    switch (payload.method) {
      case 'join':
        if (payload.peerName != from) {
          this.signaler.sendError(from, 'bad join request');
          break;
        }
        mpeer = mroom.getPeerByName(from);
        if (mpeer) {
          this.handleLeave(room.id, from);
        }
        mroom.receiveRequest(payload).then((response) => {
          this.signaler.send(from, { type: 'mediasoup-response', payload: response, mid });
        });
        break;
      case 'queryRoom':
        mroom.receiveRequest(payload)
          .then((response) => {
            this.signaler.send(from, { type: 'mediasoup-response', payload: response, mid });
          })
          .catch((error) => {
            this.signaler.sendError(from, error.toString(), mid);
          });
        break;
      default:
        mpeer = mroom.getPeerByName(from);
        mpeer.receiveRequest(payload)
          .then((response) => {
            this.signaler.send(from, { type: 'mediasoup-response', payload: response, mid });
          })
          .catch((error) => {
            this.signaler.sendError(from, error.toString(), mid);
          });
        break;
    }
  }

  handleMediasoupClientNotification(message, room) {
    const { payload, from, mid } = message;
    const mroom = this.mrooms.get(room.id);
    if (!mroom) {
      this.signaler.sendError(from, 'mroom not init', mid);
      return;
    }
    const mpeer = mroom.getPeerByName(from);
    mpeer.receiveNotification(payload);
  }

  //trace room
  //todo cleanup
  traceMediaRoom(mroom) {
    debug('create new room %s', mroom.id);
    mroom.on('close', function (e) {
      debug('room.%s close', this.id, e);
    });
    mroom.on('newpeer', (peer) => {
      debug('room.%s add new peer.%s', mroom.id, peer.name);
      this.handleMediaPeer(peer);
    });
    mroom.on('audiolevels', function (audioLevelInfos) {
      // debug('room.%s audolevels', this.id, audioLevelInfos);
    });
  }

  //trace peer
  //todo cleanup
  handleMediaPeer(peer) {
    peer.on('close', function (originator, appData) {
      debug('peer.%s close %s %s', this.name, originator, appData);
    });
    peer.on('notify', (notification) => {
      this.signaler.send(peer.name, { type: 'mediasoup-notification', payload: notification });
      debug('peer.%s notify', this.name, notification);
    });
    peer.on('newtransport', (webrtcTransport) => {
      this.traceMediaTransport(webrtcTransport);
      debug('peer.%s newtransport %s', peer.name, webrtcTransport);
    });
    peer.on('newproducer', (producer) => {
      this.traceMediaProducer(producer);
      debug('peer.%s newproducer %s', peer.name, producer);
    });
    peer.on('newconsumer', (consumer) => {
      this.traceMediaConsumer(consumer);
      debug('peer.%s newconsumer %s', peer.name, consumer);
    });
  }

  traceMediaConsumer(consumer) {
    consumer.on('close', (originator) => {
      debug('Consumer "close" event [originator:%s]', originator);
    });

    consumer.on('pause', (originator) => {
      debug('Consumer "pause" event [originator:%s]', originator);
    });

    consumer.on('resume', (originator) => {
      debug('Consumer "resume" event [originator:%s]', originator);
    });

    consumer.on('effectiveprofilechange', (profile) => {
      debug('Consumer "effectiveprofilechange" event [profile:%s]', profile);
    });
  }

  traceMediaTransport(transport) {
    transport.on('close', (originator) => {
      debug('Transport "close" event [originator:%s]', originator);
    });
  }

  traceMediaProducer(producer) {
    producer.on('close', (originator) => {
      debug('Producer "close" event [originator:%s]', originator);
    });

    producer.on('pause', (originator) => {
      debug('Producer "pause" event [originator:%s]', originator);
    });

    producer.on('resume', (originator) => {
      debug('Producer "resume" event [originator:%s]', originator);
    });
  }

}

function startServer(conf, signaler) {
  const server = new Server(conf, signaler);
  server.start();
  return server;
}

module.exports = {
  startServer,
  Server
};