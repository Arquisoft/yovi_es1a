import { useState, useEffect, useRef } from 'react';
import { socket } from '../services/socket.service';
import { UserUtils } from '../utils/user.utils';

export const useMultiplayer = () => {
  
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [gameStarted, setGameStarted] = useState(false);
  const [myColor, setMyColor] = useState<'B' | 'R' | null>(null);
  const [opponentName, setOpponentName] = useState<string>('');
  const [lastOpponentMove, setLastOpponentMove] = useState<any>(null);
  const [boardSize, setBoardSize] = useState<number>(5);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);

  const opponentNameRef = useRef(opponentName);
  const roomCodeRef = useRef<string | null>(null);

  useEffect(() => {
    roomCodeRef.current = roomCode;
  }, [roomCode]);

  useEffect(() => {
    opponentNameRef.current = opponentName;
  }, [opponentName]);

  const leaveMatchGracefully = () => {
    socket.emit('leaveMatchGracefully');
    setTimeout(() => {
      setGameStarted(false);
      setRoomCode(null);
    }, 100);
  };

  useEffect(() => {
    socket.connect();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onRoomCreated = (code: string) => { setRoomCode(code); setErrorMsg(''); };
    const onGameStarted = (data: any) => {
      setRoomCode(data.roomCode);
      setMyColor(data.color);
      setOpponentName(data.opponentName);
      setBoardSize(data.tamano);
      setGameStarted(true);
      setErrorMsg('');
    };
    const onRoomError = (msg: string) => setErrorMsg(msg);
    const onMoveReceived = (moveData: any) => {
      if (typeof moveData === 'string' && moveData.includes("|GAMEOVER")) {
        const realLayout = moveData.split("|GAMEOVER")[0];
        setLastOpponentMove(realLayout);
        socket.emit('gameOver', roomCodeRef.current);
      } else {
        setLastOpponentMove(moveData);
      }
    };

    const onOpponentDisconnected = () => {
      setOpponentDisconnected(true);
      setGameStarted(false);
    };

    const onMatchFinishedCleanup = () => {
      setGameStarted(false);
      setRoomCode(null);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('roomCreated', onRoomCreated);
    socket.on('gameStarted', onGameStarted);
    socket.on('roomError', onRoomError);
    socket.on('moveReceived', onMoveReceived);
    socket.on('opponent_disconnected', onOpponentDisconnected);
    socket.on('matchFinishedCleanup', onMatchFinishedCleanup);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('roomCreated', onRoomCreated);
      socket.off('gameStarted', onGameStarted);
      socket.off('roomError', onRoomError);
      socket.off('moveReceived', onMoveReceived);
      socket.off('opponent_disconnected', onOpponentDisconnected);
      socket.off('matchFinishedCleanup', onMatchFinishedCleanup);
    };
  }, []);

  const createRoom = (username: string, tamano: number) => {
    socket.emit('createRoom', { hostUsername: username, tamano, hostId: UserUtils.getUserId() });
  };

  const joinRoom = (code: string, username: string) => {
    socket.emit('joinRoom', { roomCode: code.toUpperCase(), guestUsername: username, guestId: UserUtils.getUserId() });
  };

  const sendMove = (code: string, moveData: any) => {
    socket.emit('makeMove', { roomCode: code, moveData });
  };

  const notifyGameOver = () => {
    const code = roomCodeRef.current;
    if (code) socket.emit('gameOver', code);
  };

  return {
    isConnected, roomCode, errorMsg, gameStarted, myColor,
    opponentName, lastOpponentMove, boardSize, opponentDisconnected,
    createRoom, joinRoom, sendMove, leaveMatchGracefully, notifyGameOver
  };
};
