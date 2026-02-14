/**
 * WaterBot.jsx
 *
 * California Water Boards assistant chatbot.
 * Adapted for vanderdev-website dashboard layout.
 */

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Droplets, Send, User, Loader, MessageSquare, ArrowRight, Search, DollarSign } from '../components/Icons'
import BotHeader from '../components/BotHeader'
import PermitFinder from '../components/PermitFinder'
import FundingNavigator from '../components/FundingNavigator'
import useBotPersistence from '../hooks/useBotPersistence'

// n8n webhook endpoint for WaterBot chat
const CHAT_WEBHOOK_URL = 'https://n8n.vanderdev.net/webhook/waterbot'

// Mode options for the landing screen
const MODES = [
  {
    id: 'chat',
    icon: MessageSquare,
    title: 'Ask WaterBot',
    description: 'Get answers about water permits, regulations, and compliance.',
    color: 'sky'
  },
  {
    id: 'permits',
    icon: Search,
    title: 'Permit Finder',
    description: 'Find which permits your project needs',
    color: 'blue'
  },
  {
    id: 'funding',
    icon: DollarSign,
    title: 'Funding Navigator',
    description: 'Discover funding programs you may qualify for',
    color: 'cyan'
  }
]

// Suggested questions for new users
const SUGGESTED_QUESTIONS = [
  'What is an NPDES permit?',
  'How do I report a water violation?',
  'What funding is available for small communities?',
  'Who is my Regional Water Board?'
]

export default function WaterBot() {
  // Persisted state via sessionStorage
  const {
    sessionId,
    messages,
    mode,
    setMessages,
    setMode,
    reset
  } = useBotPersistence('waterbot')

  // Local state (not persisted)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when entering chat mode
  useEffect(() => {
    if (mode === 'chat') {
      inputRef.current?.focus()
    }
  }, [mode])

  // Send message to WaterBot
  const sendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return

    const userMessage = { role: 'user', content: messageText.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch(CHAT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText.trim(),
          sessionId,
          messageHistory: messages.map(m => ({ role: m.role, content: m.content }))
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const assistantMessage = {
        role: 'assistant',
        content: data.response || 'I apologize, but I was unable to generate a response. Please try again.',
        sources: data.sources || []
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('WaterBot error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or contact the Water Boards directly at waterboards.ca.gov.',
        error: true
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleModeSelect = (selectedMode) => {
    if (selectedMode.disabled) return
    setMode(selectedMode.id)
  }

  const handleSuggestedQuestion = (question) => {
    sendMessage(question)
  }

  // Ask WaterBot handoff — switches to chat mode and pre-fills the query
  const handleAskWaterBot = (query) => {
    setMode('chat')
    setTimeout(() => sendMessage(query), 100)
  }

  // Choice Screen
  if (mode === 'choice') {
    return (
      <div className="h-full flex flex-col animate-in fade-in duration-500">
        {/* Header */}
        <header className="flex justify-between items-end border-b border-neutral-800 pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white glow-text mb-1">WaterBot</h1>
            <p className="text-neutral-500 text-sm">California Water Boards Assistant</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            Online
          </div>
        </header>

        {/* Welcome */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 mb-6 glow-box">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-sky-500/20 text-sky-500 flex items-center justify-center flex-shrink-0">
              <Droplets size={24} />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white mb-2">Welcome!</h2>
              <p className="text-neutral-400 text-sm leading-relaxed">
                I'm here to help you navigate California's water regulations, permits, and funding programs.
                Whether you need help with NPDES permits, understanding Regional Water Board requirements,
                or finding infrastructure funding, I'm ready to assist.
              </p>
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="grid gap-4">
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => handleModeSelect(m)}
              disabled={m.disabled}
              className={`group flex items-center gap-4 p-4 bg-neutral-900 border border-neutral-800 rounded-lg transition-all text-left ${
                m.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:border-sky-500/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-full bg-${m.color}-500/20 text-${m.color}-500 flex items-center justify-center ${!m.disabled && 'group-hover:scale-110'} transition-transform`}>
                <m.icon size={20} />
              </div>
              <div className="flex-1">
                <h3 className={`font-medium text-white ${!m.disabled && 'group-hover:text-sky-400'} transition-colors`}>
                  {m.title}
                </h3>
                <p className="text-sm text-neutral-500">{m.description}</p>
                {m.disabled && (
                  <span className="text-xs text-neutral-600 mt-1 block">Coming soon</span>
                )}
              </div>
              {!m.disabled && (
                <ArrowRight size={20} className="text-neutral-600 group-hover:text-sky-500 group-hover:translate-x-1 transition-all" />
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-6 text-center">
          <p className="text-xs text-neutral-600">
            WaterBot provides general information only. This is not legal advice.
          </p>
          <p className="text-xs text-neutral-600 mt-1">
            For official guidance, contact your{' '}
            <a href="https://www.waterboards.ca.gov/waterboards_map.html" target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">
              Regional Water Board
            </a>
          </p>
        </div>
      </div>
    )
  }

  // Permit Finder
  if (mode === 'permits') {
    return (
      <PermitFinder
        onAskWaterBot={handleAskWaterBot}
        onBack={() => setMode('choice')}
        onSwitchMode={(m) => setMode(m)}
        sessionId={sessionId}
      />
    )
  }

  // Funding Navigator
  if (mode === 'funding') {
    return (
      <FundingNavigator
        onAskWaterBot={handleAskWaterBot}
        onBack={() => setMode('choice')}
        onSwitchMode={(m) => setMode(m)}
        sessionId={sessionId}
      />
    )
  }

  // Chat Interface
  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      {/* Header */}
      <BotHeader
        title="WaterBot"
        subtitle="California Water Boards Assistant"
        mode={mode}
        messages={messages}
        onBack={() => {
          setMode('choice')
          setMessages([])
        }}
        onReset={reset}
      />

      {/* Chat Container */}
      <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg glow-box flex flex-col overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Empty state with suggestions */}
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-sky-500/20 flex items-center justify-center mx-auto mb-4">
                <Droplets size={32} className="text-sky-500" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">How can I help you today?</h2>
              <p className="text-neutral-400 text-sm mb-6">
                Ask me about water permits, regulations, compliance, or funding programs.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTED_QUESTIONS.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-full text-sm text-neutral-300 hover:border-sky-500/50 hover:text-white transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === 'user'
                  ? 'bg-sky-500/20 text-sky-500'
                  : 'bg-cyan-500/20 text-cyan-500'
              }`}>
                {message.role === 'user' ? <User size={16} /> : <Droplets size={16} />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-sky-500/10 border border-sky-500/20 text-white'
                  : message.error
                    ? 'bg-red-900/30 border border-red-700/50 text-red-200'
                    : 'bg-neutral-800 border border-neutral-700 text-gray-200'
              }`}>
                {message.role === 'user' ? (
                  <p className="text-sm">{message.content}</p>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        a: ({ href, children }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300">
                            {children}
                          </a>
                        ),
                        table: ({ children }) => (
                          <table className="min-w-full text-sm border-collapse">{children}</table>
                        ),
                        th: ({ children }) => (
                          <th className="border border-neutral-600 px-2 py-1 bg-neutral-700/50 text-left">{children}</th>
                        ),
                        td: ({ children }) => (
                          <td className="border border-neutral-600 px-2 py-1">{children}</td>
                        )
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
                {message.sources && message.sources.length > 0 && message.sources[0].fileName !== 'N/A' && (
                  <div className="mt-2 pt-2 border-t border-neutral-700">
                    <p className="text-xs text-neutral-500">
                      Sources: {message.sources.map(s => s.fileName).filter(f => f !== 'N/A').join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-500 flex items-center justify-center">
                <Droplets size={16} />
              </div>
              <div className="bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3">
                <Loader size={16} className="animate-spin text-neutral-400" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-neutral-800">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about water permits, regulations, or funding..."
              disabled={isLoading}
              className="flex-1 bg-black border border-neutral-700 rounded-lg px-4 py-3 text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-sky-500 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-sky-500 hover:bg-sky-600 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-xs text-neutral-600 mt-2 text-center">
            For official guidance, visit{' '}
            <a href="https://www.waterboards.ca.gov" target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline">
              waterboards.ca.gov
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}
