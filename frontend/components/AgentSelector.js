'use client'

import { Bot, Brain, Code, DollarSign, Mail, Cog, Briefcase, MessageCircle, Users, GitBranch } from 'lucide-react'

const AGENT_ICONS = {
  'meta-data-ml': Brain,
  'meta-code': Code,
  'meta-finance': DollarSign,
  'meta-marketing': Mail,
  'meta-automation': Cog,
  'meta-business': Briefcase,
  'meta-berater': MessageCircle,
  'meta-onboarding': Users,
  'meta-repo': GitBranch,
}

export default function AgentSelector({ agents, selectedAgent, onSelectAgent, loading, autoSelect }) {
  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary-400" />
          Agents
        </h2>
        {autoSelect && (
          <p className="text-xs text-gray-400 mt-1">Auto-Auswahl aktiviert</p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {agents.map(agent => {
          const Icon = AGENT_ICONS[agent.id] || Bot
          const isSelected = selectedAgent?.id === agent.id

          return (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent)}
              className={`
                w-full text-left p-3 rounded-lg border transition-all
                ${isSelected
                  ? 'bg-primary-600 border-primary-500 shadow-lg shadow-primary-500/20'
                  : 'bg-gray-700 border-gray-600 hover:bg-gray-650 hover:border-gray-500'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-primary-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                    {agent.name}
                  </div>
                  <div className={`text-xs mt-1 line-clamp-2 ${isSelected ? 'text-primary-100' : 'text-gray-400'}`}>
                    {agent.description}
                  </div>
                  {agent.tags && agent.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {agent.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className={`text-xs px-2 py-0.5 rounded ${
                            isSelected
                              ? 'bg-primary-700 text-primary-100'
                              : 'bg-gray-600 text-gray-300'
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
