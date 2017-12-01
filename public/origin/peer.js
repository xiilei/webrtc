const { traceNs } = require('../util');

class Peer {
  constructor(options) {
    this.id = options.id;
    this.name = options.name;
    this.handlers = options.handlers;
    this.pc = new RTCPeerConnection({
      iceServers: options.iceServers,
      iceTransportPolicy: 'all',
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    });
    this.pc.onnegotiationneeded = this.onnegotiationneeded.bind(this);
    this.pc.onicecandidate = this.onicecandidate.bind(this);
    this.pc.oniceconnectionstatechange = this.oniceconnectionstatechange.bind(this);
    this.pc.onicegatheringstatechange = this.onicegatheringstatechange.bind(this);
    this.pc.onsignalingstatechange = this.onsignalingstatechange.bind(this);
    this.pc.onaddstream = this.onaddstream.bind(this);
    this.pc.onremovestream = this.onremovestream.bind(this);
    this.trace = traceNs('peer.' + this.id);
    this.trace('createed');
  }

  addStream(stream) {
    this.trace('add local stream', stream);
    this.pc.addStream(stream);
  }

  onnegotiationneeded(e) {
    this.trace('negotiationneeded', e);
  }

  onicecandidate(candidate) {
    this.trace('candidate', candidate);
  }

  oniceconnectionstatechange(e) {
    this.trace('iceconnectionstate', e);
  }

  onicegatheringstatechange(e) {
    this.trace('icegatheringstate', e);
  }

  onsignalingstatechange(e) {
    this.trace('signalingstate', e);
  }

  onaddstream(e) {
    this.handlers.handleStream(e.stream, this.id);
    this.trace('add remote stream', e);
  }

  onremovestream(e) {
    this.trace('remove remote stream', e);
  }

  offer(options) {
    return this.pc.createOffer(options).then(desc => {
      this.pc.setLocalDescription(desc);
      return desc;
    }, err => {
      this.trace('offer error', err);
    });
  }

  answer() {
    return this.pc.createAnswer().then(desc => {
      this.pc.setLocalDescription(desc);
      return desc;
    }, err => {
      this.trace('answer error', err);
    });
  }

  handleOffer(desc) {
    return this.pc.setRemoteDescription(desc).then(() => {
      return this.answer();
    });
  }

  handleAnswer(desc) {
    return this.pc.setRemoteDescription(desc);
  }

  close() {
    this.trace('close..');
    this.pc.close();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name
    };
  }
}

module.exports = Peer;