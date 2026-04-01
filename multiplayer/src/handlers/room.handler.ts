// handlers/room.handler.ts
import { Server, Socket } from 'socket.io';
import { RoomService } from '../services/room.service.js';

export const registerRoomHandlers = (io: Server, socket: Socket) => {
  socket.on('createRoom', ({ hostUsername, tamano, hostId }) => {
    const roomCode = RoomService.createRoom(socket.id, hostUsername, tamano, hostId);
    socket.join(roomCode);
    socket.emit('roomCreated', roomCode);
  });

  socket.on('joinRoom', ({ roomCode, guestUsername, guestId }) => {
    console.log('joinRoom recibido:', { roomCode, guestUsername, guestId });
    const room = io.sockets.adapter.rooms.get(roomCode);
    if (!room || room.size === 0) return socket.emit('roomError', 'La sala no existe.');
    if (room.size >= 2) return socket.emit('roomError', 'Sala llena.');
    const hostSocketId = Array.from(room)[0];
    if (!hostSocketId) return;
    const roomInfo = RoomService.joinRoom(socket.id, roomCode, guestId);

    if (roomInfo) {
      socket.join(roomCode);
      io.to(hostSocketId).emit('gameStarted', { roomCode, color: 'B', opponentName: guestUsername, tamano: roomInfo.tamano });
      socket.emit('gameStarted', { roomCode, color: 'R', opponentName: roomInfo.hostName, tamano: roomInfo.tamano });
    }
  });

  socket.on('makeMove', ({ roomCode, moveData }) => {
    socket.to(roomCode).emit('moveReceived', moveData);
  });

  socket.on('leaveMatchGracefully', () => {
    const { roomCode } = RoomService.handleDisconnect(socket.id);
    
    if (roomCode) {
        socket.to(roomCode).emit('matchFinishedCleanup');
        console.log(`🧹 Sala ${roomCode} limpiada pacíficamente.`);
    }
    RoomService.cleanExit(socket.id);
  });

  socket.on('disconnect', () => {
    const { roomCode, userId } = RoomService.handleDisconnect(socket.id);

    setTimeout(() => {
        if (roomCode) {
            io.to(roomCode).emit('opponent_disconnected');
            
            if (userId) {
                console.log(`⚖️ Desconexión abrupta. Castigando a ${userId}`);
                RoomService.applyPunishment(userId);
            }
        }
        
        RoomService.deleteSocketData(socket.id);
    }, 500);
});
};