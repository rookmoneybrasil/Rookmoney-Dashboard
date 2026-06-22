'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export function UtmCapture() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const source   = searchParams.get('utm_source')
    const medium   = searchParams.get('utm_medium')
    const campaign = searchParams.get('utm_campaign')
    if (source || medium || campaign) {
      sessionStorage.setItem('rook_utm', JSON.stringify({
        ...(source   && { utmSource: source }),
        ...(medium   && { utmMedium: medium }),
        ...(campaign && { utmCampaign: campaign }),
      }))
    }
  }, [searchParams])

  return null
}
