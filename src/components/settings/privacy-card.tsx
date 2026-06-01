import { Shield, FileText, Trash2 } from 'lucide-react'
import { ExportDataButton } from './export-data-button'
import { DeleteAccountButton } from './delete-account-button'
import type { UserUsage } from '@/lib/api-client'

interface Props { usage: UserUsage; createdAt: string }

export function PrivacyCard({ usage, createdAt }: Props) {
  const since = new Date(createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const totalRecords =
    usage.transactionsThisMonth + usage.bills + usage.goals + usage.people

  return (
    <div className="flex flex-col gap-5">
      {/* LGPD notice */}
      <div className="flex gap-3 p-4 rounded-xl bg-brand-900/40 border border-brand-700/30">
        <Shield className="size-5 text-brand-400 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-slate-300">Seus dados, seu controle</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Em conformidade com a <strong className="text-slate-400">LGPD</strong>. Armazenamos apenas dados que você fornece.
            Nunca vendemos informações a terceiros. Você pode exportar ou excluir tudo a qualquer momento.
          </p>
        </div>
      </div>

      {/* Data summary */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">O que está armazenado</p>
        <div className="bg-ink-700/40 rounded-xl border border-white/5 divide-y divide-white/5">
          {[
            { label: 'Conta criada em',    value: since },
            { label: 'Transações (mês)',    value: usage.transactionsThisMonth.toLocaleString('pt-BR') },
            { label: 'Contas a pagar',      value: usage.bills.toLocaleString('pt-BR') },
            { label: 'Metas ativas',        value: usage.goals.toLocaleString('pt-BR') },
            { label: 'Pessoas cadastradas', value: usage.people.toLocaleString('pt-BR') },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-4 py-3">
              <span className="text-xs text-slate-500">{label}</span>
              <span className="text-xs font-medium text-slate-300">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText className="size-4 text-slate-500 shrink-0" />
            <div>
              <p className="text-sm text-slate-300">Exportar todos os dados</p>
              <p className="text-xs text-slate-600">Backup completo em JSON</p>
            </div>
          </div>
          <ExportDataButton />
        </div>

        <div className="h-px bg-white/5" />

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Trash2 className="size-4 text-danger shrink-0" />
            <div>
              <p className="text-sm text-danger">Excluir minha conta</p>
              <p className="text-xs text-slate-600">Remove permanentemente todos os {totalRecords > 0 ? `${totalRecords}+ ` : ''}registros</p>
            </div>
          </div>
          <DeleteAccountButton />
        </div>
      </div>
    </div>
  )
}
