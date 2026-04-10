import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { registerRoomHandlers } from './handlers/room.handler.js';
import { RoomService } from './services/room.service.js';
import { registerClanHandlers } from './handlers/clan.handler.js';

dotenv.config();

const mapSocketToRoom = new Map<string, string>();
const allowedOrigins = [
  'http://localhost',
  'https://localhost',
  'http://localhost:5173',
   process.env.PRODUCTION_URL,
   process.env.WEBAPP_URL || ''
].filter(Boolean) as string[];
const app = express();
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

const server = http.createServer(app);
//Initialize Socket.IO with HTTP server
const io=new Server(server, {
    cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});
const PORT = process.env.PORT || 5000;

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    RoomService.handleDisconnect(socket.id); 

    registerRoomHandlers(io, socket);
    registerClanHandlers(io, socket);
});

//Start server
server.listen(PORT, () => {
    console.log(`Multiplayer server running on port ${PORT}`);
});
