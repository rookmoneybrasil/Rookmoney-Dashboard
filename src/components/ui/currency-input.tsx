'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const MAX_CENTS = 999_999_999 // R$ 9.999.999,99

interface CurrencyInputProps {
  id?: string
  name: string
  defaultValue?: number | string
  required?: boolean
  disabled?: boolean
  className?: string
  onValueChange?: (value: number) => void
}

export function CurrencyInput({ id, name, defaultValue, required, disabled, className, onValueChange }: CurrencyInputProps) {
  const [cents, setCents] = useState<number>(() => {
    const n = parseFloat(String(defaultValue ?? '0'))
    return isNaN(n) ? 0 : Math.round(n * 100)
  })

  function set(next: number) {
    setCents(next)
    onValueChange?.(next / 100)
  }

  const display = (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault()
      const next = cents * 10 + parseInt(e.key)
      set(next > MAX_CENTS ? cents : next)
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault()
      set(Math.floor(cents / 10))
    }
  }

  // Fallback for mobile soft keyboard (onKeyDown may not fire reliably)
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '')
    if (!digits) { set(0); return }
    const n = parseInt(digits.slice(-10), 10)
    set(isNaN(n) ? 0 : Math.min(n, MAX_CENTS))
  }

  return (
    <>
      <input
        type="text"
        id={id}
        inputMode="numeric"
        value={cents === 0 ? '' : display}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="0,00"
        required={required}
        disabled={disabled}
        autoComplete="off"
        className={cn(
          'peer h-10 w-full rounded-lg bg-ink-800 border text-sm text-slate-100 placeholder:text-slate-600 px-3',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'border-ink-500 hover:border-ink-400',
          className
        )}
      />
      <input type="hidden" name={name} value={(cents / 100).toFixed(2)} />
    </>
  )
}
