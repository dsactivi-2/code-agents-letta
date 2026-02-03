import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import agentRoutes from './routes/agents.js';
import chatRoutes from './routes/chat.js';
import agentProfilesRoutes from './routes/agentProfiles.js';
import smartChatRoutes from './routes/smartChat.js';
import { initializeWebSocket } from './websocket/index.js';
import { agentLoader } from './services/agentLoader.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const WS_PORT = process.env.WS_PORT || 3002;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    agentProfiles: agentLoader.getAllProfiles().length,
    activeAgents: agentLoader.getAllActiveAgents().length
  });
});

// API Routes
app.use('/api/agents', agentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/agent-profiles', agentProfilesRoutes);
app.use('/api/smart-chat', smartChatRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// HTTP Server
const httpServer = app.listen(PORT, () => {
  console.log(`🚀 Letta Web Platform Backend running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// WebSocket Server
const wsServer = createServer();
const wss = new WebSocketServer({ server: wsServer });

initializeWebSocket(wss);

wsServer.listen(WS_PORT, () => {
  console.log(`🔌 WebSocket server running on ws://localhost:${WS_PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('HTTP server closed');
    wsServer.close(() => {
      console.log('WebSocket server closed');
      process.exit(0);
    });
  });
});
