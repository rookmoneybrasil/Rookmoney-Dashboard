'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface DateInputProps {
  id?: string
  /** Omit when the parent tracks the value itself (controlled `value` + `onValueChange`, no native form submission needed) — no hidden input is rendered. */
  name?: string
  defaultValue?: string | null // ISO date string ("2026-07-15" or full datetime) — uncontrolled seed
  value?: string | null        // ISO date string — controlled; re-syncs the field when it changes externally
  required?: boolean
  disabled?: boolean
  className?: string
  onValueChange?: (isoDate: string) => void
}

function isoToDigits(iso?: string | null) {
  if (!iso) return ''
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? `${m[3]}${m[2]}${m[1]}` : ''
}

// Native <input type="date"> renders inconsistently on mobile web (some
// browsers/webviews fall back to a plain text field with no format
// enforcement and an "AAAA-MM-DD" placeholder instead of a picker) — a real
// customer got stuck on this during onboarding. This masks dd/mm/aaaa entry
// by hand, cash-register style like CurrencyInput, and exposes the same
// value as a hidden ISO-string input so existing fd.get(name) call sites
// don't need to change.
export function DateInput({ id, name, defaultValue, value, required, disabled, className, onValueChange }: DateInputProps) {
  const [digits, setDigits] = useState<string>(() => isoToDigits(defaultValue))

  // Controlled mode: re-derive digits whenever the parent-owned value changes
  // (e.g. an OCR-scanned receipt filling the date in after the fact).
  useEffect(() => {
    if (value !== undefined) setDigits(isoToDigits(value))
  }, [value])

  function set(next: string) {
    const trimmed = next.slice(0, 8)
    setDigits(trimmed)
    onValueChange?.(toIso(trimmed))
  }

  function toIso(d: string) {
    if (d.length !== 8) return ''
    return `${d.slice(4, 8)}-${d.slice(2, 4)}-${d.slice(0, 2)}`
  }

  const display = digits
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2}\/\d{2})(\d)/, '$1/$2')

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault()
      set(digits + e.key)
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault()
      set(digits.slice(0, -1))
    }
  }

  // Fallback for mobile soft keyboard (onKeyDown may not fire reliably)
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    set(e.target.value.replace(/\D/g, ''))
  }

  return (
    <>
      <input
        type="text"
        id={id}
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="dd/mm/aaaa"
        required={required}
        disabled={disabled}
        autoComplete="off"
        maxLength={10}
        className={cn(
          'peer h-10 w-full rounded-lg bg-ink-800 border text-sm text-slate-100 placeholder:text-slate-600 px-3',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'border-ink-500 hover:border-ink-400',
          className
        )}
      />
      {name && <input type="hidden" name={name} value={toIso(digits)} />}
    </>
  )
}
