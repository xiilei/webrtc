const Signaler = require('../signaler');
const { traceNs, createVideoBox, getUserMedia, traceStreamTracks } = require('../util');
const Peer = require('./peer');

const trace = traceNs('origin');

//origin app
class App {
  constructor(conf) {
    //default config
    this.conf = Object.assign({
      media: {
        video: true,
        audio: false
      },
      offer: {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      },
      iceServers: []
    }, conf);
    this.signaler = new Signaler(this.conf.url, this.handleMessage.bind(this));
    this.localStream = null;
    //当前用户
    this.user = this.conf.user;
    this.elm = this.conf.elm;
    this.peers = new Map();
    this.videos = new Map();
    this.started = false;
  }

  start() {
    if (this.started) {
      return;
    }
    this.initLocalMedia().then(() => {
      this.signaler.join(this.user);
    });
    this.started = true;
  }

  handleMessage(message) {
    let peer = null;
    switch (message.type) {
      case 'joinok':
        message.payload.forEach((user) => {
          if (user.id != this.user.id) {
            this.createPeer(user).offer().then(desc => {
              this.signaler.send({ type: 'offer', payload: { desc, user: this.user }, to: user.id });
            });
          }
        });
        break;
      case 'offer':
        this.createPeer(message.payload.user).handleOffer(message.payload.desc)
          .then(desc => {
            this.signaler.send({ type: 'answer', payload: desc, to: message.from });
          });
        break;
      case 'answer':
        peer = this.peers.get(message.from);
        if (!peer) {
          trace('bad answer,peer unknow ', message.from);
          break;
        }
        peer.handleAnswer(message.payload);
        break;
      case 'candidate':
        peer = this.peers.get(message.from);
        if (!peer) {
          trace('bad candidate,peer unknow ', message.from);
          break;
        }
        peer.addCandidate(message.payload);
        break;
      case 'leave':
        message.payload.forEach((id) => {
          let peer = this.peers.get(id);
          if (peer) {
            peer.close();
            this.removeVideo(id);
            this.peers.delete(id);
          }
        });
        break;
    }
  }

  createPeer(user) {
    if (this.peers.has(user.id)) {
      return this.peers.get(user.id);
    }
    const peer = new Peer({
      id: user.id,
      name: user.name,
      iceServers: this.conf.iceServers,
      handlers: {
        handleStream: this.handleReceiveStream.bind(this),
        handleCandidate: this.handleCandidate.bind(this)
      }
    }, this.signaler);

    peer.addStream(this.localStream);

    this.peers.set(peer.id, peer);
    return peer;
  }

  removeVideo(id) {
    const div = document.querySelector('#' + id);
    if (div) {
      this.elm.peersContainer.removeChild(div);
    }
    this.videos.delete(id);
  }

  handleReceiveStream(stream, id) {
    if (this.videos.has(id)) {
      if (stream.id == this.videos.get(id).id) {
        return;
      }
      this.removeVideo(id);
    }
    traceStreamTracks(stream);

    const { box, video } = createVideoBox();
    box.id = id;
    video.id = stream.id;
    video.srcObject = stream;
    this.elm.peersContainer.appendChild(box);
  }

  handleCandidate(e) {
    this.signaler.send({ type: 'candidate', payload: e.candidate });
  }

  setLocalStream(stream) {
    this.localStream = stream;
    traceStreamTracks(stream);
    this.elm.localVideo.srcObject = stream;
  }

  initLocalMedia() {
    return getUserMedia(this.conf.media)
      .then(stream => {
        trace('got stream with constraints:', this.conf.media);
        this.setLocalStream(stream);
      }).catch(error => {
        trace('getUserMedia error: ' + error.name, error);
      });
  }
}

module.exports = App;