'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

export function HelpfulButtons({ articleId }: { articleId: string }) {
  const [voted, setVoted] = useState<'yes' | 'no' | null>(null)

  function vote(value: 'yes' | 'no') {
    setVoted(value)
  }

  return (
    <div className="mt-10 p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
      {voted ? (
        <p className="text-sm text-slate-600">
          {voted === 'yes' ? 'Que bom que ajudou! 😊' : 'Obrigado pelo feedback. Vamos melhorar este artigo.'}
        </p>
      ) : (
        <>
          <p className="text-sm font-medium text-slate-700 mb-4">Este artigo te ajudou?</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => vote('yes')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition-colors"
            >
              <ThumbsUp className="size-4" /> Sim, ajudou
            </button>
            <button
              onClick={() => vote('no')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <ThumbsDown className="size-4" /> Não ajudou
            </button>
          </div>
        </>
      )}
    </div>
  )
}
