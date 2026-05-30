'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { MobileNav } from './mobile-nav'
import { Mascot } from '@/components/mascot/mascot'

interface Props {
  user:     { name: string; email: string }
  header:   React.ReactNode
  children: React.ReactNode
  banner?:  React.ReactNode
  badges?:  Record<string, number>
  plan?:    string
}

export function DashboardShell({ user, header, children, banner, badges, plan }: Props) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-ink-900">
      {/* Sidebar — desktop only */}
      <div className="hidden lg:flex">
        <Sidebar
          user={user}
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
    </div>
  )
}
