/**
 * PermitFinder.jsx
 *
 * Decision tree traversal component for the Permit Finder tool.
 * Renders question nodes with selectable options and maintains
 * navigation history for back/restart support.
 *
 * Data source: permit-decision-tree.json (83 nodes)
 */

import { useState } from 'react'
import treeData from '../../permit-decision-tree.json'
import BotHeader from './BotHeader'
import WizardStepper from './WizardStepper'
import { Search } from './Icons'

export default function PermitFinder({ onAskWaterBot, onBack }) {
  const [currentNodeId, setCurrentNodeId] = useState('start')
  const [history, setHistory] = useState([])

  const currentNode = treeData.nodes[currentNodeId]

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
        title={currentNode.title}
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
          /* Result node — minimal placeholder for 02-02 */
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{currentNode.title}</h3>
            <p className="text-neutral-400 text-sm max-w-md mx-auto leading-relaxed">
              Permit results will display here.
            </p>
          </div>
        )}
      </WizardStepper>
    </div>
  )
}
