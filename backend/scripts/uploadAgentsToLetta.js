import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createAgent, createSession } from '@letta-ai/letta-code-sdk';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function uploadAgentsToLetta() {
  console.log('🚀 Uploading Agent Profiles to Letta Platform...\n');

  const agentsDir = join(__dirname, '../agents');
  const files = readdirSync(agentsDir).filter(f => f.endsWith('_OPTIMIZED.json'));

  console.log(`📦 Found ${files.length} agent profiles to upload\n`);

  const createdAgents = [];

  for (const file of files) {
    try {
      const filePath = join(agentsDir, file);
      const profile = JSON.parse(readFileSync(filePath, 'utf-8'));

      console.log(`\n🤖 Creating agent: ${profile.name}`);
      console.log(`   ID: ${profile.id}`);
      console.log(`   Version: ${profile.version}`);

      // Create agent on Letta Platform
      const agentId = await createAgent();
      
      console.log(`   ✅ Agent created with ID: ${agentId}`);

      // Create initial session to configure the agent
      const session = await createSession(agentId, {
        systemPrompt: profile.systemInstructions,
        memory: profile.lettaConfig?.memoryBlocks || [],
        allowedTools: profile.lettaConfig?.allowedTools || [],
        model: profile.modelPreferences?.defaultModel || 'claude-sonnet-4',
        temperature: profile.modelPreferences?.temperature || 0.5,
        cwd: profile.lettaConfig?.workingDirectory || './',
        permissionMode: profile.lettaConfig?.permissionMode || 'default'
      });

      console.log(`   ✅ Session configured`);
      
      await session.close();

      createdAgents.push({
        profileId: profile.id,
        profileName: profile.name,
        lettaAgentId: agentId,
        version: profile.version,
        description: profile.description
      });

      console.log(`   ✅ ${profile.name} erfolgreich hochgeladen!`);

    } catch (error) {
      console.error(`   ❌ Error uploading ${file}:`, error.message);
    }
  }

  console.log('\n\n═══════════════════════════════════════════════════');
  console.log('✅ Upload abgeschlossen!\n');
  console.log(`Hochgeladene Agents: ${createdAgents.length}/${files.length}\n`);

  console.log('📋 Agent Mapping:\n');
  console.table(createdAgents);

  // Save mapping to file
  const mapping = {
    uploadedAt: new Date().toISOString(),
    agents: createdAgents
  };

  const mappingPath = join(__dirname, '../agents/letta-agent-mapping.json');
  const fs = await import('fs');
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));

  console.log(`\n💾 Mapping gespeichert in: ${mappingPath}`);
  console.log('\n🎉 Deine Agents sind jetzt auf der Letta Platform verfügbar!');
  console.log('   Platform: https://api.letta.com');
}

uploadAgentsToLetta().catch(console.error);
