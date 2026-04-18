import { Server, Socket } from 'socket.io';

export const registerClanHandlers = (io: Server, socket: Socket) => {

  // 1. Un usuario entra a la pantalla de chat de su clan
  socket.on('joinClanRoom', (clanId: string) => {
    const roomName = `clan_${clanId}`;
    socket.join(roomName);
    console.log(`Socket ${socket.id} se ha unido al chat del clan ${clanId}`);
  });

  // 2. Un usuario se sale de la pantalla de chat
  socket.on('leaveClanRoom', (clanId: string) => {
    socket.leave(`clan_${clanId}`);
  });

  // 3. Un usuario envía un mensaje por el chat
  socket.on('sendClanMessage', async (data: { clanId: string, userId: string, username: string, text: string }) => {
  const roomName = `clan_${data.clanId}`;

  // Enviamos el mensaje a todos los conectados al clan ya, sin esperar a la base de datos.
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