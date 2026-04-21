import app from './app'; 
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { fileURLToPath } from 'url';

const port: string | number = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
    const swaggerPathIA = path.join(__dirname, '../documentations/documentacion_api.yaml'); 
    const swaggerDocumentIA = YAML.load(swaggerPathIA);

    const swaggerPathApp = path.join(__dirname, '../documentations/openapi.yaml'); 
    const swaggerDocumentApp = YAML.load(swaggerPathApp);

    app.use('/api-docs/ia', swaggerUi.serveFiles(swaggerDocumentIA), swaggerUi.setup(swaggerDocumentIA));
    app.use('/api-docs/app', swaggerUi.serveFiles(swaggerDocumentApp), swaggerUi.setup(swaggerDocumentApp));
} catch (error) {
    console.error("No se pudo cargar la documentación Swagger:", error);
}

app.listen(port, () => {
    console.log(`Users Service listening on port :${port}`);
});