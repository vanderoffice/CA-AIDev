/**
 * FundingNavigator.jsx
 *
 * Eligibility questionnaire wizard for the Funding Navigator tool.
 * Collects user criteria across 5 steps and will match against
 * funding-programs.json in Plan 04-02.
 *
 * Architecture follows PermitFinder pattern: component owns
 * BotHeader + WizardStepper internally.
 */

import { useState } from 'react'
import BotHeader from './BotHeader'
import WizardStepper from './WizardStepper'
import { DollarSign } from './Icons'

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

export default function FundingNavigator({ onAskWaterBot, onBack, sessionId }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState(INITIAL_ANSWERS)
  const [showResults, setShowResults] = useState(false)
  const [matchedPrograms, setMatchedPrograms] = useState([])

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
    setMatchedPrograms([])
  }

  // Single-select: set answer and auto-advance
  const handleSingleSelect = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }))
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
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

  // Placeholder results view (matching algorithm comes in Plan 04-02)
  if (showResults) {
    return (
      <div className="h-full flex flex-col animate-in fade-in duration-500">
        <BotHeader
          title="Funding Navigator"
          subtitle="California Water Boards"
          onBack={handleBack}
        />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
            <DollarSign size={32} className="text-cyan-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Matching programs...</h3>
          <p className="text-neutral-400 text-sm text-center max-w-md leading-relaxed">
            The matching algorithm will analyze your responses against eligible funding programs.
            This will be implemented in the next plan.
          </p>
          <button
            onClick={handleRestart}
            className="mt-6 px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
          >
            Start Over
          </button>
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
