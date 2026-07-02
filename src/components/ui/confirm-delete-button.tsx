'use client'

import { useState } from 'react'
import { X, AlertTriangle, Trash2 } from 'lucide-react'

interface Props {
  action:    () => Promise<void> | void
  label?:    string
  icon?:     'x' | 'trash'
  title?:    string
  className?: string
  children?:  React.ReactNode
}

export function ConfirmDeleteButton({
  action,
  label     = 'Excluir?',
  icon      = 'x',
  title     = 'Excluir',
  className,
  children,
}: Props) {
  const [confirming, setConfirming] = useState(false)
  // Plain state, not useTransition: in React 19, wrapping an *async*
  // action in startTransition keeps isPending true for the whole awaited
  // call (mutation + whatever the caller does after, e.g. a refresh) —
  // this button sat on "..." for the entire round-trip, which read as
  // much slower than it needed to once callers started doing optimistic
  // updates that resolve instantly on their own.
  const [isPending, setIsPending] = useState(false)

  async function handleConfirm() {
    setIsPending(true)
    try {
      await action()
    } finally {
      setIsPending(false)
    }
  }

  const triggerClass = className ?? `size-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-danger hover:bg-danger/10 transition-colors`

  if (confirming) {
    return (
      <div className="flex items-center gap-1 animate-in fade-in duration-150">
        <span className="text-xs text-slate-500 flex items-center gap-1 mr-0.5">
          <AlertTriangle className="size-3 text-warning shrink-0" />
          {label}
        </span>
        <button
          onClick={handleConfirm}
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
      {children ?? (icon === 'trash'
        ? <Trash2 className="size-3.5" />
        : <X className="size-3.5" />)}
    </button>
  )
}
