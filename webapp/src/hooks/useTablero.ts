import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { gameService } from "../services/game.service";
import { statsService } from "../services/stats.service";
import { stringToYenLayout, coordsToIndex, getInitialLayout } from "../utils/tablero.utils";

type Player = "B" | "R";
const TURN_TIME_LIMIT = 20;

export const useTablero = (props: any) => {
  const { surrenderTrigger, undoTrigger, passTurnTrigger, onUndoStatusChange, isOnline, onlineColor, lastOpponentLayout, onSendMove, opponentName, tamano, onGameOver } = props;
  
  const location = useLocation();
  const { tamanoSeleccionado = 5, botSeleccionado = "random_bot", modoSeleccionado = "bot", colorUsuario = "B" } = location.state || {};

  const size = tamano || tamanoSeleccionado;
  const modoReal = isOnline ? "online" : modoSeleccionado;
  const miColor = isOnline ? (onlineColor as Player) : (colorUsuario as Player);

  const [layout, setLayout] = useState(getInitialLayout(size));
  const [turn, setTurn] = useState<Player>("B");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [startTime] = useState<number>(Date.now());
  const [user, setUser] = useState<{ userId: string; username: string } | null>(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winnerMessage, setWinnerMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(TURN_TIME_LIMIT);

  const isHumanTurn = modoReal === "humano" || modoReal === "online" || turn === miColor;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setLayout(getInitialLayout(size));
    setTurn("B");
    setHistory([]);
    if (storedUser) setUser(JSON.parse(storedUser));
  }, [size]);

  const safeSaveStats = async (result: "win" | "lose", finalBoard: string) => {
    if (!user || !user.userId) return;
    try {
      const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
      const moves = finalBoard.split("").filter(c => c !== ".").length;
      await statsService.saveMatchResult({
        user: user.userId,
        result,
        duration: durationSeconds,
        boardSize: size, 
        opponent: modoReal === "online" ? (opponentName || "Jugador Online") : (modoReal === "humano" ? "Amigo" : botSeleccionado),
        totalMoves: moves,
        gameMode: modoReal === "bot" ? "computer" : "human"
      });
    } catch (error) {
      console.error("Error al guardar en la BD:", error);
    }
  };

  const playOnline = async (updatedLayout: string) => {
  try {
    const yenLayout = stringToYenLayout(updatedLayout, size);
    const data = await gameService.checkWinner(size, yenLayout);
    if (data.status === "win") {
      if (onSendMove) onSendMove(updatedLayout + "|GAMEOVER");
      setGameFinished(true);
          setWinnerMessage(turn === "B" ? "¡GANÓ EL AZUL!" : "¡GANÓ EL ROJO!");
          setShowWinnerModal(true);
          await safeSaveStats("win", updatedLayout); 
      } else {
        setTurn(turn === "B" ? "R" : "B");
      }
      if (onSendMove) onSendMove(updatedLayout);
    } catch (error) {
      console.error("Error verificando victoria:", error);
    }
  };

  const playHumano = async (updatedLayout: string) => {
    try {
      const yenLayout = stringToYenLayout(updatedLayout, size);
      const data = await gameService.checkWinner(size, yenLayout);
      if (data.status === "win") {
        setGameFinished(true);
        setWinnerMessage(turn === "B" ? "¡GANÓ EL AZUL!" : "¡GANÓ EL ROJO!");
        setShowWinnerModal(true);
        await safeSaveStats(turn === miColor ? "win" : "lose", updatedLayout); 
        return;
      }
      setTurn(turn === "B" ? "R" : "B");
    } catch (error) {
      console.error("Error verificando victoria:", error);
    }
  };

  const playBot = async (updatedLayout: string) => {
    const botColor: Player = miColor === "B" ? "R" : "B";
    setTurn(botColor); 
    try {
      const checkHuman = await gameService.checkWinner(size, stringToYenLayout(updatedLayout, size));
      if (checkHuman && checkHuman.status === "win") {
        setGameFinished(true);
        setWinnerMessage("¡HAS GANADO!");
        setShowWinnerModal(true);
        await safeSaveStats("win", updatedLayout);
        return;
      }

      const response = await gameService.askBotMove(botSeleccionado, size, botColor === "B" ? 0 : 1, stringToYenLayout(updatedLayout, size)); 
      const botIndex = coordsToIndex(response.coords.x, response.coords.y, size);
      
      const finalLayoutArray = updatedLayout.split("");
      finalLayoutArray[botIndex] = botColor;
      const finalLayout = finalLayoutArray.join("");
      setLayout(finalLayout);

      const checkBot = await gameService.checkWinner(size, stringToYenLayout(finalLayout, size));
      if (checkBot && checkBot.status === "win") {
        setGameFinished(true);
        setWinnerMessage("HAS PERDIDO.");
        setShowWinnerModal(true);
        await safeSaveStats("lose", finalLayout);
        return;
      }
      setTurn(miColor);
    } catch (error) {
      console.error("Error communicating with the bot:", error);
      setTurn(miColor); 
    }
  };

  const play = async (index: number) => {
    if (gameFinished) return; 
    setHistory(prev => [...prev, layout]);
    const newLayoutArray = layout.split("");
    newLayoutArray[index] = turn;
    const updatedFlatLayout = newLayoutArray.join("");
    setLayout(updatedFlatLayout);

    setLoading(true);
    if (modoReal === "online") await playOnline(updatedFlatLayout);
    else if (modoReal === "humano") await playHumano(updatedFlatLayout);
    else await playBot(updatedFlatLayout);
    setLoading(false);
  };

  const makeRandomMove = () => {
    const emptyIndices: number[] = [];
    for (let i = 0; i < layout.length; i++) {
      if (layout[i] === ".") emptyIndices.push(i);
    }
    if (emptyIndices.length > 0) {
      const randomBuffer = new Uint32Array(1);
      crypto.getRandomValues(randomBuffer);
      play(emptyIndices[randomBuffer[0] % emptyIndices.length]);
    }
  };

  useEffect(() => {
    if (onUndoStatusChange) onUndoStatusChange(history.length > 0 && !loading && !gameFinished);
  }, [history.length, loading, gameFinished, onUndoStatusChange]);

  useEffect(() => { setTimeLeft(TURN_TIME_LIMIT); }, [turn, history.length]);

  useEffect(() => {
    if (gameFinished || loading || !isHumanTurn || modoReal === "online") return;
    
    const timerId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerId); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [turn, loading, gameFinished, isHumanTurn, modoReal]);

  useEffect(() => {
    if (timeLeft === 0 && !gameFinished && !loading && isHumanTurn && modoReal !== "online") makeRandomMove();
  }, [timeLeft, gameFinished, loading, isHumanTurn, modoReal]);

  useEffect(() => {
    if (passTurnTrigger && passTurnTrigger > 0 && isHumanTurn && !loading && !gameFinished && modoReal !== "online") makeRandomMove();
  }, [passTurnTrigger]);

  useEffect(() => {
    if (undoTrigger && undoTrigger > 0 && history.length > 0 && modoReal !== "online") {
      const previousLayout = history[history.length - 1]; 
      setHistory(prev => prev.slice(0, -1)); 
      setLayout(previousLayout); 
      setGameFinished(false); 
      setShowWinnerModal(false);
      setTurn(previousLayout.split("").filter(c => c !== ".").length % 2 === 0 ? "B" : "R");
    }
  }, [undoTrigger]);

  useEffect(() => {
    if (surrenderTrigger && !gameFinished) {
      setGameFinished(true);
      setWinnerMessage("TE HAS RENDIDO. HAS PERDIDO.");
      setShowWinnerModal(true);
      safeSaveStats("lose", layout);
    }
  }, [surrenderTrigger]);

  useEffect(() => {
    const botJuegaPrimero = async () => {
      if (modoReal === "bot" && miColor === "R" && layout === getInitialLayout(size)) {
        setLoading(true);
        try {
          const response = await gameService.askBotMove(botSeleccionado, size, 0, stringToYenLayout(layout, size));
          const botIndex = coordsToIndex(response.coords.x, response.coords.y, size);
          const newLayoutArray = layout.split("");
          newLayoutArray[botIndex] = "B";
          const newLayout = newLayoutArray.join("");
          
          setHistory(prev => [...prev, layout]); 
          setLayout(newLayout);
          
          const checkBot = await gameService.checkWinner(size, stringToYenLayout(newLayout, size));
          if (checkBot.status === "win") {
            setGameFinished(true);
            setWinnerMessage("HAS PERDIDO.");
            setShowWinnerModal(true);
            await safeSaveStats("lose", newLayout);
            return;
          }
          setTurn("R");
        } catch (error) { // <-- AQUÍ ESTÁ LA SOLUCIÓN DEL CRASH MISTERIOSO
          console.error("Error en el primer movimiento del bot:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    botJuegaPrimero();
  }, [modoReal, miColor, size, botSeleccionado]);

  useEffect(() => {
    if (modoReal !== "online" || !lastOpponentLayout || lastOpponentLayout === layout) return;
    if (gameFinished) return;

    const procesarMovimientoRival = async () => {
      setHistory(prev => [...prev, layout]);
      setLayout(lastOpponentLayout);
      const data = await gameService.checkWinner(size, stringToYenLayout(lastOpponentLayout, size));
      
      if (data.status === "win") {
        if (onGameOver) onGameOver();
          setGameFinished(true);
          setWinnerMessage("HAS PERDIDO.");
          setShowWinnerModal(true);
          await safeSaveStats("lose", lastOpponentLayout); 
        } else {
          setTurn(miColor);
          setLoading(false);
        }
    };
    procesarMovimientoRival();
  }, [lastOpponentLayout, modoReal, size, miColor]);

  return {
    layout, turn, loading, gameFinished, showWinnerModal, winnerMessage, timeLeft,
    isHumanTurn, modoReal, miColor, size, play
  };
};