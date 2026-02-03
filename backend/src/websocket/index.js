import { v4 as uuidv4 } from 'uuid';

// Store active connections
const clients = new Map();

export function initializeWebSocket(wss) {
  wss.on('connection', (ws, req) => {
    const clientId = uuidv4();
    console.log(`🔌 New WebSocket connection: ${clientId}`);

    // Store client
    clients.set(clientId, {
      id: clientId,
      ws,
      subscribedAgents: new Set(),
      connectedAt: new Date()
    });

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      clientId,
      timestamp: new Date().toISOString()
    }));

    // Handle messages from client
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        handleClientMessage(clientId, message);
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          error: 'Invalid message format'
        }));
      }
    });

    // Handle client disconnect
    ws.on('close', () => {
      console.log(`🔌 WebSocket disconnected: ${clientId}`);
      clients.delete(clientId);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error(`WebSocket error for ${clientId}:`, error);
    });
  });
}

function handleClientMessage(clientId, message) {
  const client = clients.get(clientId);
  if (!client) return;

  switch (message.type) {
    case 'subscribe_agent':
      client.subscribedAgents.add(message.agentId);
      client.ws.send(JSON.stringify({
        type: 'subscribed',
        agentId: message.agentId
      }));
      break;

    case 'unsubscribe_agent':
      client.subscribedAgents.delete(message.agentId);
      client.ws.send(JSON.stringify({
        type: 'unsubscribed',
        agentId: message.agentId
      }));
      break;

    case 'ping':
      client.ws.send(JSON.stringify({
        type: 'pong',
        timestamp: new Date().toISOString()
      }));
      break;

    default:
      client.ws.send(JSON.stringify({
        type: 'error',
        error: `Unknown message type: ${message.type}`
      }));
  }
}

// Broadcast message to all clients subscribed to an agent
export function broadcastToAgent(agentId, message) {
  for (const [clientId, client] of clients.entries()) {
    if (client.subscribedAgents.has(agentId)) {
      try {
        client.ws.send(JSON.stringify({
          type: 'agent_update',
          agentId,
          data: message,
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        console.error(`Error broadcasting to client ${clientId}:`, error);
      }
    }
  }
}

// Broadcast to all connected clients
export function broadcastToAll(message) {
  for (const [clientId, client] of clients.entries()) {
    try {
      client.ws.send(JSON.stringify({
        ...message,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error(`Error broadcasting to client ${clientId}:`, error);
    }
  }
}

// Get connection stats
export function getStats() {
  return {
    totalClients: clients.size,
    clients: Array.from(clients.values()).map(c => ({
      id: c.id,
      subscribedAgents: Array.from(c.subscribedAgents),
      connectedAt: c.connectedAt
    }))
  };
}
