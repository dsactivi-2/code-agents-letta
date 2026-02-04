import { createAgent, sendMessage } from '@letta-ai/letta-code-sdk';
import { agentLoader } from './agentLoader.js';

/**
 * Orchestrator Service
 * Uses Wingman (LLM-based) to intelligently select the best agent for user queries
 */
class Orchestrator {
  constructor() {
    this.wingmanAgentId = null;
    this.wingmanSessionId = null;
    this.selectionCache = new Map(); // Cache recent selections
  }

  /**
   * Initialize Wingman agent
   */
  async initialize() {
    try {
      console.log('🎯 Initializing Orchestrator with Wingman...');
      
      const wingmanProfile = agentLoader.getProfile('meta-wingman');
      if (!wingmanProfile) {
        throw new Error('Wingman profile not found');
      }

      // Create Wingman agent instance
      const wingmanInstance = await agentLoader.createAgentInstance('meta-wingman');
      this.wingmanAgentId = wingmanInstance.agentId;

      // Create persistent session for Wingman
      const session = await agentLoader.createAgentSession(this.wingmanAgentId);
      this.wingmanSessionId = session.sessionId;

      console.log('✅ Orchestrator initialized with Wingman');
    } catch (error) {
      console.error('❌ Error initializing Orchestrator:', error);
      throw error;
    }
  }

  /**
   * Select best agent for user query using Wingman (LLM-based)
   * 
   * @param {string} userQuery - The user's question/request
   * @returns {Promise<Object>} Selection result with agent, confidence, reasoning
   */
  async selectAgent(userQuery) {
    try {
      // Check cache first (for identical queries)
      const cached = this.selectionCache.get(userQuery);
      if (cached && Date.now() - cached.timestamp < 60000) { // 1 min cache
        console.log('📦 Using cached agent selection');
        return cached.selection;
      }

      console.log(`🤔 Wingman analyzing: "${userQuery.substring(0, 50)}..."`);

      // Build prompt for Wingman
      const wingmanPrompt = `Analyze this user request and select the best agent from our 25 available agents.

User Request: "${userQuery}"

Your task:
1. Analyze the request (domain, action, complexity, tools needed)
2. Score all relevant agents (0-100)
3. Select the best agent
4. Return ONLY valid JSON (no markdown, no explanation outside JSON)

Required JSON format:
{
  "selectedAgent": "agent-id",
  "confidence": 95,
  "reasoning": "Clear explanation why this agent is best",
  "alternatives": [
    {"agent": "other-agent-id", "confidence": 45, "reason": "Why it's alternative"}
  ]
}

Remember:
- Be decisive (pick ONE agent)
- Confidence >90 = excellent match
- If unclear/complex, use "meta-berater" (generalist)
- Return ONLY the JSON, nothing else`;

      // Send to Wingman
      const response = await sendMessage(this.wingmanAgentId, this.wingmanSessionId, wingmanPrompt);

      // Parse Wingman's response
      let selection;
      try {
        // Extract JSON from response (handle if Wingman adds markdown)
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in Wingman response');
        }
        selection = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('❌ Error parsing Wingman response:', parseError);
        console.error('Response was:', response);
        
        // Fallback to keyword-based selection
        console.log('⚠️ Falling back to keyword-based selection');
        return this.fallbackSelection(userQuery);
      }

      // Validate selection
      if (!selection.selectedAgent || !agentLoader.getProfile(selection.selectedAgent)) {
        console.error('❌ Invalid agent selected:', selection.selectedAgent);
        return this.fallbackSelection(userQuery);
      }

      // Get agent profile details
      const profile = agentLoader.getProfile(selection.selectedAgent);
      selection.profile = {
        id: profile.id,
        name: profile.name,
        description: profile.description,
        frameworks: profile.frameworks
      };

      // Cache result
      this.selectionCache.set(userQuery, {
        selection,
        timestamp: Date.now()
      });

      console.log(`✅ Wingman selected: ${profile.name} (confidence: ${selection.confidence}%)`);

      return selection;
    } catch (error) {
      console.error('❌ Error in agent selection:', error);
      return this.fallbackSelection(userQuery);
    }
  }

  /**
   * Fallback to simple keyword-based selection
   * Used when Wingman fails or is unavailable
   */
  fallbackSelection(userQuery) {
    console.log('⚠️ Using fallback keyword-based selection');
    
    const result = agentLoader.selectAgentForTask(userQuery);
    const profile = agentLoader.getProfile(result.agentId);

    return {
      selectedAgent: result.agentId,
      confidence: Math.min(result.score * 10, 75), // Convert to percentage, cap at 75
      reasoning: `Keyword-based match (fallback). Selected based on query content.`,
      profile: {
        id: profile.id,
        name: profile.name,
        description: profile.description,
        frameworks: profile.frameworks
      },
      alternatives: [],
      fallback: true
    };
  }

  /**
   * Clear selection cache
   */
  clearCache() {
    this.selectionCache.clear();
    console.log('🗑️ Selection cache cleared');
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      size: this.selectionCache.size,
      entries: Array.from(this.selectionCache.entries()).map(([query, data]) => ({
        query: query.substring(0, 50),
        agent: data.selection.selectedAgent,
        age: Date.now() - data.timestamp
      }))
    };
  }
}

// Singleton instance
export const orchestrator = new Orchestrator();
