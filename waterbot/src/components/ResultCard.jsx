/**
 * ResultCard.jsx
 *
 * Reusable card for displaying a permit or funding program result.
 * Shows title, code badge, description, detail fields, agency link,
 * expandable requirements/next-steps, and optional "Ask WaterBot" handoff.
 */

import { useState } from 'react'
import { ChevronDown, ExternalLink } from './Icons'
import AskWaterBot from './AskWaterBot'

// Maps detail keys to human-readable labels
const DETAIL_LABELS = {
  estimatedTime: 'Estimated Time',
  fees: 'Fees',
  fundingRange: 'Funding Range',
  deadline: 'Deadline'
}

function ExpandableSection({ title, items }) {
  const [open, setOpen] = useState(false)

  if (!items || items.length === 0) return null

  return (
    <div className="border-t border-neutral-800 pt-3">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center justify-between w-full text-left text-sm font-medium text-neutral-300 hover:text-white transition-colors"
      >
        <span>{title}</span>
        <ChevronDown
          size={16}
          className={`text-neutral-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <ol className="mt-2 space-y-1 list-decimal list-inside text-sm text-neutral-400">
          {items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ol>
      )}
    </div>
  )
}

export default function ResultCard({
  title,
  code,
  description,
  agency,
  link,
  details,
  requirements,
  nextSteps,
  ragQuery,
  onAskWaterBot
}) {
  // Build detail entries from the details object, filtering out empty values
  const detailEntries = details
    ? Object.entries(DETAIL_LABELS)
        .filter(([key]) => details[key])
        .map(([key, label]) => ({ label, value: details[key] }))
    : []

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 glow-box space-y-4">
      {/* Header: title + code badge */}
      <div className="flex items-start gap-3">
        <h3 className="text-lg font-semibold text-white flex-1">{title}</h3>
        {code && (
          <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full bg-sky-500/20 text-sky-400">
            {code}
          </span>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-neutral-400 leading-relaxed">{description}</p>
      )}

      {/* Details grid */}
      {detailEntries.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {detailEntries.map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-neutral-500 mb-0.5">{label}</p>
              <p className="text-sm text-neutral-300">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Agency + external link */}
      {agency && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-neutral-400">{agency}</span>
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors"
            >
              <ExternalLink size={14} />
              <span className="text-xs">Official page</span>
            </a>
          )}
        </div>
      )}

      {/* Expandable sections */}
      <ExpandableSection title="Requirements" items={requirements} />
      <ExpandableSection title="Next Steps" items={nextSteps} />

      {/* Ask WaterBot handoff */}
      {ragQuery && onAskWaterBot && (
        <div className="pt-2">
          <AskWaterBot query={ragQuery} onClick={onAskWaterBot} />
        </div>
      )}
    </div>
  )
}
