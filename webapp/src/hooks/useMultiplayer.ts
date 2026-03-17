import { useEffect, useState } from 'react';
import { socket } from '../services/socket.service';

export const useMultiplayer = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('roomCreated', (code: string) => {
      setRoomCode(code);
      setErrorMsg(null);
    });
    socket.on('roomError', (msg: string) => setErrorMsg(msg));
    socket.on('gameStarted', (code: string) => {
      setRoomCode(code);
      setGameStarted(true);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('roomCreated');
      socket.off('roomError');
      socket.off('gameStarted');
      socket.disconnect();
    };
  }, []);

  const createRoom = () => socket.emit('createRoom');
  
  const joinRoom = (code: string) => {
    if (code.trim() !== '') {
      socket.emit('joinRoom', code.trim().toUpperCase());
    }
  };

  return { isConnected, roomCode, errorMsg, gameStarted, createRoom, joinRoom };
};