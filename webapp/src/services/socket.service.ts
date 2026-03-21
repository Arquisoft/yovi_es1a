import { io, Socket } from 'socket.io-client';
const SOCKET_URL = import.meta.env.VITE_MULTIPLAYER_URL;;
// An unic instance for all the app
export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false, // Important, we dont want connect the user always, only when 1vs1
});