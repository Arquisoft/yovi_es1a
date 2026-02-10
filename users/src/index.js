const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const promBundle = require('express-prom-bundle');

const userRoutes = require('./routes/user-routes'); 

const app = express();
const port = 3000;

// --- Middlewares ---
// ⚠️ CORS debe ir ANTES de las otras configuraciones
app.use(cors({
  origin: '*',  // Permite todas las origenes (para desarrollo)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const metricsMiddleware = promBundle({ includeMethod: true });
app.use(metricsMiddleware);

// --- Conexión a MongoDB ---
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb';

mongoose.connect(mongoUri)
  .then(() => console.log('✅ MongoDB connected successfully to:', mongoUri))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// --- Rutas ---
app.use('/', userRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'Users Service' });
});

// --- Arranque ---
app.listen(port, () => {
  console.log(`🚀 Users Service running on http://localhost:${port}`);
});