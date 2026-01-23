import {Server} from "socket.io";
import {MySocket} from "../types.js";

export const registerSignalingNamespace = (io: Server) => {
  const signaling = io.of("/signaling");
  const userSockets = new Map<string, MySocket>();

  signaling.on("connection", async (socket: MySocket) => {
    // events
    // auth
    const userId = socket.handshake.auth.userId;
    const roomId = socket.handshake.auth.roomId;

    // Join
    socket.on("join", data => {
      socket.in(roomId).emit("join", {
        userId: socket.data?.userId,
        roomId: roomId,
        userName: socket.data.userId
      });
    });

    // WebRTC Offer
    socket.on("offer", data => {
      const targetSocket = userSockets.get(data.targetUserId);
      if (targetSocket) {
        targetSocket.emit("offer", {
          from: socket.id,
          userId: socket.data?.userId,
          sdp: data.sdp,
          roomId: roomId,
          userName: socket.data.userId
        });
      }
    });

    // WebRTC Answer
    socket.on("answer", data => {
      const targetSocket = userSockets.get(data.targetUserId);
      if (targetSocket) {
        targetSocket.emit("answer", {
          from: socket.id,
          userId: socket.data?.userId,
          sdp: data.sdp,
          roomId: roomId
        });
      }
    });

    // ICE Candidate
    socket.on("candidate", data => {
      const targetSocket = userSockets.get(data.targetUserId);
      if (targetSocket) {
        targetSocket.emit("candidate", {
          from: socket.id,
          userId: socket.data?.userId,
          candidate: data.candidate,
          roomId: roomId
        });
      }
    });

    socket.on("disconnect", async () => {
      console.log("User disconnected from signaling:", socket.id, "userId:", socket.data?.userId);
      socket.to(roomId).emit("left", {
        userId: socket.data?.userId,
        roomId: roomId
      });
      socket._cleanup();
      socket.disconnect(true);
      socket.leave(roomId);
      userSockets.delete(userId);
      console.log("user socket", userSockets.size, "sockets", (await socket.in(roomId).fetchSockets()).length);
    });

    try {
      if (userId && roomId) {
        socket.data.userId = userId;
        socket.data.roomId = roomId;
        socket.emit("setup");
        socket.join(roomId);
        userSockets.set(userId, socket);
      } else {
        socket.disconnect();
      }
    } catch (error) {
      console.error("Error during signaling connection:", error);
      socket.disconnect();
    }
  });
};
