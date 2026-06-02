// Locale layout — pure passthrough.
// html/body/CSS/providers are in the root app/layout.tsx.
// This layout exists only so [locale]/page.tsx can be imported by app/page.tsx.
export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
