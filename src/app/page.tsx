import { redirect } from 'next/navigation'

// With localePrefix: 'always', all locales have a prefix.
// Root / redirects to default locale /pt
export default function RootPage() {
  redirect('/pt')
}
