import {io} from "socket.io-client";
import {Participant} from "./participant.model";
import {API_BASE_URL} from "../constants";
type RtcStatus = "connecting" | "connected" | "disconnected";
class RtcConnectionHandler {
  socket: ReturnType<typeof io>;
  participants: Participant[] = [];
  roomId: string;
  userId: string;
  status: RtcStatus = "connecting";
  localStream: MediaStream;
  onStreamReceive: (stream: MediaStream) => void;

  constructor({
    roomId,
    userId,
    localStream,
    onStreamReceive
  }: {
    roomId: string;
    userId: string;
    localStream: MediaStream;
    onStreamReceive: (stream: MediaStream) => void;
  }) {
    this.roomId = roomId;
    this.userId = userId;
    this.localStream = localStream;
    this.onStreamReceive = onStreamReceive;
    this.socket = io(`${API_BASE_URL}/signaling`, {
      auth: {
        userId,
        roomId
      }
    });

    this.socket.on("connect", () => {
      setTimeout(() => {
        if (this.connectedParticipants.length === this.participants.length) this.setStatus("connected");
      }, 1000);
      this.setStatus("connected");
      // console.log("Socket connected");
    });
    this.socket.on("setup", () => {
      this.socket.emit("join", {});
    });
    this.socket.on("connect_error", err => {
      console.error("Socket connection error:", err);
    });
    this.socket.on("disconnect", () => {
      this.setStatus("disconnected");
      console.log("Socket disconnected");
    });
    this.socket.on("join", data => this.onJoin(data));
    this.socket.on("offer", data => this.onOffer(data));
    this.socket.on("answer", data => this.onAnswer(data));
    this.socket.on("candidate", data => this.onCandidate(data));
    this.socket.on("left", data => this.onLeft(data));
    this.socket.onAny((ev, data) => {
      console.info("received", ev, "data:", data);
    });
    this.socket.onAnyOutgoing((ev, data) => {
      console.info("sending", ev, "data", data);
    });
  }

  initParticipant = ({userId}: {userId: string}) => {
    // initialize peer connection
    this.participants.push(new Participant({userId}));
    const participant = this.participants.at(-1) as Participant;

    participant.rtc.onicecandidate = e => {
      if (e.candidate)
        this.socket?.emit("candidate", {
          candidate: {
            candidate: e.candidate.candidate,
            sdpMid: e.candidate.sdpMid,
            sdpMLineIndex: e.candidate.sdpMLineIndex
          },
          targetUserId: userId
        });
    };

    // Listen for connection state changes
    participant.rtc.oniceconnectionstatechange = ev => {
      if (participant.rtc.iceConnectionState === "connected" || participant.rtc.iceConnectionState === "completed") {
        // Connection established
        participant.isConnected = true;
        if (this.connectedParticipants.length === this.participants.length) this.setStatus("connected");
      } else if (participant.rtc.iceConnectionState === "disconnected" || participant.rtc.iceConnectionState === "failed") {
        this.setDisconnected(ev);
      }
    };
    participant.rtc.onicecandidateerror = ev => {
      // this.setDisconnected(ev);
    };
    participant.rtc.ontrack = e => {
      participant.stream = new MediaStream(e.streams[0]);
      this.onStreamReceive(participant.stream);
    };
    this.localStream.getTracks().forEach(track => participant.rtc?.addTrack(track, this.localStream));
  };

  async onJoin(data: any) {
    if (data.userId === this.userId) {
      console.warn("received self join emit");
      return;
    }

    const duplicateParticipant = this.findParticipantByUserId(data.userId);
    if (duplicateParticipant) {
      console.warn("duplicate participant join received");
      return;
    }
    this.setStatus("connecting");
    // sent an offer to the joined-user
    this.log(`${data.userName} is connecting to room`);

    this.initParticipant({userId: data.userId});
    const participant = this.findParticipantByUserId(data.userId);
    try {
      const offer = await participant?.rtc?.createOffer();
      this.socket?.emit("offer", {sdp: offer?.sdp, targetUserId: data.userId});
      await participant?.rtc?.setLocalDescription(offer);
    } catch (err) {
      this.setDisconnected(err);
    }
  }

  async onOffer(data: any) {
    // initialize a peer connection with the target user that sent offer
    const duplicateParticipant = this.findParticipantByUserId(data.userId);
    if (duplicateParticipant) {
      console.warn("duplicate participant offer received");
      return;
    }

    this.setStatus("connecting");

    this.initParticipant({userId: data.userId});
    const participant = this.findParticipantByUserId(data.userId);
    await participant?.rtc?.setRemoteDescription({type: "offer", sdp: data.sdp});
    try {
      const answer = await participant?.rtc?.createAnswer();
      this.socket?.emit("answer", {sdp: answer?.sdp, targetUserId: data.userId});
      await participant?.rtc?.setLocalDescription(answer);
    } catch (err) {
      this.setDisconnected(err);
    }
  }

  async onAnswer(data: any) {
    // set answer as remote description to the target peerConnection
    const participant = this.findParticipantByUserId(data.userId);
    try {
      await participant?.rtc?.setRemoteDescription({type: "answer", sdp: data.sdp});
    } catch (err) {
      this.setDisconnected(err);
    }
  }

  async onCandidate(data: any) {
    // add candidate to the target peer connection

    const participant = this.findParticipantByUserId(data.userId);
    try {
      await participant?.rtc?.addIceCandidate(data.candidate);
    } catch (err) {
      this.setDisconnected(err);
    }
  }

  onLeft(data: any) {
    // close peer connection with the target-user and remove it from participants
    this.log(`${data.userName} has disconnected from room`);

    const participant = this.findParticipantByUserId(data.userId);
    const participantIndx = this.findParticipantIndxByUserId(data.userId);
    if (participant) {
      participant.rtc?.close();
      participant.dataChannel?.close();
      this.participants.splice(participantIndx, 1);
      if (this.connectedParticipants.length === this.participants.length) this.setStatus("connected");
    }
  }

  findParticipantByUserId(id: Participant["userId"]) {
    return this.participants.find(el => el.userId === id);
  }

  findParticipantIndxByUserId(id: Participant["userId"]) {
    return this.participants.findIndex(el => el.userId === id);
  }

  log(description: string) {
    console.log({description, createdAt: new Date().toISOString()});
  }

  clear() {
    // Close all RTC peer connections
    for (const participant of this.participants) {
      participant.rtc?.close();
      participant.dataChannel?.close();
    }
    // Clear participants array
    this.participants = [];
    // Disconnect socket
    this.socket?.disconnect();
  }

  setDisconnected(err: any) {
    console.error("rtc  disconnected", err);
    this.setStatus("disconnected");
  }

  get connectedParticipants() {
    return this.participants.filter(({isConnected}) => isConnected);
  }

  setStatus(status: RtcStatus) {
    this.status = status;
  }
}
export {RtcConnectionHandler};
export type {RtcStatus};
