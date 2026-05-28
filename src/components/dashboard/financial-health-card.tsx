'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronDown, ExternalLink } from 'lucide-react'
import type { FinancialHealth, HealthComponent } from '@/app/actions/financial-health'

// ─── Arc SVG ──────────────────────────────────────────────────────────────────

function ScoreArc({ score, color }: { score: number; color: string }) {
  // Arc from -210° to 30° (240° sweep) centered at bottom
  const R = 52
  const cx = 64
  const cy = 68
  const startAngle = -210
  const sweepTotal = 240
  const sweepFill  = (score / 100) * sweepTotal

  function polar(angle: number) {
    const rad = (angle * Math.PI) / 180
    return { x: cx + R * Math.cos(rad), y: cy + R * Math.sin(rad) }
  }

  function arc(from: number, to: number) {
    const s = polar(from)
    const e = polar(to)
    const large = Math.abs(to - from) > 180 ? 1 : 0
    return `M ${s.x} ${s.y} A ${R} ${R} 0 ${large} 1 ${e.x} ${e.y}`
  }

  const strokeColor = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <svg viewBox="0 0 128 88" className="w-36 h-auto">
      {/* Track */}
      <path
        d={arc(startAngle, startAngle + sweepTotal)}
        fill="none"
        stroke="#1e293b"
        strokeWidth="10"
        strokeLinecap="round"
      />
      {/* Fill */}
      {score > 0 && (
        <path
          d={arc(startAngle, startAngle + sweepFill)}
          fill="none"
          stroke={strokeColor}
          strokeWidth="10"
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease', filter: `drop-shadow(0 0 6px ${strokeColor}60)` }}
        />
      )}
      {/* Score text */}
      <text x={cx} y={cy - 4} textAnchor="middle" className="fill-slate-100" fontSize="22" fontWeight="bold" fontFamily="inherit">
        {score}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" className="fill-slate-500" fontSize="9" fontFamily="inherit">
        de 100
      </text>
    </svg>
  )
}

// ─── Component bar ────────────────────────────────────────────────────────────

const statusColors: Record<HealthComponent['status'], string> = {
  good:    'bg-success',
  ok:      'bg-brand-500',
  warn:    'bg-amber-500',
  bad:     'bg-danger',
  neutral: 'bg-ink-500',
}

function ComponentRow({ comp }: { comp: HealthComponent }) {
  const pct = Math.round((comp.score / comp.max) * 100)
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 w-28 shrink-0 truncate">{comp.label}</span>
      <div className="flex-1 h-1.5 bg-ink-700 rounded-full overflow-hidden">
        <div
          className={`h-1.5 rounded-full transition-all duration-700 ${statusColors[comp.status]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-slate-500 w-10 text-right shrink-0">
        {comp.score}/{comp.max}
      </span>
    </div>
  )
}

// ─── Main card ────────────────────────────────────────────────────────────────

export function FinancialHealthCard({ health }: { health: FinancialHealth }) {
  const [expanded, setExpanded] = useState(false)

  const gradeBg: Record<string, string> = {
    S: 'bg-success/10 border-success/30 text-success',
    A: 'bg-success/10 border-success/20 text-success',
    B: 'bg-brand-900  border-brand-700/40 text-brand-300',
    C: 'bg-amber-900/30 border-amber-700/30 text-amber-400',
    D: 'bg-danger/8  border-danger/20 text-danger',
    F: 'bg-danger/10 border-danger/30 text-danger',
  }

  return (
    <div className="rounded-xl border border-ink-600 bg-ink-800 overflow-hidden">
      {/* Main row */}
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Arc */}
        <ScoreArc score={health.score} color={health.color} />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-slate-300">Saúde financeira</h3>
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${gradeBg[health.grade]}`}>
              {health.grade}
            </span>
          </div>
          <p className={`text-lg font-bold ${health.color}`}>{health.label}</p>

          {/* Tips */}
          <div className="mt-3 flex flex-col gap-1.5">
            {health.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-sm leading-none mt-0.5">{tip.icon}</span>
                {tip.href ? (
                  <Link href={tip.href} className="text-xs text-slate-400 hover:text-slate-200 transition-colors leading-snug flex items-center gap-1">
                    {tip.message}
                    <ExternalLink className="size-2.5 shrink-0 opacity-60" />
                  </Link>
                ) : (
                  <p className="text-xs text-slate-400 leading-snug">{tip.message}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-2.5 border-t border-ink-700 text-xs text-slate-500 hover:text-slate-300 hover:bg-ink-750 transition-colors"
      >
        <span>Ver detalhes por categoria</span>
        <ChevronDown className={`size-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Component breakdown */}
      {expanded && (
        <div className="px-5 pb-4 pt-3 border-t border-ink-700 flex flex-col gap-3 animate-in slide-in-from-top-1 duration-150">
          {health.components.map(comp => (
            <div key={comp.key}>
              <ComponentRow comp={comp} />
              <p className="text-[11px] text-slate-600 mt-0.5 ml-[7.5rem]">{comp.detail}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
