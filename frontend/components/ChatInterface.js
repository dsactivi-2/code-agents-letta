'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Bot, User, Sparkles } from 'lucide-react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function ChatInterface({ selectedAgent, autoSelect, agents }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentAgent, setCurrentAgent] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function sendMessage(e) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }])

    try {
      const response = await fetch(`${API_URL}/api/smart-chat/smart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          agentId: !autoSelect && selectedAgent ? selectedAgent.id : undefined,
          autoSelect: autoSelect
        }),
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''
      let selectedAgentInfo = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (data.type === 'agent_selected') {
                selectedAgentInfo = data.agent
                setCurrentAgent(data.agent)
                if (data.autoSelected) {
                  setMessages(prev => [...prev, {
                    role: 'system',
                    content: `Agent ausgewählt: ${data.agent.name}`,
                    agent: data.agent,
                    timestamp: new Date().toISOString()
                  }])
                }
              } else if (data.type === 'assistant') {
                assistantMessage += data.content
                setMessages(prev => {
                  const newMessages = [...prev]
                  const lastMsg = newMessages[newMessages.length - 1]
                  if (lastMsg && lastMsg.role === 'assistant') {
                    lastMsg.content = assistantMessage
                  } else {
                    newMessages.push({
                      role: 'assistant',
                      content: assistantMessage,
                      agent: selectedAgentInfo,
                      timestamp: new Date().toISOString()
                    })
                  }
                  return newMessages
                })
              } else if (data.type === 'done') {
                console.log('Stream completed')
              } else if (data.type === 'error') {
                setMessages(prev => [...prev, {
                  role: 'error',
                  content: data.error,
                  timestamp: new Date().toISOString()
                }])
              }
            } catch (e) {
              console.error('Error parsing SSE:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, {
        role: 'error',
        content: 'Fehler beim Senden der Nachricht: ' + error.message,
        timestamp: new Date().toISOString()
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">
              {currentAgent ? currentAgent.name : autoSelect ? 'Smart Chat' : selectedAgent?.name || 'Wähle einen Agent'}
            </h3>
            <p className="text-xs text-gray-400">
              {currentAgent ? currentAgent.description : autoSelect ? 'Agent wird automatisch ausgewählt' : selectedAgent?.description || 'Keine Auswahl'}
            </p>
          </div>
        </div>
        {autoSelect && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Sparkles className="w-4 h-4 text-primary-400" />
            Auto-Modus
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Bot className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-lg font-medium">Starte eine Konversation</p>
              <p className="text-sm mt-2">
                {autoSelect 
                  ? 'Der beste Agent wird automatisch für deine Anfrage ausgewählt'
                  : selectedAgent 
                    ? `Chatte mit ${selectedAgent.name}`
                    : 'Wähle einen Agent aus der Seitenleiste'
                }
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role !== 'user' && (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'system' ? 'bg-gray-700' : msg.role === 'error' ? 'bg-red-600' : 'bg-primary-600'
              }`}>
                {msg.role === 'system' ? <Sparkles className="w-4 h-4 text-gray-300" /> : <Bot className="w-5 h-5 text-white" />}
              </div>
            )}

            <div className={`max-w-[70%] ${msg.role === 'user' ? 'order-first' : ''}`}>
              {msg.agent && msg.role === 'assistant' && (
                <div className="text-xs text-gray-400 mb-1">{msg.agent.name}</div>
              )}
              <div className={`rounded-lg p-3 ${
                msg.role === 'user' 
                  ? 'bg-primary-600 text-white' 
                  : msg.role === 'system'
                    ? 'bg-gray-700 text-gray-300'
                    : msg.role === 'error'
                      ? 'bg-red-900 text-red-200'
                      : 'bg-gray-700 text-gray-100'
              }`}>
                <div className="whitespace-pre-wrap break-words">{msg.content}</div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString('de-DE')}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gray-300" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
            <div className="bg-gray-700 rounded-lg p-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              autoSelect 
                ? "Stelle eine Frage (Agent wird automatisch gewählt)..." 
                : selectedAgent 
                  ? `Frage ${selectedAgent.name}...`
                  : "Wähle zuerst einen Agent..."
            }
            disabled={loading || (!autoSelect && !selectedAgent)}
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || (!autoSelect && !selectedAgent)}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-colors"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
