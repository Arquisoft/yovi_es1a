import { useState, useEffect } from 'react';
import { socket } from '../services/socket.service';

export const useMultiplayer = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [gameStarted, setGameStarted] = useState(false);
  const [myColor, setMyColor] = useState<'B' | 'R' | null>(null);
  const [opponentName, setOpponentName] = useState<string>('');
  const [lastOpponentMove, setLastOpponentMove] = useState<any>(null);
  
  // NUEVO: Estado para guardar el tamaño que dicta el servidor
  const [boardSize, setBoardSize] = useState<number>(5);

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('roomCreated', (code: string) => {
      setRoomCode(code);
      setErrorMsg('');
    });

    // NUEVO: Recibimos también el 'tamano'
    socket.on('gameStarted', (data: { roomCode: string, color: 'B' | 'R', opponentName: string, tamano: number }) => {
      setRoomCode(data.roomCode);
      setMyColor(data.color);
      setOpponentName(data.opponentName);
      setBoardSize(data.tamano); // Guardamos el tamaño oficial
      setGameStarted(true);
      setErrorMsg('');
    });

    socket.on('roomError', (msg: string) => setErrorMsg(msg));
    socket.on('moveReceived', (moveData: any) => setLastOpponentMove(moveData));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('roomCreated');
      socket.off('gameStarted');
      socket.off('roomError');
      socket.off('moveReceived');
    };
  }, []);

  // NUEVO: Le pasamos el 'tamano' al servidor
  const createRoom = (username: string, tamano: number) => {
    socket.emit('createRoom', { hostUsername: username, tamano });
  };

  const joinRoom = (code: string, username: string) => {
    socket.emit('joinRoom', { roomCode: code.toUpperCase(), guestUsername: username });
  };

  const sendMove = (code: string, moveData: any) => {
    socket.emit('makeMove', { roomCode: code, moveData });
  };

  return { 
    isConnected, roomCode, errorMsg, gameStarted, myColor, opponentName, lastOpponentMove, boardSize, 
    createRoom, joinRoom, sendMove 
  };
};