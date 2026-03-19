import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import { clanService } from '../services/clan.service';
import "../App.css";
import video from "../assets/videoLinea.mp4";

const ClanManager: React.FC = () => {
  const [clans, setClans] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [newClanName, setNewClanName] = useState<string>('');
  
  const [user, setUser] = useState<{ userId: string; username: string } | null>(null);

  const [selectedClanId, setSelectedClanId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{username: string, text: string}[]>([]);
  const [chatText, setChatText] = useState('');

  const fetchChatMessages = async (clanId: string) => {
        try {
            const msgs = await clanService.getClanMessages(clanId);
            setChatMessages(msgs);
        } catch (err) {
            console.error(err);
        }
    };

    const sendChatMessage = async () => {
        if (!selectedClanId || !user || !chatText) return;

        try {
            const newMessages = await clanService.sendMessage(selectedClanId, user.userId, user.username, chatText);
            setChatMessages(newMessages);
            setChatText('');
        } catch (err) {
            console.error(err);
        }
    };

  const fetchClans = async () => {
      try {
        const data = await clanService.getAllClans();
        setClans(data);
      } catch (err: any) {
        console.error(err);
        setError('Error cargando clanes');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    
    fetchClans();
  }, []);

  const handleCreateClan = async () => {
    setError(null);
    try {
        if (!user) {
            setError('Debes iniciar sesión para unirte a un clan');
            return;
        }
        const memberIds = [user.userId];
        await clanService.createClan(newClanName, memberIds);
        await fetchClans();

        setNewClanName('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error creando clan');
    }
  };

    const handleAddMember = async (clanId: string) => {
    if (!user) {
        setError('Debes iniciar sesión para unirte a un clan');
        return;
    }
    setError(null);
    try {
        await clanService.addMemberToClan(clanId, user.userId);
        const allClans = await clanService.getAllClans();//Actualizo clanes
        setClans(allClans);
    } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error agregando miembro');
    }
    };

  return (
    <div className='clanesView'>
      <NavBar activeTab="clanes" />
      <video autoPlay muted loop className="videoIN">
        <source src={video} type="video/mp4" />
        No se ha podido mostrar el video de fondo
      </video>
      <div className="clanes">
        {error}
        <div className="clanes-lista">

        <h2>Clanes existentes</h2>
        {loading ? (
          <p>Cargando clanes...</p>
        ) : (
          <ul>
            {clans.map(clan => (
              <li key={clan.clanId}>
                <strong>{clan.name}</strong> - Miembros: {clan.members.join(', ')}
                <button onClick={() =>handleAddMember(clan.clanId)}>Unirme</button>
                <button onClick={async () => {
                setSelectedClanId(clan.clanId);      // selecciona el clan
                await fetchChatMessages(clan.clanId); // carga los mensajes
                }}>Chat</button>
              </li>
            ))}
          </ul>
        )}
              </div>

        {selectedClanId && (
        <div className='chat-Contorno'>
            <h2>Chat del clan</h2>
            <div className="chat">
                {chatMessages.map((m, i) => (
                    <div key={i}><strong>{m.username}</strong>: {m.text}</div>
                ))}
            </div>

            <input
                type="text"
                value={chatText}
                onChange={e => setChatText(e.target.value)}
                placeholder="Escribe un mensaje"
            />
            <button onClick={sendChatMessage}>Enviar</button>
        </div>
        )}
      </div>

      <div className="clanes-nuevos">

        <h2>Crear un nuevo clan</h2>
        <input
          type="text"
          placeholder="Nombre del clan"
          value={newClanName}
          onChange={e => setNewClanName(e.target.value)}
        />
        <button onClick={handleCreateClan}>Crear Clan</button>

      </div>
    </div>
  );
};

export default ClanManager;