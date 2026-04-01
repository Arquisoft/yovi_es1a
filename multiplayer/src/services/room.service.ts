const generateRoomCode = () => Math.random().toString(36).substring(2, 7).toUpperCase();

const roomsData = new Map<string, { hostName: string, tamano: number }>(); 
const mapSocketToRoom = new Map<string, string>();
const mapSocketToUserId = new Map<string, string>();

export const RoomService = {
  createRoom: (socketId: string, hostUsername: string, tamano: number, hostId?: string) => {
    const roomCode = generateRoomCode();
    mapSocketToRoom.set(socketId, roomCode);
    if (hostId) mapSocketToUserId.set(socketId, hostId);
    roomsData.set(roomCode, { hostName: hostUsername, tamano });
    return roomCode;
  },
  getRoomBySocketId: (socketId: string) => {
    return mapSocketToRoom.get(socketId);
  },
  joinRoom: (socketId: string, roomCode: string, guestId?: string) => {
    const info = roomsData.get(roomCode);
    if (!info) return null;

    mapSocketToRoom.set(socketId, roomCode);
    if (guestId) mapSocketToUserId.set(socketId, guestId);
    
    roomsData.delete(roomCode);
    return info;
  },
  handleDisconnect: (socketId: string) => {
    const roomCode = mapSocketToRoom.get(socketId);
    const userId = mapSocketToUserId.get(socketId);

    return { roomCode, userId };
  },
  deleteSocketData: (socketId: string) => {
    const roomCode = mapSocketToRoom.get(socketId);
    mapSocketToRoom.delete(socketId);
    mapSocketToUserId.delete(socketId);
    if (roomCode) {
        roomsData.delete(roomCode);
    }
  },

  applyPunishment: (userId: string) => {
  fetch('http://users:3000/matches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user: userId,
      result: "surrender",
      duration: 0,
      opponent: "Desconexión",
      gameMode: "online",
      totalMoves: 0
    })
  })
  .then(res => console.log(`Castigo aplicado, status: ${res.status}`))
  .catch(err => console.error("Error aplicando castigo:", err));
},

  cleanExit: (socketId: string) => {
    mapSocketToRoom.delete(socketId);
    mapSocketToUserId.delete(socketId);
  }
};