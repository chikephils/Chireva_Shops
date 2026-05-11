import {io} from "socket.io-client"
import { backend_url } from "../server"

export const socket = io(backend_url, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  autoConnect: false, 
});