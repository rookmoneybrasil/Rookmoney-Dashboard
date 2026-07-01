'use client'

import Image from 'next/image'
import { useDashboardTheme } from './dashboard-shell'

interface BrandLogoProps {
  className?: string
}

export function BrandLogo({ className }: BrandLogoProps) {
  const { theme } = useDashboardTheme()
  const src = theme === 'light' ? '/SVG/logo escuro.svg' : '/SVG/logo branco.svg'

  return <Image src={src} alt="Rook Money" fill className={className ?? 'object-contain object-left'} />
}
