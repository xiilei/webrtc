# webrtc practices

- [webrtc](https://webrtc.org/)
    - [API](https://w3c.github.io/webrtc-pc/)
        - [getUserMedia](#)
        - [RTCPeerConnection](#)
        - [RTCDataChannel](#)
        - [MediaStream](#)
        - [getStats](#)
    - [ICE](https://en.wikipedia.org/wiki/Interactive_Connectivity_Establishment) [rfc5245](https://tools.ietf.org/html/rfc5245)
        - [STUN](https://en.wikipedia.org/wiki/STUN) [rfc5389](https://tools.ietf.org/html/rfc5389) [rfc7064](https://tools.ietf.org/html/rfc7064)
        - [TURN](https://en.wikipedia.org/wiki/Traversal_Using_Relays_around_NAT) [rfc5766](https://tools.ietf.org/html/rfc5766)
    - [Signaling](#)
    - [MCU](#)
    - [SFU](#)
- [rtp](https://en.wikipedia.org/wiki/Real-time_Transport_Protocol)
- [rtsp](https://en.wikipedia.org/wiki/Real_Time_Streaming_Protocol)
- [rtmp](https://en.wikipedia.org/wiki/Real-Time_Messaging_Protocol)
- [hls](https://developer.apple.com/streaming/)
- [dash](https://en.wikipedia.org/wiki/Dynamic_Adaptive_Streaming_over_HTTP)
- [flv](https://www.adobe.com/devnet/f4v.html)


## ICE 

### [Session Description Protocol](https://en.wikipedia.org/wiki/Session_Description_Protocol)

基本格式
```
<character>=<value>
```
character:一个大小写敏感的字母  value:utf-8字符串  =:不允许空白字符,=*标识是可选字段

```
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
```


