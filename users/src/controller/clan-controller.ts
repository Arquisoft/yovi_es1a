import express, { Request, Response, Router } from 'express';
import { ClanService } from '../service/clan-service';
import { Types } from 'mongoose';
import Clan from '../models/clan-model';

const router: Router = express.Router();

// ==========================================
// FUNCIONES AUXILIARES DE ERROR
// ==========================================

const isValidationError = (msg: string): boolean => {
    return [
        'Clan name is required',
        'Some users do not exist',
    ].includes(msg);
};

// ==========================================
// RUTAS
// ==========================================

router.get('/ranking/global', async (req: Request, res: Response) => {
    try {
        const ranking = await Clan.aggregate([
            {
                $lookup: {
                    from: "matches", 
                    localField: "members",
                    foreignField: "user",
                    as: "clanMatches"
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    totalMatches: { $size: "$clanMatches" },
                    wins: {
                        $size: {
                            $filter: {
                                input: "$clanMatches",
                                as: "match",
                                cond: { $eq: ["$$match.result", "win"] }
                            }
                        }
                    },
                    losses: {
                        $size: {
                            $filter: {
                                input: "$clanMatches",
                                as: "match",
                                cond: { $in: ["$$match.result", ["lose", "surrender"]] }
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    winRate: {
                        $cond: [
                            { $gt: ["$totalMatches", 0] }, 
                            { $multiply: [{ $divide: ["$wins", "$totalMatches"] }, 100] }, 
                            0 
                        ]
                    }
                }
            }
        ]);

        return res.status(200).json(ranking);

    } catch (error) {
        console.error("Error fetching clan ranking:", error);
        return res.status(500).json({ error: 'Error interno obteniendo el ranking de clanes' });
    }
});

router.post('/createClan', async (req: Request, res: Response) => {
    try {
        const { name, memberIds } = req.body;

        if (!name || !memberIds) {
            throw new Error('Clan name is required');
        }

        const membersObjectId: Types.ObjectId[] = [];
        for (const id of memberIds) {
            membersObjectId.push(new Types.ObjectId(id));
        }

        const clan = await ClanService.createClan(name, membersObjectId);

        return res.status(201).json({
            message: 'Clan successfully created',
            clanId: clan._id,
            name: clan.name,
            members: clan.members
        });

    } catch (error: any) {
        const msg = error?.message;

        if (isValidationError(msg)) {
            return res.status(400).json({ error: msg });
        }

        console.error("Error creating clan:", error);
        return res.status(500).json({ error: 'Error creating clan' });
    }
});

router.post('/:clanId/addUser', async (req: Request, res: Response) => {
    try {
        const { clanId } = req.params;
        const { userId } = req.body;

        if (!userId) throw new Error('User ID is required');

        const clan = await ClanService.addMemberToClan(clanId, new Types.ObjectId(userId));

        if (!clan) return res.status(404).json({ error: 'Clan not found' });

        return res.status(200).json({
            message: 'User added to clan successfully',
            clanId: clan._id,
            name: clan.name,
            members: clan.members
        });

    } catch (error: any) {
        const msg = error?.message;

        if (isValidationError(msg)) {
            return res.status(400).json({ error: msg });
        }

        return res.status(500).json({ error: 'Error adding member to clan' });
    }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const clans = await Clan.find().populate('members', 'username email');
    res.status(200).json(clans.map(c => ({
      clanId: c._id,
      name: c.name,
      members: c.members.map((m: any) => m.username || m)
    })));
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Error cargando clanes' });
  }
});

router.get('/:clanId/messages', async (req: Request, res: Response) => {
    try {
        const { clanId } = req.params;
        const messages = await ClanService.getClanMessages(clanId);
        res.json(messages);
    } catch (err: any) {
        console.error("Error cargando historial de chat:", err);
        res.status(500).json({ error: err.message || 'Error cargando mensajes' });
    }
});

router.post('/:clanId/message', async (req: Request, res: Response) => {
    try {
        const { clanId } = req.params;
        const { userId, username, text } = req.body;
        if (!userId || !username || !text) return res.status(400).json({ error: 'Faltan datos del mensaje' });

        const messages = await ClanService.sendMessage(clanId, new Types.ObjectId(userId), username, text);
        res.json(messages);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message || 'Error enviando mensaje' });
    }
});

export default router;