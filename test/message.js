/* global describe,it */
const stun = require('../lib/ice/stun');
const assert = require('power-assert');


describe('#message', function () {
  it('encodeType', function () {
    assert.equal(stun.encodeType(stun.MethodBinding, stun.ClassRequest), 0x0001);
    assert.equal(stun.encodeType(stun.MethodBinding, stun.ClassSuccessResponse), 0x0101);
    assert.equal(stun.encodeType(stun.MethodBinding, stun.ClassErrorResponse), 0x0111);
    assert.equal(stun.encodeType(0xb6d, 0x3), 0x2ddd);
  });

  it('decodeType', function () {
    assert.deepEqual(stun.decodeType(0x0001), { m: stun.MethodBinding, c: stun.ClassRequest });
    assert.deepEqual(stun.decodeType(0x0101), { m: stun.MethodBinding, c: stun.ClassSuccessResponse });
    assert.deepEqual(stun.decodeType(0x0111), { m: stun.MethodBinding, c: stun.ClassErrorResponse });
    assert.deepEqual(stun.decodeType(0x2ddd), { m: 0xb6d, c: 0x3 });
  });

  it('createMessage', function () {
    let sendm = stun.createMessage(stun.MethodBinding, stun.ClassSuccessResponse, {
      attrs: [
        {
          type: stun.MappedAddress,
          value: {
            address: '127.0.0.1',
            port: 12345
          }
        }
      ]
    });
    console.log(stun.createFromBuffer(sendm.toBuffer()));
  });
});

