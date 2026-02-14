/**
 * FundingNavigator.jsx
 *
 * Eligibility questionnaire wizard for the Funding Navigator tool.
 * Collects user criteria across 5 steps and matches against
 * funding-programs.json using deterministic filter + sort algorithm.
 *
 * Architecture follows PermitFinder pattern: component owns
 * BotHeader + WizardStepper internally.
 */

import { useState, useEffect } from 'react'
import BotHeader from './BotHeader'
import WizardStepper from './WizardStepper'
import ResultCard from './ResultCard'
import AskWaterBot from './AskWaterBot'
import { DollarSign, ArrowRight, Droplets, Loader, ExternalLink, Search } from './Icons'
import matchFundingPrograms from '../utils/matchFundingPrograms'
import fundingData from '../../public/funding-programs.json'

// n8n webhook endpoint for RAG enrichment queries
const RAG_WEBHOOK_URL = 'https://n8n.vanderdev.net/webhook/waterbot'

const ENTITY_TYPES = [
  { value: 'public-agency', label: 'Public Agency', description: 'City, county, water district, etc.' },
  { value: 'tribe', label: 'Tribal Entity', description: 'Federally recognized tribe or tribal water system' },
  { value: 'nonprofit', label: 'Nonprofit Organization', description: 'Community group, conservation org' },
  { value: 'private-utility', label: 'Private Utility', description: 'Investor-owned utility' },
  { value: 'mutual-water-company', label: 'Mutual Water Company', description: 'Customer-owned water system' }
]

const PROJECT_TYPES = [
  { value: 'treatment', label: 'Drinking Water Treatment' },
  { value: 'distribution', label: 'Water Distribution / Pipelines' },
  { value: 'storage', label: 'Water Storage', description: 'Tanks, reservoirs' },
  { value: 'recycling', label: 'Water Recycling / Reuse' },
  { value: 'stormwater', label: 'Stormwater Management' },
  { value: 'consolidation', label: 'System Consolidation' },
  { value: 'emergency', label: 'Emergency Repairs' },
  { value: 'operations', label: 'Operations & Maintenance' },
  { value: 'planning', label: 'Planning & Assessment' }
]

const POPULATION_RANGES = [
  { value: 'under-500', label: 'Fewer than 500' },
  { value: '500-3300', label: '500 \u2013 3,300' },
  { value: '3300-10000', label: '3,300 \u2013 10,000' },
  { value: '10000-50000', label: '10,000 \u2013 50,000' },
  { value: 'over-50000', label: 'More than 50,000' }
]

const DAC_OPTIONS = [
  { value: 'dac', label: 'Yes \u2014 Disadvantaged Community (DAC)' },
  { value: 'sdac', label: 'Yes \u2014 Severely Disadvantaged Community (SDAC)' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Not sure', helpText: 'Check at https://gis.water.ca.gov/app/dacs/' }
]

const MATCH_OPTIONS = [
  { value: 'yes', label: 'Yes \u2014 we can match 25% or more' },
  { value: 'limited', label: 'Limited \u2014 we may be able to provide some match' },
  { value: 'no', label: 'No \u2014 we need full funding' }
]

const FUNDING_TYPE_LABELS = {
  'grant': 'Grant',
  'loan': 'Loan',
  'loan-and-grant': 'Loan & Grant',
  'mixed': 'Mixed (Loan + Grant)',
  'technical-assistance': 'Technical Assistance'
}

const TIER_CONFIG = [
  { key: 'eligible', label: 'Eligible', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  { key: 'likelyEligible', label: 'Likely Eligible', bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  { key: 'mayQualify', label: 'May Qualify', bg: 'bg-neutral-500/10', border: 'border-neutral-500/30', text: 'text-neutral-400' }
]

/** Format a funding range object into a readable string */
function formatFundingRange(range) {
  if (!range) return null
  const fmt = (n) => {
    if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
    return `$${n}`
  }
  if (range.min != null && range.max != null) return `${fmt(range.min)} \u2013 ${fmt(range.max)}`
  if (range.max != null) return `Up to ${fmt(range.max)}`
  if (range.min != null) return `From ${fmt(range.min)}`
  if (range.notes) return range.notes
  return null
}

const STEP_TITLES = [
  'What type of organization are you?',
  'What type of water project are you planning?',
  'How many people does your water system serve?',
  'Is your community designated as a Disadvantaged Community (DAC)?',
  'Can your organization provide matching funds for a grant or loan?'
]

const ANSWER_KEYS = ['entityType', 'projectTypes', 'populationServed', 'dacStatus', 'matchFunds']

const INITIAL_ANSWERS = {
  entityType: null,
  projectTypes: [],
  populationServed: null,
  dacStatus: null,
  matchFunds: null
}

/** Build a human-readable RAG query from user answers */
function buildRagQuery(answers) {
  const entity = ENTITY_TYPES.find(e => e.value === answers.entityType)?.label || answers.entityType
  const projects = answers.projectTypes
    .map(pt => PROJECT_TYPES.find(p => p.value === pt)?.label || pt)
    .join(', ')
  const pop = POPULATION_RANGES.find(p => p.value === answers.populationServed)?.label || answers.populationServed
  return `What funding programs are available for a ${entity} working on ${projects} serving ${pop} people?`
}

export default function FundingNavigator({ onAskWaterBot, onBack, onSwitchMode, sessionId }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState(INITIAL_ANSWERS)
  const [showResults, setShowResults] = useState(false)
  const [matchedPrograms, setMatchedPrograms] = useState(null)

  // RAG enrichment state
  const [ragResponse, setRagResponse] = useState(null)
  const [ragSources, setRagSources] = useState(null)
  const [ragLoading, setRagLoading] = useState(false)
  const [ragError, setRagError] = useState(false)

  // Fetch RAG enrichment when results are displayed
  useEffect(() => {
    if (!showResults || !matchedPrograms) return

    const controller = new AbortController()

    setRagLoading(true)
    setRagResponse(null)
    setRagSources(null)
    setRagError(false)

    const ragQuery = buildRagQuery(answers)

    fetch(RAG_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: ragQuery,
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
  }, [showResults, sessionId])

  // Navigate back: clear current step's answer, go to previous step (or exit)
  const handleBack = () => {
    if (showResults) {
      setShowResults(false)
      return
    }
    if (currentStep > 0) {
      const key = ANSWER_KEYS[currentStep]
      setAnswers(prev => ({
        ...prev,
        [key]: key === 'projectTypes' ? [] : null
      }))
      setCurrentStep(currentStep - 1)
    } else {
      onBack()
    }
  }

  // Reset everything
  const handleRestart = () => {
    setCurrentStep(0)
    setAnswers(INITIAL_ANSWERS)
    setShowResults(false)
    setMatchedPrograms(null)
    setRagResponse(null)
    setRagSources(null)
    setRagLoading(false)
    setRagError(false)
  }

  // Single-select: set answer and auto-advance (last step triggers matching)
  const handleSingleSelect = (key, value) => {
    const updated = { ...answers, [key]: value }
    setAnswers(updated)
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      const results = matchFundingPrograms(updated, fundingData.programs)
      setMatchedPrograms(results)
      setShowResults(true)
    }
  }

  // Multi-select toggle (project types)
  const handleMultiToggle = (value) => {
    setAnswers(prev => ({
      ...prev,
      projectTypes: prev.projectTypes.includes(value)
        ? prev.projectTypes.filter(v => v !== value)
        : [...prev.projectTypes, value]
    }))
  }

  // Next button for multi-select step
  const handleNext = () => {
    if (currentStep === 1 && answers.projectTypes.length > 0) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Single-select option buttons (matches PermitFinder styling)
  const renderSingleSelect = (options, answerKey) => (
    <div className="flex flex-col gap-3">
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => handleSingleSelect(answerKey, option.value)}
          className="w-full text-left bg-slate-800 hover:bg-slate-700 border border-neutral-700 hover:border-sky-500/50 rounded-lg p-4 transition-all group"
        >
          <span className="font-medium text-white group-hover:text-sky-400 transition-colors block">
            {option.label}
          </span>
          {option.description && (
            <span className="text-sm text-neutral-500 mt-1 block">{option.description}</span>
          )}
          {option.helpText && (
            <span className="text-xs text-cyan-400 mt-1 block">{option.helpText}</span>
          )}
        </button>
      ))}
    </div>
  )

  // Multi-select checkbox cards with cyan check indicator
  const renderMultiSelect = (options) => (
    <div className="flex flex-col gap-3">
      {options.map(option => {
        const isSelected = answers.projectTypes.includes(option.value)
        return (
          <button
            key={option.value}
            onClick={() => handleMultiToggle(option.value)}
            className={`w-full text-left border rounded-lg p-4 transition-all group ${
              isSelected
                ? 'bg-cyan-500/10 border-cyan-500/50'
                : 'bg-slate-800 hover:bg-slate-700 border-neutral-700 hover:border-sky-500/50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                isSelected
                  ? 'bg-cyan-500 border-cyan-500'
                  : 'border-neutral-600'
              }`}>
                {isSelected && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <div>
                <span className={`font-medium transition-colors block ${
                  isSelected ? 'text-cyan-400' : 'text-white group-hover:text-sky-400'
                }`}>
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-sm text-neutral-500 mt-1 block">{option.description}</span>
                )}
              </div>
            </div>
          </button>
        )
      })}
      <p className="text-xs text-neutral-500 mt-1">Select all that apply, then click Next</p>
    </div>
  )

  // Build steps array for WizardStepper fixed mode
  const steps = [
    { content: renderSingleSelect(ENTITY_TYPES, 'entityType') },
    { content: renderMultiSelect(PROJECT_TYPES) },
    { content: renderSingleSelect(POPULATION_RANGES, 'populationServed') },
    { content: renderSingleSelect(DAC_OPTIONS, 'dacStatus') },
    { content: renderSingleSelect(MATCH_OPTIONS, 'matchFunds') }
  ]

  // Full results view with tiered ResultCards
  if (showResults && matchedPrograms) {
    const total = matchedPrograms.eligible.length + matchedPrograms.likelyEligible.length + matchedPrograms.mayQualify.length
    const matchedIds = new Set([...matchedPrograms.eligible, ...matchedPrograms.likelyEligible, ...matchedPrograms.mayQualify].map(p => p.id))
    const nameById = Object.fromEntries(fundingData.programs.map(p => [p.id, p.name]))

    return (
      <div className="h-full flex flex-col animate-in fade-in duration-500">
        <BotHeader
          title="Funding Navigator"
          subtitle="California Water Boards"
          onBack={handleBack}
        />
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-6">
            {/* Results header */}
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-3">
                <DollarSign size={28} className="text-cyan-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-1">
                {total} Program{total !== 1 ? 's' : ''} Found
              </h3>
              <p className="text-neutral-400 text-sm">Based on your answers</p>
            </div>

            {/* Tier sections */}
            {TIER_CONFIG.map(({ key, label, bg, border, text }) => {
              const programs = matchedPrograms[key]
              if (!programs || programs.length === 0) return null

              return (
                <div key={key} className="space-y-4">
                  {/* Tier header */}
                  <div className={`${bg} border ${border} rounded-lg px-4 py-2.5 flex items-center justify-between`}>
                    <span className={`${text} font-medium`}>{label}</span>
                    <span className={`${text} text-sm`}>{programs.length} Program{programs.length !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Program cards */}
                  {programs.map((program) => (
                    <div key={program.id} className="space-y-2">
                      {/* Match reasons tags */}
                      {program.matchReasons && program.matchReasons.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 px-1">
                          {program.matchReasons.map((reason, idx) => (
                            <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                              {reason}
                            </span>
                          ))}
                        </div>
                      )}

                      <ResultCard
                        title={program.name}
                        code={program.abbreviation || null}
                        description={program.description}
                        agency={program.administeredBy}
                        link={program.programUrl}
                        details={{
                          fundingRange: formatFundingRange(program.fundingRange),
                          ...(program.fundingType ? { fundingType: FUNDING_TYPE_LABELS[program.fundingType] || program.fundingType } : {})
                        }}
                        requirements={program.eligibility?.additionalCriteria}
                        nextSteps={null}
                        ragQuery={program.ragQuery}
                        onAskWaterBot={onAskWaterBot}
                      />

                      {/* Barriers as amber warnings */}
                      {program.barriers && program.barriers.length > 0 && (
                        <div className="px-1 space-y-1">
                          {program.barriers.map((barrier, idx) => (
                            <p key={idx} className="text-xs text-amber-400 flex items-start gap-1.5">
                              <span className="flex-shrink-0 mt-0.5">&#9888;</span>
                              <span>{barrier}</span>
                            </p>
                          ))}
                        </div>
                      )}

                      {/* Related programs (only those also matched) */}
                      {program.relatedPrograms && program.relatedPrograms.filter(id => matchedIds.has(id)).length > 0 && (
                        <p className="text-xs text-slate-500 px-1">
                          Related:{' '}
                          {program.relatedPrograms
                            .filter(id => matchedIds.has(id))
                            .map((id, idx, arr) => (
                              <span key={id}>
                                <span className="text-slate-400">{nameById[id] || id}</span>
                                {idx < arr.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}

            {/* Empty state */}
            {total === 0 && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 text-center space-y-4">
                <p className="text-neutral-400 text-sm leading-relaxed">
                  No programs matched your specific criteria. Try broadening your project types or check the links below for all available programs.
                </p>
                <AskWaterBot
                  query="What water infrastructure funding programs are available in California?"
                  onClick={onAskWaterBot}
                />
              </div>
            )}

            {/* RAG enrichment section */}
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

            {/* AskWaterBot standalone handoff */}
            {total > 0 && (
              <div className="flex justify-center">
                <AskWaterBot
                  query="Tell me more about water infrastructure funding options for my project"
                  onClick={onAskWaterBot}
                />
              </div>
            )}

            {/* Search Again button */}
            <button
              onClick={handleRestart}
              className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 rounded-lg py-3 text-white transition-colors"
            >
              <ArrowRight size={16} className="rotate-180" />
              <span>Search Again</span>
            </button>

            {/* Cross-tool CTA: Permit Finder */}
            {onSwitchMode && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Search size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Know Which Permits You Need?</h4>
                    <p className="text-sm text-neutral-400 mt-1">Find out which water permits your project requires</p>
                  </div>
                </div>
                <button
                  onClick={() => onSwitchMode('permits')}
                  className="w-full flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg py-3 text-blue-400 transition-colors"
                >
                  <span>Find Permits</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      <BotHeader
        title="Funding Navigator"
        subtitle="California Water Boards"
        onBack={handleBack}
      />
      <WizardStepper
        steps={steps}
        currentStep={currentStep}
        onBack={handleBack}
        onRestart={currentStep > 0 ? handleRestart : undefined}
        onNext={currentStep === 1 && answers.projectTypes.length > 0 ? handleNext : undefined}
        title={STEP_TITLES[currentStep]}
      />
    </div>
  )
}
