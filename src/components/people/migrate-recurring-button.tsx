'use client'

import { useEffect } from 'react'
import { clientApi } from '@/lib/api-client'

// Runs silently on mount — migrates old 120-installment recurring groups automatically
export function MigrateRecurringButton() {
  useEffect(() => {
    clientApi.migratePersonRecurring()
      .then(result => {
        if (result.converted > 0) {
          window.location.reload()
        }
      })
      .catch(() => {}) // silent fail
  }, [])

  return null
}
