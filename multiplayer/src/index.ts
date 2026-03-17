import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { registerRoomHandlers } from './handlers/room.handler.js';

dotenv.config();

const app = express();
app.use(cors());

//Create HTTP server from Express app
const server = http.createServer(app);
//Initialize Socket.IO with HTTP server
const io=new Server(server, {
    cors: {
        origin: process.env.WEBAPP_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});
const PORT = process.env.PORT || 5000;

//Conexion logic
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    registerRoomHandlers(io, socket);
});

//Start server
server.listen(PORT, () => {
    console.log(`Multiplayer server running on port ${PORT}`);
});
