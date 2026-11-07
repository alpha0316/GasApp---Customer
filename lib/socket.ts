import { io, type Socket } from 'socket.io-client';
import { SOCKET_URL } from './config';
import { readTokenSync } from './api/tokenStorage';

let socket: Socket | null = null;

// One socket per signed-in session. The server puts each user in a private room.
export function connectSocket(): Socket {
  if (socket) return socket;
  socket = io(SOCKET_URL, {
    path: '/socket.io',
    // A function, so a reconnect always sends the current token.
    auth: (cb) => cb({ token: readTokenSync() }),
  });
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
