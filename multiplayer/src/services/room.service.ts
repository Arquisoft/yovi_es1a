import crypto from 'crypto';

const generateRoomCode = () => {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
};

const roomsData = new Map<string, { hostName: string, tamano: number, hostId?: string | undefined }>();
const mapSocketToRoom = new Map<string, string>();
const mapSocketToUserId = new Map<string, string>();
const mapSocketToUserName = new Map<string, string>();
const activeMatches = new Map<string, { name: string, id: string }>();
const finishedRooms = new Set<string>();

export const RoomService = {
  createRoom: (socketId: string, hostUsername: string, tamano: number, hostId?: string) => {
    const roomCode = generateRoomCode();
    mapSocketToRoom.set(socketId, roomCode);
    mapSocketToUserName.set(socketId, hostUsername);
    if (hostId) mapSocketToUserId.set(socketId, hostId);
    
    roomsData.set(roomCode, { hostName: hostUsername, tamano, hostId });
    return roomCode;
  },
  getRoomBySocketId: (socketId: string) => {
    return mapSocketToRoom.get(socketId);
  },
  joinRoom: (socketId: string, roomCode: string, hostSocketId: string, guestUsername: string, guestId?: string) => {
    const info = roomsData.get(roomCode);
    if (!info) return null;

    mapSocketToRoom.set(socketId, roomCode);
    mapSocketToUserName.set(socketId, guestUsername);
    if (guestId) mapSocketToUserId.set(socketId, guestId);
    
    activeMatches.set(socketId, { name: info.hostName, id: info.hostId || '' });
    activeMatches.set(hostSocketId, { name: guestUsername, id: guestId || '' });

    roomsData.delete(roomCode);
    return info;
  },
  isRoomFinished: (roomCode: string) => {
    return finishedRooms.has(roomCode);
  },  
  handleDisconnect: (socketId: string) => {
    const roomCode = mapSocketToRoom.get(socketId);
    const userId = mapSocketToUserId.get(socketId);
    const userName = mapSocketToUserName.get(socketId) || "Desconocido";
    const opponent = activeMatches.get(socketId) || { name: "Desconexión", id: "" };

    return { 
      roomCode, 
      userId, 
      userName, 
      opponentName: opponent.name, 
      opponentId: opponent.id 
    };
  },
  deleteSocketData: (socketId: string) => {
    const roomCode = mapSocketToRoom.get(socketId);
    mapSocketToRoom.delete(socketId);
    mapSocketToUserId.delete(socketId);
    mapSocketToUserName.delete(socketId);
    activeMatches.delete(socketId);
    if (roomCode) {
        roomsData.delete(roomCode);
        finishedRooms.delete(roomCode);
    }
  },

  recordMatchResult: (userId: string, opponentName: string, result: "win" | "surrender") => {
    fetch('http://users:3000/matches/', { 
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-server-key': 'token_backend'
      },
      body: JSON.stringify({
        user: userId,
        result: result,
        duration: 0,
        opponent: opponentName,
        gameMode: "online",
        totalMoves: 0
      })
    })
    .catch(err => console.error(`Error registrando ${result}:`, err));
  },

  cleanExit: (socketId: string) => {
    mapSocketToRoom.delete(socketId);
    mapSocketToUserId.delete(socketId);
    mapSocketToUserName.delete(socketId);
    activeMatches.delete(socketId);
  },
  endGameByRoom: (roomCode: string) => {
    finishedRooms.add(roomCode);
    roomsData.delete(roomCode);
  }
};