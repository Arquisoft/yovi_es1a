import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { registerRoomHandlers } from './handlers/room.handler.js';
import { RoomService } from './services/room.service.js';

dotenv.config();

const mapSocketToRoom = new Map<string, string>();

const app = express();
app.use(cors());
//["http://localhost:5173", "http://localhost", process.env.WEBAPP_URL || ""]
//Create HTTP server from Express app
const server = http.createServer(app);
//Initialize Socket.IO with HTTP server
const io=new Server(server, {
    cors: {
        origin: "*",
    methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT || 5000;

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    RoomService.handleDisconnect(socket.id); 

    registerRoomHandlers(io, socket);
});

//Start server
server.listen(PORT, () => {
    console.log(`Multiplayer server running on port ${PORT}`);
});
