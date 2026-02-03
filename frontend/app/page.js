'use client'

import { useState, useEffect } from 'react'
import AgentSelector from '../components/AgentSelector'
import ChatInterface from '../components/ChatInterface'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function Home() {
  const [agents, setAgents] = useState([])
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [autoSelect, setAutoSelect] = useState(true)

  useEffect(() => {
    loadAgents()
  }, [])

  async function loadAgents() {
    try {
      const response = await axios.get(`${API_URL}/api/agent-profiles/profiles`)
      setAgents(response.data.profiles)
      setLoading(false)
    } catch (error) {
      console.error('Error loading agents:', error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Letta Web Platform</h1>
              <p className="text-sm text-gray-400">Multi-Agent AI System</p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={autoSelect}
                  onChange={(e) => setAutoSelect(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-700 text-primary-500 focus:ring-2 focus:ring-primary-500"
                />
                Auto-Select Agent
              </label>
              <div className="text-sm text-gray-400">
                {agents.length} Agents verfügbar
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">
          {/* Sidebar - Agent Selection */}
          <div className="col-span-3">
            <AgentSelector
              agents={agents}
              selectedAgent={selectedAgent}
              onSelectAgent={setSelectedAgent}
              loading={loading}
              autoSelect={autoSelect}
            />
          </div>

          {/* Main Chat Area */}
          <div className="col-span-9">
            <ChatInterface
              selectedAgent={selectedAgent}
              autoSelect={autoSelect}
              agents={agents}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
