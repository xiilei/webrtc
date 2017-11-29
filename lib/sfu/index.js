/**
 * WebRTC SFU (Selective Forwarding Unit).
 * webrtc N对N的数据流传输,sfu通过服务转发将其变为1对N
 * sfu需要实现webrtc api 1.0
 *   RTCPeerConnection
 *   RTCRtpReceiver
 *   ...
 * 这里基于mediasoup v2
 */