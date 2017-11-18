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

/**
 * 计算属性长度(消息长度)
 * @param {array} attrs 
 */
function attrsLength(attrs) {
  return attrs.reduce((sum, attr) => { return sum + attr.len + (attr.len % 4); }
    , attrs.length * 4);
}

/**
 * 添加属性到buffer
 * @param {buffer} buf (Buffer.allocUnsafe(headerLength+attrs.sum(length)))
 * @param {array} attrs 属性集合(eg: [{type:MappedAddress,len:2,value:xxx}])
 */
function writeAttrs(buf, attrs) {
  let offset = 20;
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
  buf.writeInt16BE(attr.type, offset);
  buf.writeInt16BE(attr.len, offset + 2);
  return writeAttrValue(buf, offset + 4, attr);
}

function writeAttrValue(buf, offset, attr) {
  switch (attr.type) {
    case MappedAddress:
      break;
    case Username:
      break;
    case MessageIntegrity:
      break;
    case ErrorCode:
      break;
    case UnknownAttributes:
      break;
    case Realm:
      break;
    case Nonce:
      break;
    case XORMappedAddress:
      break;
    case Software:
      break;
    case AlternateServer:
      break;
    case Fingerprint:
      break;
    default:
      //todo 支持参数自定义?
      break;
  }
  return offset + attr.len;
}



module.exports = {
  writeAttrs,
  attrsLength,
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
  Fingerprint
};
