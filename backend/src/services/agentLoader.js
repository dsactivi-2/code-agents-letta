import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createAgent, createSession } from '@letta-ai/letta-code-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load all agent profiles from the agents directory
export class AgentLoader {
  constructor() {
    this.agentProfiles = new Map();
    this.activeAgents = new Map();
    this.loadAgentProfiles();
  }

  loadAgentProfiles() {
    const agentsDir = join(__dirname, '../../agents');
    const files = readdirSync(agentsDir).filter(f => f.endsWith('_OPTIMIZED.json'));

    console.log(`📦 Loading ${files.length} agent profiles...`);

    for (const file of files) {
      try {
        const filePath = join(agentsDir, file);
        const profile = JSON.parse(readFileSync(filePath, 'utf-8'));
        
        this.agentProfiles.set(profile.id, profile);
        console.log(`✅ Loaded: ${profile.name} (${profile.id})`);
      } catch (error) {
        console.error(`❌ Error loading ${file}:`, error.message);
      }
    }

    console.log(`✅ Loaded ${this.agentProfiles.size} agent profiles total`);
  }

  getProfile(agentId) {
    return this.agentProfiles.get(agentId);
  }

  getAllProfiles() {
    return Array.from(this.agentProfiles.values());
  }

  async createAgentInstance(profileId) {
    const profile = this.getProfile(profileId);
    if (!profile) {
      throw new Error(`Agent profile not found: ${profileId}`);
    }

    console.log(`🤖 Creating agent instance for ${profile.name}...`);

    try {
      // Create agent with Letta SDK
      const agentId = await createAgent();

      // Store agent instance
      const agentInstance = {
        agentId,
        profile,
        createdAt: new Date().toISOString(),
        sessions: []
      };

      this.activeAgents.set(agentId, agentInstance);

      console.log(`✅ Created agent: ${profile.name} (${agentId})`);

      return agentInstance;
    } catch (error) {
      console.error(`❌ Error creating agent instance:`, error);
      throw error;
    }
  }

  async createAgentSession(agentId, options = {}) {
    const agentInstance = this.activeAgents.get(agentId);
    if (!agentInstance) {
      throw new Error(`Agent instance not found: ${agentId}`);
    }

    const { profile } = agentInstance;
    const { lettaConfig, modelPreferences, systemInstructions } = profile;

    console.log(`💬 Creating session for ${profile.name}...`);

    try {
      // Create session with agent's configuration
      const session = await createSession(agentId, {
        systemPrompt: systemInstructions,
        memory: lettaConfig.memoryBlocks || [],
        allowedTools: lettaConfig.allowedTools || [],
        model: options.model || modelPreferences.defaultModel,
        temperature: options.temperature || modelPreferences.temperature,
        cwd: lettaConfig.workingDirectory,
        permissionMode: lettaConfig.permissionMode || 'default',
        ...options
      });

      agentInstance.sessions.push({
        sessionId: session.sessionId,
        conversationId: session.conversationId,
        createdAt: new Date().toISOString()
      });

      console.log(`✅ Session created: ${session.sessionId}`);

      return session;
    } catch (error) {
      console.error(`❌ Error creating session:`, error);
      throw error;
    }
  }

  getAgentInstance(agentId) {
    return this.activeAgents.get(agentId);
  }

  getAllActiveAgents() {
    return Array.from(this.activeAgents.values());
  }

  // Select best agent for a given task/query
  selectAgentForTask(query) {
    const queryLower = query.toLowerCase();
    
    // Keywords mapping to agent types
    const keywords = {
      'meta-data-ml': ['data', 'ml', 'machine learning', 'model', 'training', 'dataset', 'prediction', 'analytics'],
      'meta-code': ['code', 'review', 'refactor', 'test', 'bug', 'debug', 'function', 'class', 'performance'],
      'meta-finance': ['finance', 'budget', 'money', 'accounting', 'invoice', 'expense', 'revenue', 'cost'],
      'meta-marketing': ['marketing', 'seo', 'content', 'campaign', 'social media', 'email', 'blog', 'ads'],
      'meta-automation': ['automate', 'workflow', 'api', 'integration', 'script', 'cron', 'webhook', 'bot'],
      'meta-business': ['strategy', 'business', 'growth', 'market', 'okr', 'competitor', 'revenue'],
      'meta-berater': ['consult', 'advice', 'decision', 'problem', 'analyze', 'recommend', 'solve'],
      'meta-onboarding': ['onboard', 'training', 'guide', 'tutorial', 'documentation', 'learn', 'employee'],
      'meta-repo': ['git', 'repository', 'branch', 'merge', 'commit', 'pull request', 'ci/cd', 'github']
    };

    // Score each agent
    const scores = {};
    for (const [agentId, agentKeywords] of Object.entries(keywords)) {
      scores[agentId] = 0;
      for (const keyword of agentKeywords) {
        if (queryLower.includes(keyword)) {
          scores[agentId] += 1;
        }
      }
    }

    // Find highest scoring agent
    let bestAgent = 'meta-code'; // Default
    let maxScore = 0;
    for (const [agentId, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        bestAgent = agentId;
      }
    }

    const profile = this.getProfile(bestAgent);
    
    console.log(`🎯 Selected agent for query: ${profile.name} (score: ${maxScore})`);

    return {
      agentId: bestAgent,
      profile,
      score: maxScore,
      allScores: scores
    };
  }
}

// Singleton instance
export const agentLoader = new AgentLoader();
