class Participant {
  userId: string;
  rtc: RTCPeerConnection;
  dataChannel: RTCDataChannel | null = null;
  isConnected = true;
  stream?: MediaStream;
  constructor({userId}: {userId: string}) {
    this.userId = userId;
    this.rtc = new RTCPeerConnection({
      iceServers: [
        {urls: "stun:stun.l.google.com:19302"},
        {urls: "stun:freestun.net:3478"},
        {urls: "turn:freestun.net:3478", username: "free", credential: "free"},
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject"
        }
      ]
    });
  }
}
export {Participant};
