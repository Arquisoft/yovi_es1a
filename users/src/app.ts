import dotenv from 'dotenv';
dotenv.config(); 
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import promBundle from 'express-prom-bundle';

import { verifyToken } from './middleware/auth-middleware';
import userRoutes from './controller/user-controller'; 
import matchRoutes from './controller/match-controller';
import botRoutes from './controller/bot-controller';
import clanRoutes from './controller/clan-controller';
import connectBD from './database'; 

const app: Application = express();
app.disable('x-powered-by');

app.use(cors({ //NOSONAR
  origin: "*",
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); 

const metricsMiddleware = promBundle({ 
  includeMethod: true,
  includePath: true,
  promClient: { collectDefaultMetrics: {} }
});
app.use(metricsMiddleware);

connectBD(); 

app.use('/', userRoutes); 
app.use('/matches', verifyToken, matchRoutes);
app.use('/api/bot', botRoutes);
app.use('/clans', verifyToken, clanRoutes);

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', service: 'Users Service' });
});

export default app;