const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const clanService = {
    
    getAllClans: async () => {
        const res = await fetch(`${API_URL}/clans`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error fetching clans');
        return data;
    },
    
    createClan: async (name: string, memberIds: string[]) => {
        const res = await fetch(`${API_URL}/clans/createClan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, memberIds }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error creating clan');
        return data;
    },
    addMemberToClan: async (clanId: string, userId: string) => {
        const res = await fetch(`${API_URL}/clans/${clanId}/addUser`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error adding member to clan');
        return data;
    },

    getClanMessages: async (clanId: string) => {
        const res = await fetch(`${API_URL}/clans/${clanId}/messages`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error cargando mensajes');
        return data; // [{username, text, timestamp}]
    },

    sendMessage: async (clanId: string, userId: string, username: string, text: string) => {
        const res = await fetch(`${API_URL}/clans/${clanId}/message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, username, text })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error enviando mensaje');
        return data;
    }

};