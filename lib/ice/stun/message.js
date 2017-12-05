/**
 * 
 *  STUN Message Header (20 byte)
 *  
 *  0                   1                   2                   3
 *  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 *  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *  |0 0|     STUN Message Type     |         Message Length        |
 *  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *  |                         Magic Cookie                          |
 *  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 *  |                                                               |
 *  |                     Transaction ID (96 bits)                  |
 *  |                                                               |
 *  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+ 
 * 
 */

const ctypto = require('crypto');
const { prepareAttr, attrsLength, writeAttrs } = require('./attributes');

const MagicCookie = 0x2112A442;//固定值(4 byte)

//消息类别
const ClassRequest = 0x00; //0b00
const ClassIndication = 0x01; //0b01
const ClassSuccessResponse = 0x02; //0b10
const ClassErrorResponse = 0x03;//0b11

//消息方法 0x000 - 0x7FF
const MethodBinding = 0x001;


class Message {

  constructor() {
    //类型方法
    this.m = 0x0;
    //类别
    this.c = 0x0;
    //事务id
    this.id = 0x0;
    //长度
    this.length = 0;
    //属性
    this.attrs = [];
  }

  //消息类型
  type() {
    return encodeType(this.m, this.c);
  }

  setType(t) {
    const { m, c } = decodeType(t);
    this.m = m;
    this.c = c;
    return this;
  }

  /**
   * 设置属性
   * @param {string} name 
   * @param {string} value 
   */
  setVal(type, value) {
    let pos = this.attrs.findIndex((attr) => {
      return attr.type == type;
    });
    if (pos === -1) {
      this.attrs.push(prepareAttr({ type, value }));
    } else {
      this.attrs[pos] = prepareAttr({ type, value });
    }
    //重新计算长度
    this.length = attrsLength(this.attrs);
    return this;
  }

  /**
   * 批量添加属性
   */
  setAll(attrs) {
    if (Array.isArray(attrs) && attrs.length) {
      this.attrs = attrs.map(attr => prepareAttr(attr));
      this.length = attrsLength(this.attrs);
    }
    return this;
  }

  toBuffer() {
    return toBuffer(this);
  }

}


function toBuffer(m) {
  const buf = Buffer.allocUnsafe(20 + m.length);
  //header
  buf.writeUInt16BE(m.type(), 0, true);
  buf.writeUInt16BE(m.length, 2, true);
  buf.writeUInt16BE(MagicCookie, 4, true);
  m.id.copy(buf, 8, 20);
  //attributes
  writeAttrs(buf, 20, m.attrs);
  return buf;
}

/**
 * 通过一个完整的数据buffer创建一个Message
 * @param {Buffer} buf 
 * @param {Message} m 
 */
function createFromBuffer(buf, m) {
  if (!m) {
    m = new Message();
  }
  m.setType(buf.readUInt16BE(0));
  m.length = buf.readUInt16BE(2);
  m.id = buf.slice(8, 20);
  return m;
}

/**
 * 创建新的stun消息
 * @param {number} m:消息方法
 * @param {number} c:消息类别
 * @param {*} opts 
 * {
 *  id:事物id,
 *  attrs:[]消息属性
 * }
 */
function createMessage(m, c, opts) {
  const message = new Message;
  message.m = m;
  message.c = c;
  message.id = opts.id || transactionID();
  message.setAll(opts.attrs);
  return message;
}

/**
 * 检查是否是一个合法的stun buffer message
 * @param {Buffer} buf 
 */
function isVaild(buf) {
  return buf.length >= 20 && !(buf[0] & 0xc0) && (buf.readUInt32BE(4) == MagicCookie);
}

/**
 *  消息类型编码 
 *  12个M位代表method,2个C位代表class 
 * 
 *  STUN Message Type (14 bit) 0x000 - 0xFFF
 *  
 *  0                 1
 *  2  3  4 5 6 7 8 9 0 1 2 3 4 5
 * +--+--+-+-+-+-+-+-+-+-+-+-+-+-+
 * |M |M |M|M|M|C|M|M|M|C|M|M|M|M|
 * |11|10|9|8|7|1|6|5|4|0|3|2|1|0|
 * +--+--+-+-+-+-+-+-+-+-+-+-+-+-+
 * 
 * @param {number} m 消息类型method
 * @param {number} c 消息类型class
 */
function encodeType(m, c) {
  const a = m & 0xf; // A = M * 0b0000000000001111 (最后 4 bits)
  const b = m & 0x70; // B = M * 0b0000000001110000 (中间 3 bits)
  const d = m & 0xf80;// D = M * 0b0000111110000000 (前面 5 bits)
  m = a + (b << 1) + (d << 2);
  c = ((c & 0x01) << 4) + ((c & 0x02) << 7);
  return m + c;
}

/**
 * 消息类型解码
 * @param {binary} t 
 * @return {object} {m:method,c:class}
 */
function decodeType(t) {
  const m = ((t & 0x3e00) >> 2) + ((t & 0xe0) >> 1) + (t & 0xf);
  const c = ((t & 0x100) >> 7) + ((t & 0x10) >> 4);
  return { m, c };
}

/**
 * 生成事务id (12 byte)
 */
function transactionID(cb) {
  return ctypto.randomBytes(12, cb);
}

module.exports = {
  Message,
  createFromBuffer,
  createMessage,
  isVaild,
  encodeType,
  decodeType,
  ClassRequest,
  ClassIndication,
  ClassSuccessResponse,
  ClassErrorResponse,
  MethodBinding
};