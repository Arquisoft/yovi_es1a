import { Server, Socket } from 'socket.io';

const generateRoomCode = () => Math.random().toString(36).substring(2, 7).toUpperCase();

const roomCreators = new Map<string, string>(); 

export const registerRoomHandlers = (io: Server, socket: Socket) => {
  
  // 1. Al crear, recibimos el nombre del host y lo guardamos
  socket.on('createRoom', (hostUsername: string) => {
    const roomCode = generateRoomCode();
    socket.join(roomCode);
    roomCreators.set(roomCode, hostUsername); // Guardamos su nombre
    socket.emit('roomCreated', roomCode);
    console.log(`🏠 Sala [${roomCode}] creada por ${hostUsername} (${socket.id})`);
  });

  // 2. Al unirse, el invitado manda su propio nombre
  socket.on('joinRoom', ({ roomCode, guestUsername }) => {
    const room = io.sockets.adapter.rooms.get(roomCode);
    const numClients = room ? room.size : 0;

    if (numClients === 0) {
      socket.emit('roomError', 'La sala no existe o el código es incorrecto.');
    } else if (numClients === 1) {
      socket.join(roomCode);
      
      const [hostSocketId] = Array.from(room!); 
      // Rescatamos el nombre del creador de la sala
      const hostUsername = roomCreators.get(roomCode) || 'Jugador 1';
      

      io.sockets.sockets.get(hostSocketId!)?.emit('gameStarted', { 
        roomCode, color: 'B', opponentName: guestUsername 
      });
      
      // Le decimos al invitado: "Empieza. Eres Rojo. Juegas contra [Creador]"
      socket.emit('gameStarted', { 
        roomCode, color: 'R', opponentName: hostUsername 
      });

      // Limpiamos la memoria
      roomCreators.delete(roomCode);
      console.log(`🤝 ${guestUsername} se unió a la sala de ${hostUsername}`);
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