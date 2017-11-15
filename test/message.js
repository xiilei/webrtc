const { messageType, MethodBinding,
 ClassRequest, ClassSuccessResponse, ClassErrorResponse } = require('../lib/ice/stun/message');
const assert = require('power-assert');


describe('#message', function () {
 it('messageType', function () {
  assert.equal(messageType(MethodBinding, ClassRequest), 0x0001);
  assert.equal(messageType(MethodBinding, ClassSuccessResponse), 0x0101);
  assert.equal(messageType(MethodBinding, ClassErrorResponse), 0x0111);
  assert.equal(messageType(0xb6d, 0x3), 0x2ddd);
 });
});

