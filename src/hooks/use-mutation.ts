'use client'

import { useState, useCallback } from 'react'

interface UseMutationOptions {
  onSuccess?: () => void
  onError?: (error: string) => void
  refresh?: boolean  // reload page on success
}

export function useMutation<T = void>(
  fn: (data: T) => Promise<unknown>,
  options: UseMutationOptions = {},
) {
  const [pending, setPending] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const mutate = useCallback(async (data: T) => {
    setPending(true)
    setError(null)
    try {
      await fn(data)
      options.onSuccess?.()
      if (options.refresh !== false) window.location.reload()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(msg)
      options.onError?.(msg)
    } finally {
      setPending(false)
    }
  }, [fn, options])

  return { mutate, pending, error, clearError: () => setError(null) }
}
