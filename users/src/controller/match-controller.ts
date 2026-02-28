import express, { Request, Response, Router } from 'express';
import {saveMatch} from '../service/match-service';
import {getMatchHistory} from '../service/match-service';

const router: Router = express.Router();

router.post('/',async (req: Request, res: Response) => 
    {
       try {
        const { user, ...rest } = req.body; 

        if (!user) {
            return res.status(400).json({ error: "No user ID received." });
        }
        const match = await saveMatch({ 
            userId: user, 
            ...rest 
        });

        return res.status(201).json({
            message: 'Match successfully saved',
            matchId: match._id,
            ...match.toJSON()
        });
    }catch(error:any){
            if (
                error.message === 'Invalid input format' || 
                error.message === 'Invalid input format for boardSize' ||
                error.message === 'Invalid match result' || 
                error.message === 'Duration cannot be negative' ||
                error.message.includes('negative')
            ) {
            return res.status(400).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Error saving match' });
        }
    })
router.get('/user/:userId', async (req: Request, res: Response) => {
    try{
        const userId = req.params.userId;
        if (!userId || userId.trim() === '') {
            return res.status(404).json({ error: 'User ID is required' });
        }
        const history = await getMatchHistory(userId);
        return res.status(200).json(history);
    }catch(error:any)
    {
        if (error.message === 'Invalid input format') {
          return res.status(400).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error while fetching history' });
    }});

export default router;