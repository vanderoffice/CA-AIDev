/**
 * WizardStepper.jsx
 *
 * Reusable wizard shell component for multi-step flows.
 * Supports two modes:
 *   - Fixed: `steps` array provided → shows "Step X of Y" progress
 *   - Dynamic: no `steps`, parent passes `children` → shows step count only
 *
 * Used by Permit Finder (dynamic branching) and Funding Navigator (fixed steps).
 */

import { ArrowLeft, ArrowRight } from './Icons'

export default function WizardStepper({
  steps,
  currentStep = 0,
  onNext,
  onBack,
  onRestart,
  title,
  subtitle,
  children
}) {
  const isFixed = Array.isArray(steps) && steps.length > 0
  const totalSteps = isFixed ? steps.length : null
  const progress = isFixed ? ((currentStep + 1) / totalSteps) * 100 : null
  const isFirstStep = currentStep === 0
  const isLastStep = isFixed ? currentStep >= totalSteps - 1 : false

  // In fixed mode, render the current step's content; in dynamic mode, render children
  const content = isFixed ? steps[currentStep]?.content : children

  return (
    <div className="h-full flex flex-col animate-in">
      {/* Progress bar */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                disabled={isFirstStep}
                className="text-neutral-400 hover:text-white transition-colors p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Go back"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-white">{title}</h2>
              )}
              {subtitle && (
                <p className="text-xs text-neutral-500">{subtitle}</p>
              )}
            </div>
          </div>
          <span className="text-xs text-neutral-500">
            {isFixed
              ? `Step ${currentStep + 1} of ${totalSteps}`
              : `Step ${currentStep + 1}`}
          </span>
        </div>

        {/* Progress track */}
        <div className="h-1 bg-neutral-800 rounded-full overflow-hidden mb-4">
          {isFixed ? (
            <div
              className="h-full bg-sky-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          ) : (
            <div
              className="h-full bg-sky-500 rounded-full transition-all duration-300"
              style={{ width: '100%', opacity: 0.5 }}
            />
          )}
        </div>
      </div>

      {/* Step content area */}
      <div className="flex-1 overflow-y-auto bg-neutral-900 border border-neutral-800 rounded-lg p-6 glow-box">
        <div className="animate-in" key={currentStep}>
          {content}
        </div>
      </div>

      {/* Navigation footer */}
      <div className="flex-shrink-0 flex items-center justify-between mt-4 pt-4 border-t border-neutral-800">
        <div>
          {onRestart && currentStep > 0 && (
            <button
              onClick={onRestart}
              className="text-xs text-neutral-500 hover:text-red-400 transition-colors"
            >
              Start Over
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              disabled={isFirstStep}
              className="px-4 py-2 text-sm text-neutral-400 hover:text-white border border-neutral-700 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Back
            </button>
          )}
          {onNext && (
            <button
              onClick={onNext}
              className="px-4 py-2 text-sm text-white bg-sky-500 hover:bg-sky-600 rounded-lg transition-colors flex items-center gap-2"
            >
              {isLastStep ? 'Finish' : 'Next'}
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
