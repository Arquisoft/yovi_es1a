import Clan, { IClan } from '../models/clan-model'; 
import User from '../models/user-model'; 
import { Types } from 'mongoose';

export class ClanService {

    static async createClan(name: string, memberIds: Types.ObjectId[]): Promise<IClan> {
    const users = await User.find({ _id: { $in: memberIds } });
    if (users.length !== memberIds.length) {
      throw new Error('Algunos usuarios no existen');
    }

    const clan = new Clan({
      name,
      members: memberIds,
    });

    return clan.save();
  }

  static async addMemberToClan(clanId: string, userId: Types.ObjectId): Promise<IClan | null> {
    const clan = await Clan.findById(clanId);
    if (!clan) throw new Error('Clan not found');

    if (!clan.members.includes(userId)) {
      clan.members.push(userId);
      await clan.save();
    }

    return clan;
  }

    static async getClanMessages(clanId: string): Promise<{ username: string, text: string, timestamp: Date }[]> {
        const clan = await Clan.findById(clanId).populate('members', 'username');
        if (!clan) throw new Error('Clan no encontrado');

        return clan.messages.map(m => ({
            username: m.username,
            text: m.text,
            timestamp: m.timestamp
        }));
    }

    static async sendMessage(clanId: string, userId: Types.ObjectId, username: string, text: string): Promise<{ username: string, text: string, timestamp: Date }[]> {
        const clan = await Clan.findById(clanId);
        if (!clan) throw new Error('Clan no encontrado');

        clan.messages.push({ userId, username, text, timestamp: new Date() });
        await clan.save();

        return clan.messages.map(m => ({
            username: m.username,
            text: m.text,
            timestamp: m.timestamp
        }));
    }

  
}