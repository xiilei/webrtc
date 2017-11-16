const { encodeType, decodeType, MethodBinding,
  ClassRequest, ClassSuccessResponse, ClassErrorResponse } = require('../lib/ice/stun/message');
const assert = require('power-assert');


describe('#message', function () {
  it('encodeType', function () {
    assert.equal(encodeType(MethodBinding, ClassRequest), 0x0001);
    assert.equal(encodeType(MethodBinding, ClassSuccessResponse), 0x0101);
    assert.equal(encodeType(MethodBinding, ClassErrorResponse), 0x0111);
    assert.equal(encodeType(0xb6d, 0x3), 0x2ddd);
  });

  it('decodeType', function () {
    assert.deepEqual(decodeType(0x0001), { m: MethodBinding, c: ClassRequest });
    assert.deepEqual(decodeType(0x0101), { m: MethodBinding, c: ClassSuccessResponse });
    assert.deepEqual(decodeType(0x0111), { m: MethodBinding, c: ClassErrorResponse });
    assert.deepEqual(decodeType(0x2ddd), { m: 0xb6d, c: 0x3 });
  });
});

