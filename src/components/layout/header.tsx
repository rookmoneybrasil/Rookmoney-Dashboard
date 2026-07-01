import Link from 'next/link'
import { serverApi } from '@/lib/api-client'
import { NotificationBell } from './notification-bell'
import { ThemeToggle } from './theme-toggle'
import { BrandLogo } from './brand-logo'
import { Avatar } from '@/components/ui/avatar'
import { Settings, Crown, Sparkles } from 'lucide-react'
import { LogoutButton } from './logout-button'
import { isPro, isProPlus } from '@/lib/plans'
import { getNotifications } from '@/app/actions/notifications'

export async function Header() {
  const [notifData, user] = await Promise.all([
    getNotifications().catch(() => ({ notifications: [], newCount: 0 })),
    serverApi.me().catch(() => null),
  ])
  const notifications = notifData.notifications
  const newCount = notifData.newCount

  const userIsPro = isPro(user?.plan)
  const userIsProPlus = isProPlus(user?.plan)

  return (
    <header className="relative z-40 flex items-center gap-3 h-14 px-4 lg:px-6 border-b border-white/6 bg-ink-800/50 backdrop-blur-sm shrink-0 print:hidden">
      {/* Mobile: brand logo */}
      <div className="lg:hidden relative h-7 shrink-0" style={{ width: 108 }}>
        <BrandLogo />
      </div>

      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notification bell */}
        <NotificationBell notifications={notifications} newCount={newCount} />

        {/* PRO upgrade — only for Free users */}
        {user && !userIsPro && (
          <Link href="/billing"
            className="hidden sm:flex items-center gap-1.5 bg-amber-400/10 hover:bg-amber-400/15 border border-amber-400/25 text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
            <Crown className="size-3.5 fill-amber-400/30" />
            Assinar PRO
            <span className="text-amber-500/70 font-normal">R$19,90</span>
          </Link>
        )}

        {/* Settings */}
        <Link href="/settings"
          className="size-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-ink-700 transition-colors"
          title="Configurações">
          <Settings className="size-4" />
        </Link>

        {/* User avatar + logout */}
        {user && (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-xs font-medium text-slate-300">{user.name.split(' ')[0]}</span>
              <span className="text-[10px] text-slate-600 truncate max-w-[120px]">{user.email}</span>
            </div>
            {userIsPro ? (
              <Link href="/billing" title={userIsProPlus ? 'Gerenciar plano PRO+' : 'Gerenciar plano PRO'} className="relative shrink-0">
                <Avatar src={user.profileImage ?? undefined} name={user.name} size="sm" />
                <div className={`absolute -bottom-1 -right-1 size-4 rounded-full border-2 border-ink-800 flex items-center justify-center ${userIsProPlus ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-amber-400'}`}>
                  {userIsProPlus
                    ? <Sparkles className="size-2.5 text-slate-900" />
                    : <Crown className="size-2.5 text-slate-900 fill-slate-900" />}
                </div>
              </Link>
            ) : (
              <div className="relative shrink-0">
                <Avatar src={user.profileImage ?? undefined} name={user.name} size="sm" />
              </div>
            )}
            <LogoutButton />
          </div>
        )}
      </div>
    </header>
  )
}
