import { authFetch } from './api';

/**
 * Estructura de la respuesta devuelta por el motor de Rust al solicitar un movimiento.
 */
export interface BotMoveResponse {
  api_version: string;
  bot_id: string;
  coords: { x: number; y: number; z: number };
  game_status: string;
}

/**
 * Estructura de la respuesta al verificar si hay un ganador en el tablero.
 */
export interface CheckWinnerResponse {
  status: string;
}

export const gameService = {
  /**
   * Solicita al motor de juego (Rust) el siguiente movimiento del bot.
   * 
   * @param botId - Identificador de la estrategia del bot (ej. "random_bot").
   * @param size - Tamaño actual del tablero (ej. 5).
   * @param turn - Índice del turno actual (0 para Azul, 1 para Rojo).
   * @param layout - Representación en texto de las casillas actuales (Notación YEN).
   * @returns Una promesa que resuelve con las coordenadas del movimiento del bot.
   * @throws Lanza un error si la comunicación con la API falla.
   */
  askBotMove: async (botId: string, size: number, turn: number, layout: string): Promise<BotMoveResponse> => {
    try {
      const positionYen = {
        size,
        turn,
        players: ["B", "R"],
        layout,
      };
      
      const response = await authFetch('/api/bot/play', {
        method: "POST",
        body: JSON.stringify({ position: positionYen, strategy: botId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        api_version: "v1",
        bot_id: botId,
        coords: data.coords,
        game_status: data.game_status
      };
    } catch (error) {
      console.error("Error calling Rust API:", error);
      throw error;
    }
  },

  /**
   * Comprueba el estado del tablero para determinar si algún jugador ha ganado.
   * 
   * @param size - Tamaño del tablero.
   * @param layout - Estado actual del tablero (Notación YEN).
   * @returns Una promesa con el estado de victoria ('win' u 'ongoing').
   * @throws Lanza un error si el servidor Node rechaza la validación.
   */
  checkWinner: async (size: number, layout: string): Promise<CheckWinnerResponse> => {
    try {
      const response = await authFetch('/api/bot/check-winner', {
        method: "POST",
        body: JSON.stringify({ size, layout }),
      });

      if (!response.ok) {
        throw new Error(`Error en el servidor de Node: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error al verificar ganador:", error);
      throw error;
    }
  },
};