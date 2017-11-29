const trace = require('./util').traceNs('signaler');

class Signaler {
  constructor(url, handle) {
    this.ws = new WebSocket(url);
    this.ws.addEventListener('open', this.onopen.bind(this));
    this.ws.addEventListener('message', this.onmessage.bind(this));
    this.ws.addEventListener('error', this.onerror.bind(this));
    this.ws.addEventListener('close', this.onclose.bind(this));
    this.handle = handle;
    this.peers = new Map();
    this.offlineQueue = [];
  }

  join(user) {
    this.send({ type: 'join', payload: user });
  }

  send(message) {
    trace('send message,', message);
    if (typeof message != 'string') {
      message = JSON.stringify(message);
    }
    if (this.ws.readyState != this.ws.OPEN) {
      this.pushQueue(message);
    } else {
      this.ws.send(message);
    }
  }

  pushQueue(message) {
    trace('push to queue', message);
    if (this.offlineQueue.length > 10) {
      this.offlineQueue.splice(0, 5);
    }
    this.offlineQueue.push(message);
  }

  onopen() {
    trace('open');
    this.offlineQueue.forEach((message) => {
      this.ws.send(message);
    });
  }

  onmessage(e) {
    const message = JSON.parse(e.data);
    trace('recv message:', message);
    this.handle(message);
  }

  onclose(r) {
    //todo reconnect
    trace('close:', r);
  }

  onerror(err) {
    //todo reconnect
    trace('error:', err);
  }
}

module.exports = Signaler;