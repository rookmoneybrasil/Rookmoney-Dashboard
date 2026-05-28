'use client'

import * as React from 'react'

// ─── Gradient map ─────────────────────────────────────────────────────────────

const GRADIENT_MAP: Record<string, string> = {
  blue:   'linear-gradient(hsl(223,90%,50%), hsl(208,90%,50%))',
  purple: 'linear-gradient(hsl(283,90%,50%), hsl(268,90%,50%))',
  red:    'linear-gradient(hsl(3,90%,50%),   hsl(348,90%,50%))',
  indigo: 'linear-gradient(hsl(253,90%,50%), hsl(238,90%,50%))',
  orange: 'linear-gradient(hsl(43,90%,50%),  hsl(28,90%,50%))',
  green:  'linear-gradient(hsl(123,90%,40%), hsl(108,90%,40%))',
  amber:  'linear-gradient(hsl(43,90%,50%),  hsl(33,90%,45%))',
  rose:   'linear-gradient(hsl(343,90%,50%), hsl(330,90%,50%))',
  cyan:   'linear-gradient(hsl(188,90%,40%), hsl(200,90%,40%))',
  slate:  'linear-gradient(hsl(215,20%,35%), hsl(215,20%,25%))',
}

function resolveColor(color: string): string {
  return GRADIENT_MAP[color] ?? color
}

// ─── Single glass icon (used in sidebar nav) ──────────────────────────────────

export interface GlassIconProps {
  icon:        React.ReactNode
  color?:      string
  label?:      string
  active?:     boolean
  className?:  string
  onClick?:    () => void
  as?:         'button' | 'div'
}

export function GlassIcon({
  icon,
  color   = 'slate',
  label,
  active  = false,
  className = '',
  onClick,
  as: Tag = 'button',
}: GlassIconProps) {
  const backStyle = {
    background: active
      ? resolveColor('blue')
      : resolveColor(color),
  }

  return (
    <Tag
      className={`glass-icon-btn ${className}`}
      onClick={onClick}
      type={Tag === 'button' ? 'button' : undefined}
      aria-label={label}
    >
      <span className="glass-icon-back" style={backStyle} />
      <span className="glass-icon-front">
        <span className="glass-icon-inner" aria-hidden="true">
          {icon}
        </span>
      </span>
      {label && <span className="glass-icon-label">{label}</span>}
    </Tag>
  )
}

// ─── Grid of glass icons ───────────────────────────────────────────────────────

export interface GlassIconItem {
  icon:         React.ReactNode
  color?:       string
  label:        string
  customClass?: string
  onClick?:     () => void
}

export interface GlassIconsProps {
  items:      GlassIconItem[]
  columns?:   number
  className?: string
  colorful?:  boolean
}

export function GlassIcons({ items, columns = 3, className = '', colorful = true }: GlassIconsProps) {
  return (
    <div
      className={`glass-icons-grid ${className}`}
      style={{ '--gi-cols': columns } as React.CSSProperties}
    >
      {items.map((item, i) => (
        <GlassIcon
          key={i}
          icon={item.icon}
          color={colorful ? (item.color ?? 'slate') : 'slate'}
          label={item.label}
          className={item.customClass ?? ''}
          onClick={item.onClick}
        />
      ))}
    </div>
  )
}
