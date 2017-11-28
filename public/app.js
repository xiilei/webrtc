const Signaler = require('./signaler');
const trace = require('./util').traceNs('app');

class App {
  constructor(options) {
    this.signaler = new Signaler(options.url, this.handleMessage.bind(this));
    this.localStream = null;
    this.signaler.join(options.user);
  }

  handleMessage(message) {
    switch (message.type) {
      case 'joinok':
        break;
      case 'answer':
        break;
      case 'offer':
        break;
    }
  }

  initMedia() {
    navigator.getUserMedia();
  }
}

module.exports = App;