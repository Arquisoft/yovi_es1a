import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import { clanService } from '../services/clan.service';

const ClanManager: React.FC = () => {
  const [clans, setClans] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [newClanName, setNewClanName] = useState<string>('');
  
  const [user, setUser] = useState<{ userId: string; username: string } | null>(null);

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
    <>
      <NavBar activeTab="clanes" />

      <div className="clanes">
        {error && <div className="error-message-neon">{error}</div>}

        <h2>Clanes existentes</h2>
        {loading ? (
          <p>Cargando clanes...</p>
        ) : (
          <ul>
            {clans.map(clan => (
              <li key={clan.clanId}>
                <strong>{clan.name}</strong> - Miembros: {clan.members.join(', ')}
                <button onClick={() =>handleAddMember(clan.clanId)}>Unirme</button>
              </li>
            ))}
          </ul>
        )}

        <hr />

        <h2>Crear un nuevo clan</h2>
        <input
          type="text"
          placeholder="Nombre del clan"
          value={newClanName}
          onChange={e => setNewClanName(e.target.value)}
        />
        <button onClick={handleCreateClan}>Crear Clan</button>

      </div>
    </>
  );
};

export default ClanManager;