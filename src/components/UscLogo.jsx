import React from 'react'

/**
 * USC brand mark — a cardinal badge with the "USC" wordmark in serif.
 * Rendered as inline SVG so it stays crisp at any size and needs no asset.
 */
export function UscMark({ className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 40 40" className={className} role="img" aria-label="USC">
      <rect width="40" height="40" rx="9" fill="#990000" />
      <text
        x="20"
        y="26.5"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="15"
        fontWeight="700"
        letterSpacing="0.5"
        fill="#ffffff"
      >
        USC
      </text>
    </svg>
  )
}

/**
 * USC logo lockup — the mark plus a two-line label.
 */
export function UscLockup({ title, subtitle = 'USC Housing', markClassName = 'h-9 w-9' }) {
  return (
    <div className="flex items-center gap-2.5">
      <UscMark className={markClassName} />
      <div className="leading-tight">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  )
}

export default UscMark
