import express from 'express';
import { agentLoader } from '../services/agentLoader.js';
import { orchestrator } from '../services/orchestrator.js';
import { resumeSession } from '@letta-ai/letta-code-sdk';

const router = express.Router();

// Smart chat endpoint - automatically selects best agent for query
router.post('/smart', async (req, res, next) => {
  try {
    const { message, agentId: userAgentId, conversationId, autoSelect = true } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Auto-select agent or use provided one
    let agentId = userAgentId;
    let selectedAgent;
    let selection;

    if (!agentId && autoSelect) {
      // Use Orchestrator (Wingman LLM-based selection)
      selection = await orchestrator.selectAgent(message);
      agentId = selection.selectedAgent;
      
      // Create agent instance if it doesn't exist
      let agentInstance = agentLoader.getAgentInstance(agentId);
      if (!agentInstance) {
        agentInstance = await agentLoader.createAgentInstance(agentId);
      }
      agentId = agentInstance.agentId;
      
      selectedAgent = {
        agentId: agentInstance.agentId,
        profile: selection.profile,
        confidence: selection.confidence,
        reasoning: selection.reasoning,
        alternatives: selection.alternatives
      };
    }

    if (!agentId) {
      return res.status(400).json({
        success: false,
        error: 'No agent selected and autoSelect is disabled'
      });
    }

    const agentInstance = agentLoader.getAgentInstance(agentId);
    if (!agentInstance) {
      return res.status(404).json({
        success: false,
        error: 'Agent instance not found'
      });
    }

    // Set up SSE for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send agent selection info
    res.write(`data: ${JSON.stringify({
      type: 'agent_selected',
      agent: {
        id: agentInstance.profile.id,
        name: agentInstance.profile.name,
        description: agentInstance.profile.description
      },
      autoSelected: autoSelect && !userAgentId,
      confidence: selection?.confidence,
      reasoning: selection?.reasoning,
      fallback: selection?.fallback
    })}\n\n`);

    let session;
    
    try {
      // Create or resume session
      if (conversationId) {
        session = await resumeSession(conversationId);
      } else {
        session = await agentLoader.createAgentSession(agentId);
      }

      // Send message
      await session.send(message);

      // Stream responses
      for await (const msg of session.stream()) {
        res.write(`data: ${JSON.stringify(msg)}\n\n`);
        
        if (res.flush) res.flush();
      }

      // Send completion event
      res.write(`data: ${JSON.stringify({
        type: 'done',
        sessionId: session.sessionId,
        conversationId: session.conversationId,
        agentId: agentInstance.agentId
      })}\n\n`);
      res.end();

    } finally {
      if (session) {
        await session.close();
      }
    }

  } catch (error) {
    console.error('Smart chat error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
    res.end();
  }
});

// Multi-agent collaboration endpoint
router.post('/collaborate', async (req, res, next) => {
  try {
    const { message, agentIds } = req.body;

    if (!message || !agentIds || !Array.isArray(agentIds)) {
      return res.status(400).json({
        success: false,
        error: 'message and agentIds array are required'
      });
    }

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sessions = [];

    try {
      // Create sessions for each agent
      for (const profileId of agentIds) {
        let agentInstance = Array.from(agentLoader.activeAgents.values())
          .find(a => a.profile.id === profileId);
        
        if (!agentInstance) {
          agentInstance = await agentLoader.createAgentInstance(profileId);
        }

        const session = await agentLoader.createAgentSession(agentInstance.agentId);
        sessions.push({
          session,
          profile: agentInstance.profile
        });
      }

      // Send message to all agents in parallel
      const responses = [];

      for (const { session, profile } of sessions) {
        res.write(`data: ${JSON.stringify({
          type: 'agent_thinking',
          agent: profile.name
        })}\n\n`);

        await session.send(message);

        let agentResponse = '';
        for await (const msg of session.stream()) {
          if (msg.type === 'assistant') {
            agentResponse += msg.content;
          }
        }

        responses.push({
          agent: profile.name,
          agentId: profile.id,
          response: agentResponse
        });

        res.write(`data: ${JSON.stringify({
          type: 'agent_response',
          agent: profile.name,
          response: agentResponse
        })}\n\n`);
      }

      // Send completion
      res.write(`data: ${JSON.stringify({
        type: 'done',
        responses
      })}\n\n`);
      res.end();

    } finally {
      // Close all sessions
      for (const { session } of sessions) {
        await session.close();
      }
    }

  } catch (error) {
    console.error('Collaboration error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
    res.end();
  }
});

export default router;
