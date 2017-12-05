/**
 * 消息属性
 * https://tools.ietf.org/html/rfc5389#section-18.2
 * 
 *   0                   1                   2                   3
 *   0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *  |         Type                  |            Length             |
 *  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *  |                         Value (variable)                ....
 *  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 * 
 */

const ip = require('ip');

//0x0000-0x7FFF,必须处理的属性
const MappedAddress = 0x0001;
const Username = 0x0006;
const MessageIntegrity = 0x0008;
const ErrorCode = 0x0009;
const UnknownAttributes = 0x000A;
const Realm = 0x0014;
const Nonce = 0x0015;
const XORMappedAddress = 0x0020;
//0x8000-0xFFFF;可忽略属性
const Software = 0x8022;
const AlternateServer = 0x8023;
const Fingerprint = 0x8028;

const WriteValueMap = {
  [MappedAddress]: writeMappedAddress
};

/**
 * 预处理属性
 */
function prepareAttr(attr) {
  switch (attr.type) {
    case MappedAddress:
      //简单判断ipv6
      if (attr.value.address.indexOf(':') !== -1) {
        attr.value.family = 0x02;
        attr.len = 4 + 16;
      } else {
        attr.value.family = 0x01;
        attr.len = 4 + 4;
      }
      break;
    default:
      break;
  }
  return attr;
}

/**
 * 计算属性长度(消息长度)
 * @param {array} attrs 
 */
function attrsLength(attrs) {
  return attrs.reduce((sum, attr) => { return sum + attr.len + (attr.len % 4); }
    , attrs.length * 4);
}

/**
 * 
 * @param {Buffer} buf 
 * @param {number} offset 
 */
function parseAttr(buf, offset) {

}


/**
 * 添加属性到buffer
 * @param {buffer} buf (Buffer.allocUnsafe(headerLength+attrs.sum(length)))
 * @param {number} offset 通常来说就是20
 * @param {array} attrs 属性集合(eg: [{type:MappedAddress,len:2,value:xxx}])
 */
function writeAttrs(buf, offset, attrs) {
  attrs.forEach((attr, i) => {
    offset += writeAttr(buf, offset, attr);
    offset += attr.len % 4;//padding,unsafe
  });
  return offset;
}

/**
 * tlv编码写入属性,with a 16-bit type, 16-bit length, and value.
 * @param {buffer} buf 
 * @param {number} type 
 * @param {number} len 
 * @param {*} value 
 */
function writeAttr(buf, offset, attr) {
  buf.writeUInt16BE(attr.type, offset);
  buf.writeUInt16BE(attr.len, offset + 2);
  return writeAttrValue(buf, offset + 4, attr);
}

/**
 * 绑定地址属性
 * @param {buffer} buf 
 * @param {number} offset 
 * @param {object} value 
 */
function writeMappedAddress(buf, offset, value) {
  buf.writeUInt16BE(value.family, offset);
  buf.writeUInt16BE(value.port, offset + 2);
  ip.toBuffer(value.address, buf, offset + 4);
}

/**
 * 写入属性值
 * @param {Buffer} buf 
 * @param {number} offset 
 * @param {object} attr 
 */
function writeAttrValue(buf, offset, attr) {
  if (WriteValueMap[attr.type]) {
    WriteValueMap[attr.type](buf, offset, attr.value);
  }
  return offset + attr.len;
}

module.exports = {
  writeAttrs,
  attrsLength,
  prepareAttr,
  MappedAddress,
  Username,
  MessageIntegrity,
  ErrorCode,
  UnknownAttributes,
  Realm,
  Nonce,
  XORMappedAddress,
  Software,
  AlternateServer,
  Fingerprint,
};
