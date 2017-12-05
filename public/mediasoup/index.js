/**
 * mediasoup client v2
 */
const mediasoupClient = require('mediasoup-client');
const { traceNs, getUserMedia, traceStreamTracks, createVideoBox } = require('../util');
const Signaler = require('../signaler');
const trace = traceNs('mediasoup');

//debug
global.mc = mediasoupClient;

/**
 * mediasoup app
 */
class App {
  constructor(conf) {
    this.conf = Object.assign({
      media: {
        video: true,
        audio: true
      },
      iceServers: [{ 'urls': 'stun:stun.l.google.com:19302' }]
    }, conf);
    this.signaler = new Signaler(this.conf.url, this.handleMessage.bind(this));
    //当前用户
    this.user = this.conf.user;
    this.elm = this.conf.elm;
    this.peers = new Map();
    this.videos = new Map();
    this.started = false;
    this.mroom = null;
    this.sendTransport = null;
    this.recvTransport = null;
    this.requestCallbacks = new Map();
  }

  start() {
    if (this.started) {
      return;
    }
    this.mroom = new mediasoupClient.Room();
    this.handleRoom();
    this.signaler.join(this.user);
  }

  connect() {
    this.mroom.join(this.user.id).then((peers) => {
      trace('join room ', peers);
      this.sendTransport = this.mroom.createTransport('send');
      this.recvTransport = this.mroom.createTransport('recv');
      for (const peer of peers) {
        this.handlePeer(peer);
      }
    }).then(() => {
      return getUserMedia(this.conf.media);
    }).then((stream) => {
      const audioTrack = stream.getAudioTracks()[0];
      const videoTrack = stream.getVideoTracks()[0];

      const audioProducer = this.mroom.createProducer(audioTrack);
      const videoProducer = this.mroom.createProducer(videoTrack);

      audioProducer.send(this.sendTransport)
        .then(() => trace('sending our mic'));

      videoProducer.send(this.sendTransport)
        .then(() => trace('sending our webcam'));

      this.setLocalStream(stream);
    });
  }

  handleRoom() {
    this.mroom.on('close', (originator, appData) => {
      trace('close', originator, appData);
    });
    this.mroom.on('request', (request, callback, errback) => {
      trace('request', request);
      const mid = Date.now();
      this.signaler.send({ type: 'mediasoup-request', payload: request, mid });
      this.requestCallbacks.set(mid, { callback, errback });
    });
    this.mroom.on('notify', notification => {
      trace('notify', notification);
      this.signaler.send({ type: 'mediasoup-notification', payload: notification });
    });
    this.mroom.on('newpeer', peer => {
      this.handlePeer(peer);
    });
  }

  handlePeer(peer) {
    for (const consumer of peer.consumers) {
      this.handleConsumer(consumer, peer.name);
    }
    peer.on('close', () => {
      trace('peer closed', peer);
    });
    peer.on('newconsumer', (consumer) => {
      trace('got a new Consumer', consumer);
      this.handleConsumer(consumer, peer.name);
    });
  }

  handleConsumer(consumer, id) {
    consumer.receive(this.recvTransport)
      .then((track) => {
        this.addRemoteTrack(track, id);
      });
    consumer.on('close', () => {
      trace('Consumer closed', consumer);
    });
  }

  handleMessage(message) {
    let cbs = null, div = null;
    switch (message.type) {
      case 'joinok':
        this.connect();
        break;
      case 'mediasoup-notification':
        this.mroom.receiveNotification(message.payload);
        break;
      case 'mediasoup-response':
        cbs = this.requestCallbacks.get(message.mid);
        if (cbs) {
          cbs.callback(message.payload);
          this.requestCallbacks.delete(message.mid);
        }
        break;
      case 'error':
        if (message.mid && this.requestCallbacks.has(message.mid)) {
          this.requestCallbacks.get(message.mid).errback(message.payload);
          this.requestCallbacks.delete(message.mid);
        }
        break;
      case 'leave':
        message.payload.forEach((id) => {
          div = document.querySelector('#' + id);
          if (div) {
            this.elm.peersContainer.removeChild(div);
          }
        });
        break;
    }
  }

  addRemoteTrack(track, id) {
    trace('receiving a new remote MediaStreamTrack', track);
    const stream = new MediaStream();
    if (track.kind == 'video') {
      stream.addTrack(track);
    } else {
      return;
    }
    const { box, video } = createVideoBox();
    box.id = id;
    video.id = stream.id;
    video.srcObject = stream;
    this.elm.peersContainer.appendChild(box);
    video.play();
  }

  setLocalStream(stream) {
    traceStreamTracks(stream);
    this.elm.localVideo.srcObject = stream;
  }
}

module.exports = App;
