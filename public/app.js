const Signaler = require('./signaler');
const Peer = require('./peer');
const trace = require('./util').traceNs('app');

function traceStreamTracks(stream) {
  stream.getTracks().forEach(track => {
    trace('track', track);
  });
}

class App {
  constructor(conf) {
    //default config
    this.conf = Object.assign({
      media: {
        video: true,
        audio: true
      },
      offer: {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      },
      iceServers: [{ 'urls': 'stun:stun.l.google.com:19302' }]
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
        return;
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
        handleStream: this.handleReceiveStream.bind(this)
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
    const videoEl = document.createElement('video');
    const div1 = document.createElement('div');
    const div2 = document.createElement('div');
    div1.id = id;
    div1.className = 'col-sm-3';
    div2.className = 'peer';
    videoEl.id = stream.id;
    videoEl.srcObject = stream;
    videoEl.autoplay = true;
    videoEl.muted = true;
    this.videos.set(id, videoEl);
    div2.appendChild(videoEl);
    div1.appendChild(div2);
    this.elm.peersContainer.appendChild(div1);
    videoEl.play();
  }

  setLocalStream(stream) {
    this.localStream = stream;
    traceStreamTracks(stream);
    this.elm.localVideo.srcObject = stream;
  }

  initLocalMedia() {
    return navigator.mediaDevices.getUserMedia(this.conf.media)
      .then(stream => {
        trace('got stream with constraints:', this.conf.media);
        this.setLocalStream(stream);
      }).catch(error => {
        trace('getUserMedia error: ' + error.name, error);
      });
  }
}

module.exports = App;