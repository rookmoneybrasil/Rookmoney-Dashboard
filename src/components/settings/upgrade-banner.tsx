'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Sparkles, X } from 'lucide-react'

export function UpgradeBanner() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const pathname     = usePathname()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (searchParams.get('upgraded') === '1') {
      setVisible(true)

      const timer = setTimeout(() => {
        dismiss()
      }, 5000)

      return () => clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  function dismiss() {
    setVisible(false)
    // Remove the ?upgraded=1 query param from the URL
    const params = new URLSearchParams(searchParams.toString())
    params.delete('upgraded')
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  if (!visible) return null

  return (
    <div className="flex items-center gap-3 rounded-xl px-4 py-3 bg-success/10 border border-success/20 text-success">
      <Sparkles className="size-4 shrink-0" />
      <span className="flex-1 text-sm font-medium">
        🎉 Bem-vindo ao Rook PRO! Aproveite todos os recursos.
      </span>
      <button
        onClick={dismiss}
        className="text-success/60 hover:text-success transition-colors shrink-0"
        aria-label="Fechar"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
