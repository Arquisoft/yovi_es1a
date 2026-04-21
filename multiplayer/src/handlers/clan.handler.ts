import { Server, Socket } from 'socket.io';

export const registerClanHandlers = (io: Server, socket: Socket) => {

  socket.on('joinClanRoom', (clanId: string) => {
    const roomName = `clan_${clanId}`;
    socket.join(roomName);
  });

  socket.on('leaveClanRoom', (clanId: string) => {
    socket.leave(`clan_${clanId}`);
  });

  socket.on('sendClanMessage', async (data: { clanId: string, userId: string, username: string, text: string }) => {
  const roomName = `clan_${data.clanId}`;

  const messageForClient = {
    username: data.username,
    text: data.text,
    timestamp: new Date()
  };
  io.to(roomName).emit('newClanMessage', messageForClient);

  try {
    const response = await fetch(`http://users:3000/clans/${data.clanId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-server-key': 'token_backend' 
      },
      body: JSON.stringify({
        userId: data.userId,
        username: data.username,
        text: data.text
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error de persistencia: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error("Fallo crítico en la comunicación entre microservicios (Multiplayer -> Users):", error);
  }
});
};