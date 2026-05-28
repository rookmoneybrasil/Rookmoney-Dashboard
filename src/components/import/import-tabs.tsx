'use client'

import { useState } from 'react'

interface Tab {
  id:      string
  label:   string
  icon:    string
  content: React.ReactNode
}

interface Props {
  tabs: Tab[]
}

export function Tabs({ tabs }: Props) {
  const [active, setActive] = useState(tabs[0]?.id ?? '')

  return (
    <div className="flex flex-col gap-5">
      {/* Tab bar */}
      <div className="flex gap-1 bg-ink-800 border border-white/6 rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              active === t.id
                ? 'bg-ink-600 text-slate-100 shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tabs.map(t => (
        <div key={t.id} className={active === t.id ? 'block' : 'hidden'}>
          {t.content}
        </div>
      ))}
    </div>
  )
}
