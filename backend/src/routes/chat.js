import express from 'express';
import { resumeSession, createSession } from '@letta-ai/letta-code-sdk';
import { agentStore } from '../store/agentStore.js';

const router = express.Router();

// Send a message to an agent (streaming)
router.post('/message', async (req, res, next) => {
  try {
    const { agentId, conversationId, message, model, options } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    const agent = agentStore.get(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    // Set up SSE for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let session;
    
    try {
      // Resume or create session
      if (conversationId) {
        session = await resumeSession(conversationId);
      } else {
        session = await createSession(agentId, {
          systemPrompt: agent.systemPrompt,
          memory: agent.memory,
          allowedTools: agent.allowedTools,
          model: model || 'claude-sonnet-4',
          ...options
        });
      }

      // Send message
      await session.send(message);

      // Stream responses
      for await (const msg of session.stream()) {
        res.write(`data: ${JSON.stringify(msg)}\n\n`);
        
        // Flush to ensure immediate delivery
        if (res.flush) res.flush();
      }

      // Send completion event
      res.write(`data: ${JSON.stringify({ type: 'done', sessionId: session.sessionId, conversationId: session.conversationId })}\n\n`);
      res.end();

      // Update agent's conversation list
      if (!agent.conversations.includes(session.conversationId)) {
        agent.conversations.push(session.conversationId);
        agentStore.set(agentId, agent);
      }

    } finally {
      if (session) {
        await session.close();
      }
    }

  } catch (error) {
    console.error('Chat error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
    res.end();
  }
});

// Get conversation history
router.get('/conversations/:conversationId', async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    // TODO: Implement conversation history retrieval
    // For now, return placeholder
    res.json({
      success: true,
      conversationId,
      messages: []
    });
  } catch (error) {
    next(error);
  }
});

export default router;
