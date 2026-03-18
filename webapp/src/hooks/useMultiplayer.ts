import { useEffect, useState, useCallback } from 'react';
import { socket } from '../services/socket.service';

export const useMultiplayer = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [lastOpponentMove, setLastOpponentMove] = useState<any>(null);
  const [myColor, setMyColor] = useState<"B" | "R" | null>(null); 
  const [opponentName, setOpponentName] = useState<string>("Jugador Online"); 

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('roomCreated', (code: string) => {
      setRoomCode(code);
      setErrorMsg(null);
    });
    socket.on('roomError', (msg: string) => setErrorMsg(msg));
  
    socket.on('gameStarted', (data: { roomCode: string, color: "B" | "R", opponentName: string }) => {
      setRoomCode(data.roomCode);
      setMyColor(data.color);
      setOpponentName(data.opponentName); 
      setGameStarted(true);
    });

    socket.on('moveReceived', (moveData: any) => {
      setLastOpponentMove(moveData);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('roomCreated');
      socket.off('roomError');
      socket.off('gameStarted');
      socket.off('moveReceived');
      socket.disconnect();
    };
  }, []); 
  
  const createRoom = (username: string) => {
    socket.emit('createRoom', username);
  };
  
  const joinRoom = (code: string, username: string) => {
    if (code.trim() !== '') {
      socket.emit('joinRoom', { roomCode: code.trim().toUpperCase(), guestUsername: username });
    }
  };

  const sendMove = useCallback((code: string, moveData: any) => {
    socket.emit('makeMove', { roomCode: code, moveData });
  }, []);

  return { 
    isConnected, 
    roomCode, 
    errorMsg, 
    gameStarted, 
    lastOpponentMove, 
    myColor, 
    opponentName,
    createRoom, 
    joinRoom, 
    sendMove 
  };
};