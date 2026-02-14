/**
 * BotMarkdown.jsx
 *
 * Shared markdown renderer for all WaterBot output surfaces:
 * chat bubbles, RAG enrichment panels, and future bot components.
 *
 * Uses react-markdown + remark-gfm with dark-theme component overrides
 * tuned for the WaterBot sky-blue accent palette.
 */

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const components = {
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors">
      {children}
    </a>
  ),
  h1: ({ children }) => (
    <h3 className="text-base font-semibold text-white mt-5 mb-2.5 first:mt-0 pb-1.5 border-b border-sky-500/20">{children}</h3>
  ),
  h2: ({ children }) => (
    <h4 className="text-sm font-semibold text-sky-300 mt-4 mb-2 first:mt-0 uppercase tracking-wide">{children}</h4>
  ),
  h3: ({ children }) => (
    <h5 className="text-sm font-medium text-neutral-100 mt-3 mb-1.5 first:mt-0">{children}</h5>
  ),
  p: ({ children }) => (
    <p className="text-sm text-neutral-300 leading-relaxed my-2 first:mt-0 last:mb-0">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="my-2.5 space-y-1.5 text-sm">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside ml-4 my-2.5 space-y-1.5 text-sm">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="text-neutral-300 leading-relaxed pl-1 flex gap-2 items-start">
      <span className="text-sky-500/70 mt-1.5 flex-shrink-0 text-[8px]">&#9679;</span>
      <span>{children}</span>
    </li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-neutral-400">{children}</em>
  ),
  code: ({ children, className }) => {
    const isBlock = className && className.startsWith('language-')
    if (isBlock) {
      return <code className={`text-sm font-mono ${className || ''}`}>{children}</code>
    }
    return (
      <code className="bg-sky-500/10 text-sky-300 text-xs font-mono px-1.5 py-0.5 rounded border border-sky-500/20">{children}</code>
    )
  },
  pre: ({ children }) => (
    <pre className="bg-neutral-950 border border-neutral-700/50 rounded-lg p-4 my-3 overflow-x-auto text-sm font-mono">{children}</pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-sky-400/40 bg-sky-500/5 rounded-r-lg pl-4 pr-3 py-2 my-3 text-neutral-300 italic">{children}</blockquote>
  ),
  hr: () => <hr className="border-neutral-700/50 my-5" />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-3 rounded-lg border border-neutral-700/50">
      <table className="min-w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-sky-500/10">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="border-b border-neutral-700/50 px-3 py-2 text-left text-xs font-medium text-sky-300 uppercase tracking-wider">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-b border-neutral-800/50 px-3 py-2 text-neutral-300">{children}</td>
  ),
}

export default function BotMarkdown({ content }) {
  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
