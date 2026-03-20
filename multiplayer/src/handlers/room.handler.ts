import { Server, Socket } from 'socket.io';

const generateRoomCode = () => Math.random().toString(36).substring(2, 7).toUpperCase();

const roomsData = new Map<string, { hostName: string, tamano: number }>(); 

export const registerRoomHandlers = (io: Server, socket: Socket) => {
  
  socket.on('createRoom', ({ hostUsername, tamano }) => {
    const roomCode = generateRoomCode();
    socket.join(roomCode);
    roomsData.set(roomCode, { hostName: hostUsername, tamano });
    socket.emit('roomCreated', roomCode);
    console.log(`🏠 Sala [${roomCode}] creada por ${hostUsername} (Tablero: ${tamano}x${tamano})`);
  });

  socket.on('joinRoom', ({ roomCode, guestUsername }) => {
    const room = io.sockets.adapter.rooms.get(roomCode);
    const numClients = room ? room.size : 0;

    if (numClients === 0) {
      socket.emit('roomError', 'La sala no existe o el código es incorrecto.');
    } else if (numClients === 1) {
      const [hostSocketId] = Array.from(room!); 
      socket.join(roomCode);
      
      const roomInfo = roomsData.get(roomCode) || { hostName: 'Jugador 1', tamano: 5 };
      
      io.to(hostSocketId!).emit('gameStarted', { 
        roomCode, color: 'B', opponentName: guestUsername, tamano: roomInfo.tamano 
      });
      
      socket.emit('gameStarted', { 
        roomCode, color: 'R', opponentName: roomInfo.hostName, tamano: roomInfo.tamano 
      });

      roomsData.delete(roomCode);
      console.log(`🤝 Partida iniciada: ${roomInfo.hostName} vs ${guestUsername} (Tablero: ${roomInfo.tamano})`);
    } else {
      socket.emit('roomError', 'La sala ya está llena.');
    }
  });

  socket.on('makeMove', ({ roomCode, moveData }) => {
    socket.to(roomCode).emit('moveReceived', moveData);
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Usuario desconectado: ${socket.id}`);
  });
};