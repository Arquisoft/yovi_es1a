import express, { Request, Response, Router } from 'express';
import { ClanService } from '../service/clan-service';
import { Types } from 'mongoose';

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

//Crear un clan
router.post('/createClan', async (req: Request, res: Response) => {
    try {
        const { name, memberIds } = req.body;//Datos de la petición

        if (!name || !memberIds) {
            throw new Error('Clan name is required');
        }

        // Convertir a ObjectId si vienen como strings
        const membersObjectId: Types.ObjectId[] = [];
        for (const id of memberIds) {
            membersObjectId.push(new Types.ObjectId(id));
        }

        // --- 1. Llamada al Servicio ---
        const clan = await ClanService.createClan(name, membersObjectId);

        // --- 2. Respuesta Exitosa ---
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

//Agregar usuario a un clan
router.post('/:clanId/addUser', async (req: Request, res: Response) => {
    try {
        const { clanId } = req.params;//Datos de la petición
        const { userId } = req.body;//Datos enviados por el cliente

        if (!userId) throw new Error('User ID is required');

        // --- 1. Llamada al Servicio ---
        const clan = await ClanService.addMemberToClan(clanId, new Types.ObjectId(userId));

        if (!clan) return res.status(404).json({ error: 'Clan not found' });

        // --- 2. Respuesta Exitosa ---
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

        console.error("Error adding member to clan:", error);
        return res.status(500).json({ error: 'Error adding member to clan' });
    }
});

export default router;