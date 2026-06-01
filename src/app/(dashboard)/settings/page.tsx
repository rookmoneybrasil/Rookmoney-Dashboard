import { Suspense } from 'react'
import { serverApi } from '@/lib/api-client'
import { ProfileForm } from '@/components/settings/profile-form'
import { PasswordForm } from '@/components/settings/password-form'
import { WhatsAppForm } from '@/components/settings/whatsapp-form'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Crown, Zap, ArrowRight, MessageCircle } from 'lucide-react'
import { UpgradeBanner } from '@/components/settings/upgrade-banner'
import { DeleteAccountButton } from '@/components/settings/delete-account-button'
import { ExportDataButton } from '@/components/settings/export-data-button'
import { FeedbackForm } from '@/components/settings/feedback-form'
import Link from 'next/link'

export default async function SettingsPage() {
  const user          = await serverApi.settings()
  const isPro         = user.plan === 'PRO'
  const whatsappPhone = user.whatsappPhone ?? null

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <Suspense>
        <UpgradeBanner />
      </Suspense>

      <div>
        <h1 className="text-xl font-semibold text-slate-100">Configurações</h1>
        <p className="text-sm text-slate-500 mt-0.5">Gerencie sua conta e preferências</p>
      </div>

      {/* ── Plan widget compacto ─────────────────────────────────────── */}
      <Link href="/billing" className="group block">
        <div className={`rounded-2xl border p-4 flex items-center gap-4 transition-colors ${
          isPro
            ? 'bg-amber-400/5 border-amber-400/20 hover:border-amber-400/35'
            : 'bg-ink-800 border-white/6 hover:border-white/12'
        }`}>
          <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
            isPro ? 'bg-amber-400/15' : 'bg-ink-700'
          }`}>
            {isPro
              ? <Crown className="size-5 text-amber-400 fill-amber-400/30" />
              : <Zap className="size-5 text-brand-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200">
              Plano {isPro ? 'PRO' : 'Gratuito'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {isPro
                ? 'Acesso completo a todos os recursos'
                : 'Upgrade para desbloquear todos os recursos'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!isPro && (
              <span className="text-xs font-semibold bg-amber-400/15 text-amber-400 border border-amber-400/25 px-2 py-0.5 rounded-full">
                Upgrade
              </span>
            )}
            <ArrowRight className="size-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
          </div>
        </div>
      </Link>

      {/* ── WhatsApp ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="size-4 text-green-400" />
            WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WhatsAppForm currentPhone={whatsappPhone} />
        </CardContent>
      </Card>

      <ProfileForm
        name={user.name}
        email={user.email}
        profileImage={user.profileImage}
        bio={user.bio}
        city={user.city}
        occupation={user.occupation}
        birthdate={user.birthdate}
      />

      <PasswordForm />

      {/* Notificações */}
      <Card>
        <CardHeader><CardTitle>Notificações</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col divide-y divide-white/5">
            {[
              { label: 'Lembrete de contas',      sub: 'Aviso 3 dias antes do vencimento' },
              { label: 'Limite de categoria',      sub: 'Quando atingir 80% do orçamento'  },
              { label: 'Resumo mensal por e-mail', sub: 'Resumo financeiro todo dia 1'      },
            ].map(({ label, sub }) => (
              <div key={label} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm text-slate-300">{label}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{sub}</p>
                </div>
                <Switch defaultChecked />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Exportar dados */}
      <Card>
        <CardHeader><CardTitle>Exportar dados</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-300">Backup completo da sua conta</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Exporta transações, contas, metas e mais em formato JSON.
              </p>
            </div>
            <ExportDataButton />
          </div>
        </CardContent>
      </Card>

      {/* Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="size-4 text-brand-400" />
            Bugs e sugestões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FeedbackForm />
        </CardContent>
      </Card>

      {/* Zona de risco */}
      <Card variant="outline" className="border-danger/30">
        <CardHeader><CardTitle className="text-danger">Zona de risco</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-300">Excluir conta</p>
              <p className="text-xs text-slate-500 mt-0.5">Todos os dados serão removidos permanentemente.</p>
            </div>
            <DeleteAccountButton />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
