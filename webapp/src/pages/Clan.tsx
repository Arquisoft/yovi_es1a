import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import { clanService } from '../services/clan.service';
import "../styles/global.css";
import "../styles/Clan.css";
import video from "../assets/videoLinea.mp4";
import { useLanguage } from '../idiomaConf/LanguageContext.tsx';
import { useClanChat } from '../hooks/useClanChat'; 

const ClanManager: React.FC = () => {
  const [clans, setClans] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newClanName, setNewClanName] = useState<string>('');
  const [user, setUser] = useState<{ userId: string; username: string } | null>(null);
  const [selectedClanId, setSelectedClanId] = useState<string | null>(null);
  const [chatText, setChatText] = useState('');

  const { messages, sendMessage, loadingHistory } = useClanChat(selectedClanId);

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
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchClans();
  }, []);

  const { t } = useLanguage();

  const handleCreateClan = async () => {
    setError(null);
    try {
      if (!user) { setError('Debes iniciar sesión para unirte a un clan'); return; }
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
    if (!user) { setError('Debes iniciar sesión para unirte a un clan'); return; }
    setError(null);
    try {
      await clanService.addMemberToClan(clanId, user.userId);
      const allClans = await clanService.getAllClans();
      setClans(allClans);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error agregando miembro');
    }
  };

  const handleSendChatMessage = () => {
    if (!chatText.trim()) return;
    sendMessage(chatText); 
    setChatText('');
  };

  return (
    <div className='clanesView'>
      <NavBar activeTab="clanes" />
      <video autoPlay muted loop className="videoIN">
        <source src={video} type="video/mp4" />
      </video>

      {error && <p style={{ color: '#f87171', textAlign: 'center' }}>{error}</p>}

      <div className="clanes">

        <div className="clanes-lista">
          <h2>{t("clanesExistentes")}</h2>
          {loading ? (
            <p>{t("cargandoClanes")}</p>
          ) : (
            <ul>
              {clans.map(clan => (
                <li key={clan.clanId}>
                  <strong>{clan.name}</strong> {t("miembros")} {clan.members.join(', ')}
                  <button onClick={() => handleAddMember(clan.clanId)}>{t("unirme")}</button>
                  <button onClick={() => setSelectedClanId(clan.clanId)}>
                    {t("chat")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="clanes-derecha">
          <div className="clanes-nuevos">
            <h2>{t("crearClan")}</h2>
            <input
              type="text"
              placeholder="Nombre del clan"
              value={newClanName}
              onChange={e => setNewClanName(e.target.value)}
            />
            <button onClick={handleCreateClan}>{t("crearClanBoton")}</button>
          </div>

          {selectedClanId && (
            <div className='chat-Contorno'>
              <h2>{t("chatClan")}</h2>
              
              <div className="chat" style={{ height: '300px', overflowY: 'auto' }}>
                {loadingHistory ? (
                  <p style={{textAlign: 'center', color: '#aaa'}}>Cargando historial...</p>
                ) : messages.length === 0 ? (
                  <p style={{textAlign: 'center', color: '#aaa'}}>Aún no hay mensajes. ¡Sé el primero!</p>
                ) : (
                  messages.map((m, i) => (
                    <div key={i} style={{ marginBottom: '8px' }}>
                      <strong style={{ color: '#4ade80' }}>{m.username}</strong>: <span style={{color: 'white'}}>{m.text}</span>
                    </div>
                  ))
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <input
                  type="text"
                  value={chatText}
                  onChange={e => setChatText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendChatMessage()}
                  placeholder="Escribe un mensaje"
                  style={{ flex: 1 }}
                />
                <button onClick={handleSendChatMessage}>{t("enviar")}</button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ClanManager;