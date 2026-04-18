import { useState, useEffect } from 'react';
import { socket } from '../services/socket.service';
import { UserUtils } from '../utils/user.utils';
import { authFetch } from '../services/auth.service';
export interface ClanMessage {
  username: string;
  text: string;
  timestamp: string | Date;
}

export const useClanChat = (clanId: string | null) => {
  // Usamos la interfaz en lugar de any[]
  const [messages, setMessages] = useState<ClanMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (!clanId) return;

    // A) Traer mensajes antiguos de la Base de Datos
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await authFetch(`/clans/${clanId}/messages`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error("Error al cargar historial del clan", err);
      } finally {
        setLoadingHistory(false);
      }
    };
    
    fetchHistory();

    // B) Unirse a la sala en tiempo real
    socket.emit('joinClanRoom', clanId);

    // C) Escuchar nuevos mensajes en tiempo real
    const handleNewMessage = (msg: ClanMessage) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    };

    socket.on('newClanMessage', handleNewMessage);

    // Limpieza al desmontar el componente (salir de la pestaña del clan)
    return () => {
      socket.emit('leaveClanRoom', clanId);
      socket.off('newClanMessage', handleNewMessage);
    };
  }, [clanId]);

  // Función para enviar un nuevo mensaje
  const sendMessage = (text: string) => {
    if (!clanId || !text.trim()) return;
    
    const userId = UserUtils.getUserId();
    const username = UserUtils.getUsername();
    
    socket.emit('sendClanMessage', { clanId, userId, username, text });
  };

  return { messages, sendMessage, loadingHistory };
};