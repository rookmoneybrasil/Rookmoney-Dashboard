'use client'

import { useState, useTransition } from 'react'
import { X, AlertTriangle, Trash2 } from 'lucide-react'

interface Props {
  action:    () => Promise<void> | void
  label?:    string
  icon?:     'x' | 'trash'
  title?:    string
  className?: string
}

export function ConfirmDeleteButton({
  action,
  label     = 'Excluir?',
  icon      = 'x',
  title     = 'Excluir',
  className,
}: Props) {
  const [confirming, setConfirming]   = useState(false)
  const [isPending, startTransition]  = useTransition()

  const triggerClass = className ?? `sm:opacity-0 sm:group-hover:opacity-100 transition-opacity size-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-danger hover:bg-danger/10`

  if (confirming) {
    return (
      <div className="flex items-center gap-1 animate-in fade-in duration-150">
        <span className="text-xs text-slate-500 flex items-center gap-1 mr-0.5">
          <AlertTriangle className="size-3 text-warning shrink-0" />
          {label}
        </span>
        <button
          onClick={() => startTransition(() => action())}
          disabled={isPending}
          className="h-6 px-2 rounded text-xs font-medium bg-danger/15 text-danger hover:bg-danger/25 transition-colors border border-danger/20 disabled:opacity-50"
        >
          {isPending ? '...' : 'Sim'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="h-6 px-2 rounded text-xs font-medium bg-ink-600 text-slate-400 hover:text-slate-200 transition-colors"
        >
          Não
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className={triggerClass}
      title={title}
    >
      {icon === 'trash'
        ? <Trash2 className="size-3.5" />
        : <X className="size-3.5" />}
    </button>
  )
}
