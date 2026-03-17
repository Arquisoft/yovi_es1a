import { Server, Socket } from 'socket.io';
// Aux func for generate random codes
const generateRoomCode = () => Math.random().toString(36).substring(2, 7).toUpperCase();

export const registerRoomHandlers = (io: Server, socket: Socket) => {
  
  socket.on('createRoom', () => {
    const roomCode = generateRoomCode();
    socket.join(roomCode);
    socket.emit('roomCreated', roomCode);
    console.log(`🏠 Sala [${roomCode}] creada por ${socket.id}`);
  });

  socket.on('joinRoom', (roomCode: string) => {
    const room = io.sockets.adapter.rooms.get(roomCode);
    const numClients = room ? room.size : 0;

    if (numClients === 0) {
      socket.emit('roomError', 'La sala no existe o el código es incorrecto.');
    } else if (numClients === 1) {
      socket.join(roomCode);
      io.to(roomCode).emit('gameStarted', roomCode);
      console.log(`🤝 ${socket.id} se ha unido a la sala [${roomCode}]`);
    } else {
      socket.emit('roomError', 'La sala ya está llena.');
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Usuario desconectado: ${socket.id}`);
  });
};