import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getAdminSession } from '@/lib/admin-auth'
import { adminLogout } from '@/app/actions/admin-auth'
import { LayoutDashboard, Users, LogOut, ChevronLeft } from 'lucide-react'

const NAV = [
  { href: '/admin',       icon: LayoutDashboard, label: 'Visão geral' },
  { href: '/admin/users', icon: Users,            label: 'Usuários'   },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = await getAdminSession()
  if (!isAdmin) redirect('/admin-login')

  return (
    <div className="flex h-screen overflow-hidden bg-ink-950">
      {/* Sidebar */}
      <aside className="w-56 flex flex-col bg-ink-900 border-r border-white/6 shrink-0">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/6">
          <div className="relative h-7 w-24">
            <Image src="/SVG/logo branco.svg" alt="Rook Money" fill className="object-contain object-left" />
          </div>
          <span className="text-[10px] font-bold text-danger bg-danger/15 border border-danger/30 px-1.5 py-0.5 rounded-full leading-none">ADMIN</span>
        </div>

        <nav className="flex-1 py-4 px-2 flex flex-col gap-1">
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-ink-700/60 hover:text-slate-200 transition-colors"
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/6 p-3 flex flex-col gap-1">
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-ink-700 transition-colors">
            <ChevronLeft className="size-3.5" />
            Voltar ao app
          </Link>
          <form action={adminLogout}>
            <button type="submit" className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-600 hover:text-danger hover:bg-danger/10 transition-colors">
              <LogOut className="size-3.5" />
              Sair do backoffice
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-ink-900/50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
