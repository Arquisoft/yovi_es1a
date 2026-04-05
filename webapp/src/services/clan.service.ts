import { authFetch } from './api';

export const clanService = {

    getAllClans: async () => {
        const res = await authFetch('/clans');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error fetching clans');
        return data;
    },

    createClan: async (name: string, memberIds: string[]) => {
        const res = await authFetch('/clans/createClan', {
            method: 'POST',
            body: JSON.stringify({ name, memberIds }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error creating clan');
        return data;
    },

    addMemberToClan: async (clanId: string, userId: string) => {
        const res = await authFetch(`/clans/${clanId}/addUser`, {
            method: 'POST',
            body: JSON.stringify({ userId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error adding member to clan');
        return data;
    },

    getClanMessages: async (clanId: string) => {
        const res = await authFetch(`/clans/${clanId}/messages`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error cargando mensajes');
        return data;
    },

    sendMessage: async (clanId: string, userId: string, username: string, text: string) => {
        const res = await authFetch(`/clans/${clanId}/message`, {
            method: 'POST',
            body: JSON.stringify({ userId, username, text })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error enviando mensaje');
        return data;
    }
};
