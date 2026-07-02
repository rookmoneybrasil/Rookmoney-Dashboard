'use client'

import { useState, useEffect, useMemo, useCallback, createContext, useContext } from 'react'
import { Sidebar } from './sidebar'
import { MobileNav } from './mobile-nav'
import { Mascot } from '@/components/mascot/mascot'
import { AchievementToastProvider } from '@/components/achievements/achievement-toast'

interface Props {
  user:     { name: string; email: string; image?: string }
  header:   React.ReactNode
  children: React.ReactNode
  banner?:  React.ReactNode
  badges?:  Record<string, number>
  plan?:    string
  initialTheme?: DashboardTheme
}

export type DashboardTheme = 'light' | 'dark'
const THEME_STORAGE_KEY = 'rook-dashboard-theme'

const DashboardThemeContext = createContext<{ theme: DashboardTheme; toggle: () => void }>({
  theme:  'light',
  toggle: () => {},
})

// Independent from next-themes: this only ever touches the DashboardShell's
// own wrapper div (data-dashboard-theme), never <html> — so login, landing
// and blog keep the dark theme untouched regardless of this preference.
export function useDashboardTheme() {
  return useContext(DashboardThemeContext)
}

export function DashboardShell({ user, header, children, banner, badges, plan, initialTheme = 'light' }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  // Seeded from a cookie read server-side (see (dashboard)/layout.tsx) so the
  // very first paint — including loading.tsx's Suspense fallback — already
  // matches the user's preference. No client-only localStorage read here:
  // that used to run after first paint and caused a dark<->light flicker.
  const [theme, setTheme] = useState<DashboardTheme>(initialTheme)

  // Modals/dropdowns render via Radix portals straight into <body>, outside
  // this div's DOM subtree — mirror the attribute onto <body> too so the
  // [data-dashboard-theme="light"] CSS still reaches portaled content.
  useEffect(() => {
    document.body.setAttribute('data-dashboard-theme', theme)
    return () => { document.body.removeAttribute('data-dashboard-theme') }
  }, [theme])

  const toggle = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem(THEME_STORAGE_KEY, next)
      document.cookie = `${THEME_STORAGE_KEY}=${next}; path=/; max-age=31536000; samesite=lax`
      return next
    })
  }, [])

  // Every consumer of useDashboardTheme() (StatCard, sidebar icons, chart
  // tracks, etc) re-renders whenever this context value's identity changes.
  // Without memoizing it, a plain `{ theme, toggle }` object literal is a
  // *new* reference on every DashboardShell render — including ones with
  // nothing to do with theme, like collapsing the sidebar — so it was
  // re-rendering the whole themed subtree on unrelated state changes.
  const themeContextValue = useMemo(() => ({ theme, toggle }), [theme, toggle])

  return (
    <DashboardThemeContext.Provider value={themeContextValue}>
    <div className="flex h-screen overflow-hidden bg-ink-900" data-dashboard-theme={theme}>
      {/* Sidebar — desktop only */}
      <div className="hidden lg:flex">
        <Sidebar
          user={{ name: user.name, email: user.email, image: user.image }}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          badges={badges}
          plan={plan}
        />
      </div>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {header}
        {banner && <div className="px-4 lg:px-6 pt-3 shrink-0">{banner}</div>}
        {/* pb-20 on mobile to clear the fixed bottom nav */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav badges={badges} />

      {/* Mascot — hidden on small screens */}
      <div className="hidden sm:block">
        <Mascot />
      </div>

      {/* Achievement unlock toasts */}
      <AchievementToastProvider />
    </div>
    </DashboardThemeContext.Provider>
  )
}
