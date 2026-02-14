/**
 * AskWaterBot.jsx
 *
 * Standalone "Ask WaterBot" handoff button.
 * Fires a callback with the pre-filled query — does NOT handle navigation.
 * Parent component (WaterBot.jsx) switches to chat mode and sends the message.
 *
 * Variants:
 *   - 'button' (default): bordered button with icon
 *   - 'inline': smaller text-link style for embedding in prose
 */

import { MessageSquare } from './Icons'

export default function AskWaterBot({ query, onClick, variant = 'button' }) {
  const handleClick = () => {
    if (onClick) onClick(query)
  }

  if (variant === 'inline') {
    return (
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
      >
        <MessageSquare size={14} />
        <span>Ask WaterBot</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 px-4 py-2 border border-sky-500/50 text-sky-400 hover:bg-sky-500/10 rounded-lg text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900"
    >
      <MessageSquare size={16} />
      <span>Ask WaterBot about this</span>
    </button>
  )
}
