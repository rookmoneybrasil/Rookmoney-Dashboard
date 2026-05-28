import Image from 'next/image'
import { serverApi } from '@/lib/api-client'
import { NotificationBell } from './notification-bell'

export async function Header() {
  const notifications = await serverApi.notifications().catch(() => [])

  return (
    <header className="flex items-center gap-4 h-14 px-4 lg:px-6 border-b border-white/6 bg-ink-800/50 backdrop-blur-sm shrink-0 print:hidden">
      {/* Mobile: brand logo */}
      <div className="lg:hidden relative h-7 shrink-0" style={{ width: 108 }}>
        <Image
          src="/SVG/logo branco.svg"
          alt="Rook Money"
          fill
          className="object-contain object-left"
        />
      </div>

      <div className="flex-1" />

      {/* Notification bell */}
      <NotificationBell notifications={notifications} />
    </header>
  )
}
