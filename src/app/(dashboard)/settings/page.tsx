import { Suspense } from 'react'
import { serverApi } from '@/lib/api-client'
import { ProfileForm } from '@/components/settings/profile-form'
import { PasswordForm } from '@/components/settings/password-form'
import { WhatsAppForm } from '@/components/settings/whatsapp-form'
import { NotificationsForm } from '@/components/settings/notifications-form'
import { AppearanceForm } from '@/components/settings/appearance-form'
import { ConnectionsCard } from '@/components/settings/connections-card'
import { PlanUsageCard } from '@/components/settings/plan-usage-card'
import { PrivacyCard } from '@/components/settings/privacy-card'
import { UpgradeBanner } from '@/components/settings/upgrade-banner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  User, Lock, Bell, Palette, BarChart2, MessageCircle,
  Shield,
} from 'lucide-react'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest px-1 pt-2">
      {children}
    </p>
  )
}

export default async function SettingsPage() {
  const [user, me] = await Promise.all([
    serverApi.settings(),
    serverApi.me().catch(() => null),
  ])
  const usage  = me?.usage  ?? null
  const limits = me?.limits ?? null

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      <Suspense><UpgradeBanner /></Suspense>

      <div>
        <h1 className="text-xl font-semibold text-slate-100">Configurações</h1>
        <p className="text-sm text-slate-500 mt-0.5">Gerencie sua conta e preferências</p>
      </div>

      {/* ─── CONTA ──────────────────────────────────────────────────── */}
      <SectionLabel>Conta</SectionLabel>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="size-4 text-brand-400" /> Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            name={user.name}
            email={user.email}
            profileImage={user.profileImage}
            bio={user.bio}
            city={user.city}
            occupation={user.occupation}
            birthdate={user.birthdate}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="size-4 text-slate-400" /> Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <PasswordForm embedded />
          <div className="h-px bg-white/5" />
          <div>
            <p className="text-sm font-medium text-slate-300 mb-4">Conexões</p>
            <ConnectionsCard
              hasGoogle={user.hasGoogle ?? false}
              hasPassword={!user.hasGoogle}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="size-4 text-green-400" /> WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WhatsAppForm currentPhone={user.whatsappPhone ?? null} />
        </CardContent>
      </Card>

      {/* ─── PREFERÊNCIAS ───────────────────────────────────────────── */}
      <SectionLabel>Preferências</SectionLabel>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="size-4 text-amber-400" /> Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationsForm
            notifBillReminder={user.notifBillReminder ?? true}
            notifCategoryLimit={user.notifCategoryLimit ?? true}
            notifMonthlyEmail={user.notifMonthlyEmail ?? false}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="size-4 text-purple-400" /> Aparência e formato
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AppearanceForm
            currency={user.currency ?? 'BRL'}
            dateFormat={user.dateFormat ?? 'dd/MM/yyyy'}
          />
        </CardContent>
      </Card>

      {/* ─── PLANO ──────────────────────────────────────────────────── */}
      <SectionLabel>Plano</SectionLabel>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="size-4 text-brand-400" /> Uso e limites
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usage && limits
            ? <PlanUsageCard plan={user.plan} usage={usage} limits={limits} />
            : <p className="text-sm text-slate-500">Dados de uso não disponíveis.</p>
          }
        </CardContent>
      </Card>

      {/* ─── DADOS & PRIVACIDADE ────────────────────────────────────── */}
      <SectionLabel>Dados e privacidade</SectionLabel>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="size-4 text-slate-400" /> Privacidade e dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usage
            ? <PrivacyCard usage={usage} createdAt={user.createdAt ?? new Date().toISOString()} />
            : null
          }
        </CardContent>
      </Card>
    </div>
  )
}
