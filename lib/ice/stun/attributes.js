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


module.exports = {
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
