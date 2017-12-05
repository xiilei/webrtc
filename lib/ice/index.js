const dgram = require('dgram');
const stun = require('./stun');
const debug = require('debug')('webrtc:ice');

const server = dgram.createSocket('udp4');
server.on('error', (err) => {
  debug(`server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  const recvm = stun.createFromBuffer(msg);
  if (recvm.m == stun.MethodBinding && recvm.c == stun.ClassRequest) {
    let sendm = stun.createMessage(recvm.m, stun.ClassSuccessResponse, {
      id: recvm.id,
      attrs: [
        {
          type: stun.MappedAddress,
          value: {
            address: rinfo.address,
            port: rinfo.port
          }
        }
      ]
    });
    const buf = sendm.toBuffer();
    server.send(buf, rinfo.port, rinfo.address, (err) => {
      console.log('send error ', err);
    });
  }
  debug(`recv m:%j valid %s from ${rinfo.address}:${rinfo.port}`, recvm, stun.isVaild(msg));
});

server.on('listening', () => {
  const address = server.address();
  debug(`server listening ${address.address}:${address.port}`);
});

server.bind(3478);
