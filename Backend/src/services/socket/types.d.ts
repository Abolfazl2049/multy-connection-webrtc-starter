import {Socket} from "socket.io";

interface MySocket extends Socket {
  data: SocketData;
}
interface SocketData {
  userId?: string;
  status: "searching" | "processing";
  roomId?: string;
}
export {MySocket, SocketData};
