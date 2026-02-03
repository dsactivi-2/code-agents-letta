import express from 'express';
import { createAgent, resumeSession } from '@letta-ai/letta-code-sdk';
import { agentStore } from '../store/agentStore.js';

const router = express.Router();

// Create a new agent
router.post('/create', async (req, res, next) => {
  try {
    const { name, description, systemPrompt, memory, allowedTools } = req.body;

    // Create agent using Letta SDK
    const agentId = await createAgent();

    // Store agent metadata
    const agent = {
      id: agentId,
      name: name || `Agent ${agentId.slice(0, 8)}`,
      description: description || 'A helpful AI assistant',
      systemPrompt: systemPrompt || { type: 'preset', preset: 'letta-claude' },
      memory: memory || [],
      allowedTools: allowedTools || ['Bash', 'Glob', 'Grep', 'Read', 'Write', 'Edit'],
      createdAt: new Date().toISOString(),
      conversations: []
    };

    agentStore.set(agentId, agent);

    res.json({
      success: true,
      agent
    });
  } catch (error) {
    next(error);
  }
});

// List all agents
router.get('/list', async (req, res, next) => {
  try {
    const agents = Array.from(agentStore.values());
    res.json({
      success: true,
      agents,
      count: agents.length
    });
  } catch (error) {
    next(error);
  }
});

// Get agent details
router.get('/:agentId', async (req, res, next) => {
  try {
    const { agentId } = req.params;
    const agent = agentStore.get(agentId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    res.json({
      success: true,
      agent
    });
  } catch (error) {
    next(error);
  }
});

// Update agent configuration
router.patch('/:agentId', async (req, res, next) => {
  try {
    const { agentId } = req.params;
    const updates = req.body;

    const agent = agentStore.get(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    // Update agent metadata
    const updatedAgent = {
      ...agent,
      ...updates,
      id: agentId, // Don't allow ID changes
      updatedAt: new Date().toISOString()
    };

    agentStore.set(agentId, updatedAgent);

    res.json({
      success: true,
      agent: updatedAgent
    });
  } catch (error) {
    next(error);
  }
});

// Delete agent
router.delete('/:agentId', async (req, res, next) => {
  try {
    const { agentId } = req.params;

    if (!agentStore.has(agentId)) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    agentStore.delete(agentId);

    res.json({
      success: true,
      message: 'Agent deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
