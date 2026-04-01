import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../services/socket.service';

export const useMultiplayer = () => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [gameStarted, setGameStarted] = useState(false);
  const [myColor, setMyColor] = useState<'B' | 'R' | null>(null);
  const [opponentName, setOpponentName] = useState<string>('');
  const [lastOpponentMove, setLastOpponentMove] = useState<any>(null);
  const [boardSize, setBoardSize] = useState<number>(5);

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('roomCreated', (code: string) => {
      setRoomCode(code);
      setErrorMsg('');
    });

    socket.on('gameStarted', (data: { roomCode: string, color: 'B' | 'R', opponentName: string, tamano: number }) => {
      setRoomCode(data.roomCode);
      setMyColor(data.color);
      setOpponentName(data.opponentName);
      setBoardSize(data.tamano);
      setGameStarted(true);
      setErrorMsg('');
    });

    socket.on('roomError', (msg: string) => setErrorMsg(msg));
    socket.on('moveReceived', (moveData: any) => setLastOpponentMove(moveData));

    socket.on('opponent_disconnected', async (data: any) => {
      console.log("¡Recibido aviso de desconexión del backend!", data.message);
      alert("¡Victoria por abandono! Tu oponente se ha desconectado.");
      
      setGameStarted(false);
      setRoomCode(null);
      
      const userStr = localStorage.getItem("user");
      const userObj = userStr ? JSON.parse(userStr) : null;
      const userId = userObj?.userId || userObj?._id || userObj?.id;
      if (userId) {
        try {
          console.log("Enviando victoria a BD para el usuario:", userId);
          
          const response = await fetch('/api/matches', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user: userId,
              result: "win",
              duration: 0,
              opponent: opponentName || "Jugador Desconectado",
              totalMoves: 0,
              gameMode: "online"
            })
          });

          if (!response.ok) {
            // Si falla, leemos el error exacto que devuelve tu Node.js
            const errorData = await response.json();
            console.error("❌ El backend rechazó la partida. Status:", response.status, "Motivo:", errorData);
          } else {
            console.log("✅ ¡Victoria guardada con éxito en la Base de Datos!");
          }
        } catch (error) {
          console.error("❌ Error de red al intentar contactar con el backend:", error);
        }
      } else {
        console.error("❌ No hay usuario logueado, no se puede guardar la partida.");
      }

      // Después de intentar guardar (y solo después), navegamos
      navigate('/statistics');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('roomCreated');
      socket.off('gameStarted');
      socket.off('roomError');
      socket.off('moveReceived');
      socket.off('opponent_disconnected');
    };
  }, [navigate, opponentName]);


  const createRoom = (username: string, tamano: number) => {
    const userStr = localStorage.getItem("user");
    const userObj = userStr ? JSON.parse(userStr) : null;
    const userId = userObj?.userId || userObj?._id || userObj?.id;

    socket.emit('createRoom', { hostUsername: username, tamano, hostId: userId });
  };

  const joinRoom = (code: string, username: string) => {
    const userStr = localStorage.getItem("user");
    const userObj = userStr ? JSON.parse(userStr) : null;
    const userId = userObj?.userId || userObj?._id || userObj?.id;

    socket.emit('joinRoom', { roomCode: code.toUpperCase(), guestUsername: username, guestId: userId });
  };

  const sendMove = (code: string, moveData: any) => {
    socket.emit('makeMove', { roomCode: code, moveData });
  };

  return { 
    isConnected, roomCode, errorMsg, gameStarted, myColor, opponentName, lastOpponentMove, boardSize, 
    createRoom, joinRoom, sendMove
  };
};