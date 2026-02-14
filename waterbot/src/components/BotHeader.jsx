/**
 * BotHeader.jsx
 *
 * Shared header for bot tool screens (chat, permit finder, funding navigator).
 * Matches the landing page header style from WaterBot.jsx.
 */

import { ArrowLeft } from './Icons'

export default function BotHeader({ title, subtitle, mode, messages, onBack, onReset }) {
  return (
    <header className="flex justify-between items-end border-b border-neutral-800 pb-6 mb-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-neutral-400 hover:text-white transition-colors p-1"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white glow-text mb-1">{title}</h1>
          {subtitle && <p className="text-neutral-500 text-sm">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          Online
        </div>
        {messages && messages.length > 0 && onReset && (
          <button
            onClick={onReset}
            className="text-xs text-neutral-500 hover:text-red-400 transition-colors"
          >
            Reset
          </button>
        )}
      </div>
    </header>
  )
}
