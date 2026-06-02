// Root page — handled by next-intl middleware which rewrites to /[locale]/
// This file should never be reached in production, but serves as fallback.
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/pt')
}
