import dotenv from 'dotenv';
dotenv.config(); 
import { verifyToken } from './middleware/auth-middleware';
import { fileURLToPath } from 'url';

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import promBundle from 'express-prom-bundle';

import userRoutes from './controller/user-controller'; 
import matchRoutes from './controller/match-controller';
import botRoutes from './controller/bot-controller';
import connectBD from './database'; 
import clanRoutes from './controller/clan-controller';

import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';


const app: Application = express();
app.disable('x-powered-by');
const port: string | number = process.env.PORT || 3000;

app.use(cors({ // NOSONAR
  origin: "*",
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json()); 

const metricsMiddleware = promBundle({ 
  includeMethod: true,
  includePath: true,
  promClient: {
    collectDefaultMetrics: {}
  }
});
app.use(metricsMiddleware);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerPathIA = path.join(__dirname, '../documentations/documentacion_api.yaml'); 
const swaggerDocumentIA = YAML.load(swaggerPathIA);

const swaggerPathApp = path.join(__dirname, '../documentations/openapi.yaml'); 
const swaggerDocumentApp = YAML.load(swaggerPathApp);

app.use('/api-docs/ia', swaggerUi.serveFiles(swaggerDocumentIA), swaggerUi.setup(swaggerDocumentIA));

app.use('/api-docs/app', swaggerUi.serveFiles(swaggerDocumentApp), swaggerUi.setup(swaggerDocumentApp));

connectBD(); 

app.use('/', userRoutes); 
app.use('/matches', verifyToken, matchRoutes);
app.use('/api/bot', botRoutes);
app.use('/clans', verifyToken, clanRoutes);

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', service: 'Users Service' });
});

export default app;

if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Users Service listening on port :${port}`);
    });
}