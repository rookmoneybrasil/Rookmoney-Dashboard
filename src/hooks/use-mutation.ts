'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface UseMutationOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
  refresh?: boolean  // call router.refresh() on success
}

export function useMutation<T = void>(
  fn: (data: T) => Promise<unknown>,
  options: UseMutationOptions = {},
) {
  const [pending, setPending] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const router = useRouter()

  const mutate = useCallback(async (data: T) => {
    setPending(true)
    setError(null)
    try {
      await fn(data)
      if (options.refresh !== false) router.refresh()
      options.onSuccess?.()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(msg)
      options.onError?.(msg)
    } finally {
      setPending(false)
    }
  }, [fn, options, router])

  return { mutate, pending, error, clearError: () => setError(null) }
}
