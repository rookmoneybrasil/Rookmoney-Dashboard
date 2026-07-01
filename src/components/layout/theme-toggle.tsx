'use client'

import { Sun, Moon } from 'lucide-react'
import { useDashboardTheme } from './dashboard-shell'

export function ThemeToggle() {
  const { theme, toggle } = useDashboardTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      title={isDark ? 'Modo claro' : 'Modo escuro'}
      aria-label={isDark ? 'Modo claro' : 'Modo escuro'}
      className="size-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-ink-700 transition-colors"
    >
      {isDark
        ? <Sun  className="size-4" />
        : <Moon className="size-4" />}
    </button>
  )
}
