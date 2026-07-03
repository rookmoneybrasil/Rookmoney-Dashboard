'use client'

import { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'
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
// customer got stuck on this during onboarding. So the VISIBLE field masks
// dd/mm/aaaa entry by hand, cash-register style like CurrencyInput.
//
// On top of that, a calendar icon overlays a transparent native
// <input type="date"> covering only the icon area: one tap there opens the
// browser's real date picker (a calendar on desktop, the wheel on mobile)
// without the mobile text-fallback problem, since that native input is never
// the thing you type into. Both paths write the same hidden ISO-string input
// so existing fd.get(name) call sites don't change.
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

  const iso = toIso(digits)

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

  // The native picker hands back a full "yyyy-mm-dd" — feed it straight in.
  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.value // "" while clearing, else "yyyy-mm-dd"
    setDigits(isoToDigits(picked))
    onValueChange?.(picked)
  }

  return (
    <div className={cn('relative', disabled && 'opacity-50')}>
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
          'peer h-10 w-full rounded-lg bg-ink-800 border text-sm text-slate-100 placeholder:text-slate-600 pl-3 pr-11',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'border-ink-500 hover:border-ink-400',
          className
        )}
      />

      {/* Calendar affordance — the icon is decorative; the transparent native
          date input sits on top of it so a tap opens the real picker. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 peer-focus:text-brand-400"
      >
        <Calendar className="size-4" />
      </span>
      {!disabled && (
        <input
          type="date"
          aria-label="Abrir calendário"
          tabIndex={-1}
          value={iso}
          onChange={handlePick}
          className="absolute inset-y-0 right-0 h-full w-11 cursor-pointer opacity-0"
        />
      )}

      {name && <input type="hidden" name={name} value={iso} />}
    </div>
  )
}
