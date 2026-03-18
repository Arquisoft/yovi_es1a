import Clan, { IClan } from '../models/clan-model'; 
import User from '../models/user-model'; 
import { Types } from 'mongoose';

export class ClanService {

    static async createClan(name: string, memberIds: Types.ObjectId[]): Promise<IClan> {
    // Validar que los usuarios existen
    const users = await User.find({ _id: { $in: memberIds } });//{ _id: { $in: memberIds } } --> busca todos los usuarios cuyo _id esté incluido en el array memberIds
    if (users.length !== memberIds.length) {
      throw new Error('Algunos usuarios no existen');
    }

    const clan = new Clan({
      name,
      members: memberIds,
    });

    return clan.save();
  }

  static async addMemberToClan(clanId: string, userId: Types.ObjectId): Promise<IClan | null> {//async indica q puedes usar awaiy y devolver una promesa
    const clan = await Clan.findById(clanId);
    if (!clan) throw new Error('Clan not found');

    if (!clan.members.includes(userId)) {
      clan.members.push(userId);
      await clan.save();
    }

    return clan;
  }
}