// Simple in-memory store for agent metadata
// In production, replace with a proper database (PostgreSQL, MongoDB, etc.)

export const agentStore = new Map();

// Helper functions for agent store
export const agentStoreHelpers = {
  // Get all agents
  getAllAgents() {
    return Array.from(agentStore.values());
  },

  // Get agent by ID
  getAgent(agentId) {
    return agentStore.get(agentId);
  },

  // Create or update agent
  setAgent(agentId, agent) {
    agentStore.set(agentId, agent);
    return agent;
  },

  // Delete agent
  deleteAgent(agentId) {
    return agentStore.delete(agentId);
  },

  // Search agents by name
  searchAgents(query) {
    const agents = Array.from(agentStore.values());
    return agents.filter(agent => 
      agent.name.toLowerCase().includes(query.toLowerCase()) ||
      agent.description?.toLowerCase().includes(query.toLowerCase())
    );
  },

  // Get agent statistics
  getStats() {
    const agents = Array.from(agentStore.values());
    return {
      total: agents.length,
      totalConversations: agents.reduce((sum, agent) => sum + (agent.conversations?.length || 0), 0)
    };
  }
};
