import express from 'express';
import { agentLoader } from '../services/agentLoader.js';

const router = express.Router();

// Get all available agent profiles
router.get('/profiles', (req, res, next) => {
  try {
    const profiles = agentLoader.getAllProfiles();
    
    res.json({
      success: true,
      profiles: profiles.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        version: p.version,
        tags: p.tags || [],
        frameworks: p.frameworks || [],
        modelPreferences: p.modelPreferences
      })),
      count: profiles.length
    });
  } catch (error) {
    next(error);
  }
});

// Get specific agent profile details
router.get('/profiles/:profileId', (req, res, next) => {
  try {
    const { profileId } = req.params;
    const profile = agentLoader.getProfile(profileId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Agent profile not found'
      });
    }

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    next(error);
  }
});

// Create agent instance from profile
router.post('/instances/create', async (req, res, next) => {
  try {
    const { profileId } = req.body;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        error: 'profileId is required'
      });
    }

    const agentInstance = await agentLoader.createAgentInstance(profileId);

    res.json({
      success: true,
      agent: {
        agentId: agentInstance.agentId,
        profile: {
          id: agentInstance.profile.id,
          name: agentInstance.profile.name,
          description: agentInstance.profile.description
        },
        createdAt: agentInstance.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all active agent instances
router.get('/instances', (req, res, next) => {
  try {
    const instances = agentLoader.getAllActiveAgents();

    res.json({
      success: true,
      agents: instances.map(a => ({
        agentId: a.agentId,
        profile: {
          id: a.profile.id,
          name: a.profile.name,
          description: a.profile.description
        },
        createdAt: a.createdAt,
        sessionsCount: a.sessions.length
      })),
      count: instances.length
    });
  } catch (error) {
    next(error);
  }
});

// Smart agent selection based on query
router.post('/select', (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'query is required'
      });
    }

    const selection = agentLoader.selectAgentForTask(query);

    res.json({
      success: true,
      selected: {
        agentId: selection.agentId,
        name: selection.profile.name,
        description: selection.profile.description,
        confidence: selection.score
      },
      alternatives: Object.entries(selection.allScores)
        .filter(([id, score]) => id !== selection.agentId && score > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id, score]) => {
          const profile = agentLoader.getProfile(id);
          return {
            agentId: id,
            name: profile.name,
            confidence: score
          };
        })
    });
  } catch (error) {
    next(error);
  }
});

export default router;
