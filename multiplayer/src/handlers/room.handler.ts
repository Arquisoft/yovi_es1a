import { Server, Socket } from 'socket.io';

const generateRoomCode = () => Math.random().toString(36).substring(2, 7).toUpperCase();

const roomsData = new Map<string, { hostName: string, tamano: number }>(); 
const mapSocketToUserId = new Map<string, string>();
export const registerRoomHandlers = (io: Server, socket: Socket, mapSocketToRoom: Map<string, string>) => {
  
  socket.on('createRoom', ({ hostUsername, tamano, hostId }) => {
    const roomCode = generateRoomCode();
    socket.join(roomCode);
    mapSocketToRoom.set(socket.id, roomCode);
    
    if (hostId) mapSocketToUserId.set(socket.id, hostId);

    roomsData.set(roomCode, { hostName: hostUsername, tamano });
    socket.emit('roomCreated', roomCode);
    console.log(`🏠 Sala [${roomCode}] creada por ${hostUsername} (Tablero: ${tamano}x${tamano})`);
  });
  
  socket.on('joinRoom', ({ roomCode, guestUsername, guestId }) => {
    const room = io.sockets.adapter.rooms.get(roomCode);
    const numClients = room ? room.size : 0;

    if (numClients === 0) {
      socket.emit('roomError', 'La sala no existe o el código es incorrecto.');
    } else if (numClients === 1) {
      const [hostSocketId] = Array.from(room!); 
      socket.join(roomCode);
      mapSocketToRoom.set(socket.id, roomCode);
      
      // Guardamos la ID del invitado en la lista negra
      if (guestId) mapSocketToUserId.set(socket.id, guestId);

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
    
    const roomCode = mapSocketToRoom.get(socket.id);
    const userId = mapSocketToUserId.get(socket.id); // 👇 Rescatamos la ID del que huyó

    if (roomCode) {
      io.to(roomCode).emit('opponent_disconnected', {
        message: "Tu oponente se ha desconectado de la partida."
      });

      if (userId) {
        console.log(`⚖️ Aplicando derrota por abandono al usuario: ${userId}`);
        
        fetch('http://users:3000/matches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user: userId,
                result: "surrender",
                duration: 0,
                opponent: "Desconexión (Rage Quit)",
                totalMoves: 0,
                gameMode: "online"
            })
        }).catch(err => console.error("Error de red al aplicar castigo:", err));
      }
      mapSocketToRoom.delete(socket.id);
      mapSocketToUserId.delete(socket.id);
      console.log(`🚪 Avisando a la sala [${roomCode}] que el rival huyó.`);
    } else {
      mapSocketToUserId.delete(socket.id);
      console.log(`⚠️ El socket ${socket.id} se fue, pero no estaba en el mapa de salas.`);
    }
  });
};