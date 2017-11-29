## [Session Description Protocol](https://en.wikipedia.org/wiki/Session_Description_Protocol) 

[rfc4566](https://tools.ietf.org/html/rfc4566)

## 基本格式
```
<character>=<value>
character: 一个大小写敏感的字母  value: utf - 8字符串 =: 不允许空白字符,=* 标识是可选字段

Session description
 v=  (protocol version number, currently only 0)
 o=  (originator and session identifier : username, id, version number, network address)
 s=  (session name : mandatory with at least one UTF-8-encoded character)
 i=* (session title or short information)
 u=* (URI of description)
 e=* (zero or more email address with optional name of contacts)
 p=* (zero or more phone number with optional name of contacts)
 c=* (connection information—not required if included in all media)
 b=* (zero or more bandwidth information lines)
 One or more Time descriptions ("t=" and "r=" lines; see below)
 z=* (time zone adjustments)
 k=* (encryption key)
 a=* (zero or more session attribute lines)
 Zero or more Media descriptions (each one starting by an "m=" line; see below)
Time description (mandatory)
 t=  (time the session is active)
 r=* (zero or more repeat times)
Media description (if present)
 m=  (media name and transport address)
 i=* (media title or information field)
 c=* (connection information — optional if included at session level)
 b=* (zero or more bandwidth information lines)
 k=* (encryption key)
 a=* (zero or more media attribute lines — overriding the Session attribute lines)

o=<username> <sess-id> <sess-version> <nettype> <addrtype> <unicast-address>
  xiilei 20518 0 IN(目前只有这个) IP4(/IP6) 0.0.0.0
b=<bwtype>:<bandwidth>
  b=AS:500 (限制 500kbps,一个peer)
  b=CT:500 (限制 500kbps,所有peer的总和?)
a=<attribute>:<value> 自定义属性
  a=charset:encoding
  a=sdplang:code
```

### Webrtc Attributes

> [SDP for the WebRTC](https://tools.ietf.org/id/draft-nandakumar-rtcweb-sdp-01.html)
 
- SRTP with DTLS based encryption
- RTP and RTCP Muxing
- RTCP based feedback and reduced size support
- ICE processing for NAT Traversal
- Audio Codec Offered : PCMU, Opus, iLBC
- Audio Codec Answered : Opus
- Video Codecs Offered: H.264, VP8
- Video Codecs Answered: H.264
- Data Channel Support




 