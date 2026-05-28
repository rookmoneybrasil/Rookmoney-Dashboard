import { Suspense } from 'react'
import { serverApi } from '@/lib/api-client'
import { ProfileForm } from '@/components/settings/profile-form'
import { PasswordForm } from '@/components/settings/password-form'
import { UpgradeButton, ManageSubscriptionButton } from '@/components/settings/billing-buttons'
import { WhatsAppForm } from '@/components/settings/whatsapp-form'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { isPro, PRO_FEATURES, FREE_LIMITS } from '@/lib/features'
import { Check, Zap, Crown, MessageCircle } from 'lucide-react'
import { UpgradeBanner } from '@/components/settings/upgrade-banner'
import { DeleteAccountButton } from '@/components/settings/delete-account-button'
import { ExportDataButton } from '@/components/settings/export-data-button'

export default async function SettingsPage() {
  const user         = await serverApi.settings()
  const plan         = user.plan ?? 'FREE'
  const whatsappPhone = user.whatsappPhone ?? null
  const pro          = isPro(plan)

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <Suspense>
        <UpgradeBanner />
      </Suspense>

      <div>
        <h1 className="text-xl font-semibold text-slate-100">Configurações</h1>
        <p className="text-sm text-slate-500 mt-0.5">Gerencie sua conta e preferências</p>
      </div>

      {/* ── Plan section ─────────────────────────────────────────────── */}
      <Card variant={pro ? 'elevated' : 'default'}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {pro ? <Crown className="size-4 text-amber-400" /> : <Zap className="size-4 text-brand-400" />}
              Plano
            </CardTitle>
            {pro ? (
              <Badge variant="warning" size="sm">PRO</Badge>
            ) : (
              <Badge variant="outline" size="sm">FREE</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Pricing cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {/* FREE */}
            <div className={`rounded-xl border p-4 flex flex-col gap-2 ${!pro ? 'border-brand-500/50 bg-brand-900/20' : 'border-white/8'}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-200">Free</span>
                <span className="text-xs text-slate-500">R$0</span>
              </div>
              <ul className="flex flex-col gap-1.5 text-xs text-slate-500">
                <li>Até {FREE_LIMITS.categories} categorias</li>
                <li>Até {FREE_LIMITS.goals} metas</li>
                <li>Até {FREE_LIMITS.budgets} orçamentos</li>
                <li>Funcionalidades básicas</li>
              </ul>
              {!pro && (
                <span className="text-xs text-brand-400 font-medium mt-1">Plano atual</span>
              )}
            </div>

            {/* PRO */}
            <div className={`rounded-xl border p-4 flex flex-col gap-2 ${pro ? 'border-amber-500/50 bg-amber-900/10' : 'border-white/8'}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-200">Pro</span>
                <span className="text-xs font-semibold text-amber-400">
                  R$14,90<span className="text-slate-600 font-normal">/mês</span>
                </span>
              </div>
              <ul className="flex flex-col gap-1.5 text-xs text-slate-400">
                {PRO_FEATURES.map((feat) => (
                  <li key={feat} className="flex items-center gap-1.5">
                    <Check className="size-3 text-amber-400 shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>
              {pro && (
                <span className="text-xs text-amber-400 font-medium mt-1">Plano atual</span>
              )}
            </div>
          </div>

          {/* CTA */}
          {pro ? <ManageSubscriptionButton /> : <UpgradeButton />}
        </CardContent>
      </Card>

      {/* ── WhatsApp Bot ─────────────────────────────────────────────── */}
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

      <ProfileForm name={user.name} email={user.email} />

      <PasswordForm />

      {/* Notifications */}
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

      {/* Export data */}
      <Card>
        <CardHeader><CardTitle>Exportar dados</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-300">Backup completo da sua conta</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Exporta todas as transações, contas, metas, pessoas e mais em formato JSON.
              </p>
            </div>
            <ExportDataButton />
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
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
