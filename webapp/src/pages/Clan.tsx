import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import { clanService } from '../services/clan.service';

const ClanManager: React.FC = () => {
  const [clans, setClans] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [newClanName, setNewClanName] = useState<string>('');
  const [newClanMembers, setNewClanMembers] = useState<string>('');

  const [selectedClanId, setSelectedClanId] = useState<string>('');
  const [newMemberId, setNewMemberId] = useState<string>('');

  useEffect(() => {
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
    fetchClans();
  }, []);

  const handleCreateClan = async () => {
    setError(null);
    try {
      const memberIds = newClanMembers.split(',').map(id => id.trim());//Separo por comas y quito espacios
      const clan = await clanService.createClan(newClanName, memberIds);
      setClans(clanes => [...clanes, clan]);//Copia todos los elementos del array anterior.
      setNewClanName('');
      setNewClanMembers('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error creando clan');
    }
  };

  const handleAddMember = async () => {
    setError(null);
    try {
        await clanService.addMemberToClan(selectedClanId, newMemberId);
        const allClans = await clanService.getAllClans();
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

        <h2>Clanes existentes</h2>
        {loading ? (
          <p>Cargando clanes...</p>
        ) : (
          <ul>
            {clans.map(clan => (
              <li key={clan.clanId}>
                <strong>{clan.name}</strong> - Miembros: {clan.members.join(', ')}
              </li>
            ))}
          </ul>
        )}


        <h2>Crear un nuevo clan</h2>
        <input
          type="text"
          placeholder="Nombre del clan"
          value={newClanName}
          onChange={e => setNewClanName(e.target.value)}
        />
        <input
          type="text"
          placeholder="IDs de miembros (separados por comas)"
          value={newClanMembers}
          onChange={e => setNewClanMembers(e.target.value)}
        />
        <button onClick={handleCreateClan}>Crear Clan</button>

        <hr />

        <h2>Agregar usuario a un clan</h2>
        <input
          type="text"
          placeholder="ID del clan"
          value={selectedClanId}
          onChange={e => setSelectedClanId(e.target.value)}
        />
        <input
          type="text"
          placeholder="ID del usuario"
          value={newMemberId}
          onChange={e => setNewMemberId(e.target.value)}
        />
        <button onClick={handleAddMember}>Agregar Usuario</button>
      </div>
    </>
  );
};

export default ClanManager;