import type { ReactNode } from 'react'

// Root layout: minimal passthrough — html/body/CSS are provided by app/[locale]/layout.tsx
// This pattern is required for next-intl [locale] routing to work correctly.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children as never
}
