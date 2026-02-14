/**
 * PermitFinder.jsx
 *
 * Decision tree traversal component for the Permit Finder tool.
 * Renders question nodes with selectable options and maintains
 * navigation history for back/restart support.
 *
 * Data source: permit-decision-tree.json (83 nodes)
 */

import { useState, useEffect } from 'react'
import treeData from '../../permit-decision-tree.json'
import BotHeader from './BotHeader'
import WizardStepper from './WizardStepper'
import ResultCard from './ResultCard'
import AskWaterBot from './AskWaterBot'
import { Search, ArrowRight, Droplets, Loader, ExternalLink, DollarSign } from './Icons'

// n8n webhook endpoint for RAG enrichment queries
const RAG_WEBHOOK_URL = 'https://n8n.vanderdev.net/webhook/waterbot'

export default function PermitFinder({ onAskWaterBot, onBack, onSwitchMode, sessionId }) {
  const [currentNodeId, setCurrentNodeId] = useState('start')
  const [history, setHistory] = useState([])

  // RAG enrichment state
  const [ragResponse, setRagResponse] = useState(null)
  const [ragSources, setRagSources] = useState(null)
  const [ragLoading, setRagLoading] = useState(false)
  const [ragError, setRagError] = useState(false)

  const currentNode = treeData.nodes[currentNodeId]

  // Fetch RAG enrichment when landing on a result node with a ragQuery
  useEffect(() => {
    if (currentNode.type !== 'result' || !currentNode.ragQuery) return

    const controller = new AbortController()

    setRagLoading(true)
    setRagResponse(null)
    setRagSources(null)
    setRagError(false)

    fetch(RAG_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: currentNode.ragQuery,
        sessionId,
        messageHistory: []
      }),
      signal: controller.signal
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        setRagResponse(data.response || null)
        setRagSources(data.sources || [])
        setRagLoading(false)
      })
      .catch(err => {
        if (err.name === 'AbortError') return
        console.error('RAG enrichment error:', err)
        setRagError(true)
        setRagLoading(false)
      })

    return () => controller.abort()
  }, [currentNodeId, sessionId])

  // Push current node onto history stack and navigate forward
  const selectOption = (nextNodeId) => {
    setHistory(prev => [...prev, currentNodeId])
    setCurrentNodeId(nextNodeId)
  }

  // Pop last node from history stack, or exit to landing if at root
  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1]
      setHistory(h => h.slice(0, -1))
      setCurrentNodeId(prev)
    } else {
      onBack()
    }
  }

  // Reset to the start node and clear all history
  const restart = () => {
    setCurrentNodeId('start')
    setHistory([])
  }

  const isResult = currentNode.type === 'result'
  const hasPermits = isResult && currentNode.permits && currentNode.permits.length > 0

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      <BotHeader
        title="Permit Finder"
        subtitle="California Water Boards"
        onBack={goBack}
      />
      <WizardStepper
        currentStep={history.length}
        onBack={goBack}
        onRestart={history.length > 0 ? restart : undefined}
        title={isResult ? 'Your Results' : currentNode.title}
        subtitle={isResult ? '' : undefined}
      >
        {currentNode.type === 'question' ? (
          <div>
            {currentNode.helpText && (
              <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
                {currentNode.helpText}
              </p>
            )}
            <div className="flex flex-col gap-3">
              {currentNode.options.map(option => (
                <button
                  key={option.id}
                  onClick={() => selectOption(option.next)}
                  className="w-full text-left bg-slate-800 hover:bg-slate-700 border border-neutral-700 hover:border-sky-500/50 rounded-lg p-4 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    {option.icon && (
                      <span className="text-lg flex-shrink-0 mt-0.5">{option.icon}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-white group-hover:text-sky-400 transition-colors block">
                        {option.label}
                      </span>
                      {option.description && (
                        <span className="text-sm text-neutral-500 mt-1 block">
                          {option.description}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Result node — full permit result rendering */
          <div className="space-y-6">
            {/* Result header */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">{currentNode.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {hasPermits
                  ? `Based on your answers, you may need the following permit${currentNode.permits.length > 1 ? 's' : ''}:`
                  : 'Based on your answers, no specific water permit appears to be required for your project.'}
              </p>
            </div>

            {/* Additional info block */}
            {currentNode.additionalInfo && (
              <div className="bg-sky-500/10 border border-sky-500/20 rounded-lg p-4">
                <p className="text-sm text-sky-300 leading-relaxed">
                  {currentNode.additionalInfo}
                </p>
              </div>
            )}

            {/* Permit cards */}
            {hasPermits ? (
              <div className="space-y-4">
                {currentNode.permits.map((permit, idx) => (
                  <ResultCard
                    key={permit.code || idx}
                    title={permit.name}
                    code={permit.code}
                    description={permit.description}
                    agency={permit.agency}
                    link={permit.link}
                    details={{ estimatedTime: permit.estimatedTime, fees: permit.fees }}
                    requirements={currentNode.requirements}
                    nextSteps={currentNode.nextSteps}
                    ragQuery={currentNode.ragQuery}
                    onAskWaterBot={onAskWaterBot}
                  />
                ))}
              </div>
            ) : (
              /* No-permit case: standalone next steps + AskWaterBot */
              <div className="space-y-4">
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 glow-box space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Search size={20} className="text-emerald-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-white">No Permit Required</h4>
                  </div>
                  <p className="text-sm text-neutral-400 leading-relaxed">
                    While no specific water permit is needed, there may still be local requirements or best practices to follow.
                  </p>

                  {/* Standalone next steps */}
                  {currentNode.nextSteps && currentNode.nextSteps.length > 0 && (
                    <div className="border-t border-neutral-800 pt-3">
                      <h5 className="text-sm font-medium text-neutral-300 mb-2">Recommended Next Steps</h5>
                      <ol className="space-y-1 list-decimal list-inside text-sm text-neutral-400">
                        {currentNode.nextSteps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* AskWaterBot handoff */}
                  {currentNode.ragQuery && onAskWaterBot && (
                    <div className="pt-2">
                      <AskWaterBot query={currentNode.ragQuery} onClick={onAskWaterBot} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* RAG enrichment section */}
            {currentNode.ragQuery && (
              <>
                {ragLoading && (
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                    <Loader size={16} className="animate-spin text-slate-400 flex-shrink-0" />
                    <span className="text-sm text-slate-400">Getting additional context from WaterBot...</span>
                  </div>
                )}

                {ragResponse && (
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Droplets size={16} className="text-blue-400 flex-shrink-0" />
                      <h4 className="text-sm font-medium text-blue-400">WaterBot Insights</h4>
                    </div>
                    <div className="space-y-3">
                      {ragResponse.split('\n\n').map((paragraph, idx) => (
                        <p key={idx} className="text-sm text-slate-300 leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    {ragSources && ragSources.length > 0 && ragSources[0]?.fileName !== 'N/A' && (
                      <div className="border-t border-slate-700 pt-3">
                        <p className="text-xs text-slate-500 mb-2">Sources</p>
                        <div className="flex flex-wrap gap-2">
                          {ragSources.map((source, idx) => {
                            const url = typeof source === 'string' ? source : source.url
                            const label = typeof source === 'string' ? source : (source.title || source.fileName || source.url)
                            if (!url || label === 'N/A') return null
                            return (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:underline"
                              >
                                {label}
                                <ExternalLink size={10} />
                              </a>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {ragError && (
                  <p className="text-sm text-slate-500 italic px-1">Additional context unavailable</p>
                )}
              </>
            )}

            {/* Restart button */}
            <button
              onClick={restart}
              className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 rounded-lg py-3 text-white transition-colors"
            >
              <ArrowRight size={16} className="rotate-180" />
              <span>Start New Search</span>
            </button>

            {/* Cross-tool CTA: Funding Navigator */}
            {onSwitchMode && (
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <DollarSign size={20} className="text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Need Help Funding This Project?</h4>
                    <p className="text-sm text-neutral-400 mt-1">Discover grant and loan programs you may qualify for</p>
                  </div>
                </div>
                <button
                  onClick={() => onSwitchMode('funding')}
                  className="w-full flex items-center justify-center gap-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 rounded-lg py-3 text-cyan-400 transition-colors"
                >
                  <span>Explore Funding</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </WizardStepper>
    </div>
  )
}
