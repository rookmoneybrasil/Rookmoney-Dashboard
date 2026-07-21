'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, AlertTriangle, Archive, ArchiveRestore } from 'lucide-react'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input, FormField } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import { clientApi, type Account, type AccountType } from '@/lib/api-client'
import { formatCurrency } from '@/lib/utils'

const TYPES: { value: AccountType; label: string; icon: string }[] = [
  { value: 'CASH',        label: 'Carteira',       icon: '👛' },
  { value: 'CHECKING',    label: 'Conta corrente', icon: '🏦' },
  { value: 'SAVINGS',     label: 'Poupança',       icon: '🐷' },
  { value: 'CREDIT_CARD', label: 'Cartão',         icon: '💳' },
]
const typeLabel = (t: AccountType) => TYPES.find(x => x.value === t)?.label ?? 'Conta'
const EMOJIS = ['👛', '🏦', '🐷', '💳', '💰', '💵', '🪙', '🧾', '🏧', '📇']
const SWATCHES = ['#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444', '#14B8A6', '#F97316']

export function WalletsList({ accounts, total }: { accounts: Account[]; total: number }) {
  const router = useRouter()
  const [editing, setEditing] = useState<Account | 'new' | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const active   = accounts.filter(a => !a.archived)
  const archived = accounts.filter(a => a.archived)

  // Arquivar tira a conta da lista, do seletor e do saldo total, mas mantem o
  // historico. Serve pra conta antiga que voce nao usa mais e nao quer excluir
  // (excluir move os lancamentos pra outra conta; arquivar preserva onde estao).
  async function setArchived(id: string, value: boolean) {
    if (busyId) return
    setBusyId(id)
    try {
      await clientApi.updateWallet(id, { archived: value })
      router.refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao arquivar a conta.')
    } finally {
      setBusyId(null)
    }
  }

  async function del(id: string) {
    try {
      await clientApi.deleteWallet(id)
      router.refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir a conta.')
    }
    setConfirmingId(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl bg-ink-700 border border-white/6 p-5">
        <p className="text-xs text-slate-500">Saldo total</p>
        <p className={`text-3xl font-extrabold mt-1 ${total < 0 ? 'text-danger' : 'text-slate-100'}`}>{formatCurrency(total)}</p>
        <p className="text-xs text-slate-600 mt-1">{active.length} conta{active.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {active.map(a => (
          <div key={a.id} className="flex items-center gap-3 rounded-xl bg-ink-700 border border-white/6 p-4 group">
            <div className="size-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: a.color + '22' }}>
              {a.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-200 truncate">{a.name}</span>
                {a.isDefault && <span className="text-[10px] bg-brand-900/60 text-brand-300 border border-brand-700/40 px-1.5 py-0.5 rounded-full font-medium">Padrão</span>}
              </div>
              <span className="text-xs text-slate-500">{typeLabel(a.type)}</span>
            </div>
            <span className={`text-sm font-bold tabular-nums ${a.balance < 0 ? 'text-danger' : 'text-slate-100'}`}>{formatCurrency(a.balance)}</span>
            <div className="flex items-center gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditing(a)} className="size-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-brand-400 hover:bg-brand-400/10" title="Editar">
                <Pencil className="size-3.5" />
              </button>
              <button onClick={() => setArchived(a.id, true)} disabled={busyId === a.id} className="size-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/5 disabled:opacity-40" title="Arquivar (mantém o histórico, some do saldo)">
                <Archive className="size-3.5" />
              </button>
              {confirmingId === a.id ? (
                <span className="flex items-center gap-1">
                  <AlertTriangle className="size-3 text-warning shrink-0" />
                  <span className="hidden sm:inline text-xs text-slate-500 whitespace-nowrap">Saldo e lançamentos vão pra outra conta.</span>
                  <button onClick={() => del(a.id)} className="text-xs text-danger px-1.5 py-1 rounded hover:bg-danger/10">Excluir</button>
                  <button onClick={() => setConfirmingId(null)} className="text-xs text-slate-500 px-1.5 py-1 rounded hover:bg-ink-600">Cancelar</button>
                </span>
              ) : (
                <button onClick={() => setConfirmingId(a.id)} className="size-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-danger hover:bg-danger/10" title="Excluir">
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}

        <button onClick={() => setEditing('new')} className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 p-4 text-sm text-slate-500 hover:text-slate-300 hover:border-white/20 transition-colors">
          <Plus className="size-4" /> Nova carteira
        </button>
      </div>

      {archived.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-slate-600 uppercase tracking-wider">Arquivadas — fora do saldo total</p>
          {archived.map(a => (
            <div key={a.id} className="flex items-center gap-3 rounded-xl bg-ink-800/60 border border-white/6 p-3 opacity-70 hover:opacity-100 transition-opacity group">
              <div className="size-8 rounded-lg flex items-center justify-center text-base shrink-0" style={{ backgroundColor: a.color + '18' }}>
                {a.icon}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-slate-300 truncate">{a.name}</span>
                <span className="block text-xs text-slate-600">{typeLabel(a.type)}</span>
              </div>
              <span className="text-sm tabular-nums text-slate-500">{formatCurrency(a.balance)}</span>
              <button onClick={() => setArchived(a.id, false)} disabled={busyId === a.id} className="flex items-center gap-1.5 h-7 px-2 rounded-lg text-xs text-slate-400 hover:text-brand-300 hover:bg-brand-400/10 disabled:opacity-40 shrink-0" title="Reativar">
                <ArchiveRestore className="size-3.5" /> Reativar
              </button>
            </div>
          ))}
        </div>
      )}

      {editing && <AccountModal account={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

function AccountModal({ account, onClose }: { account: Account | null; onClose: () => void }) {
  const router = useRouter()
  const [name, setName]       = useState(account?.name ?? '')
  const [type, setType]       = useState<AccountType>(account?.type ?? 'CASH')
  const [icon, setIcon]       = useState(account?.icon ?? '👛')
  const [color, setColor]     = useState(account?.color ?? '#22C55E')
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name2 = (fd.get('name') as string).trim()
    if (!name2) return
    const body = { name: name2, type, icon, color, initialBalance: parseFloat((fd.get('initialBalance') as string) || '0') }
    setPending(true)
    try {
      if (account) await clientApi.updateWallet(account.id, body)
      else         await clientApi.createWallet(body)
      router.refresh()
      onClose()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar.')
      setPending(false)
    }
  }

  return (
    <Modal open onOpenChange={(o) => { if (!o) onClose() }}>
      <ModalContent size="sm">
        <ModalHeader><ModalTitle>{account ? 'Editar carteira' : 'Nova carteira'}</ModalTitle></ModalHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField label="Nome" htmlFor="name" required>
            <Input id="name" name="name" defaultValue={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Carteira, Nubank, Itaú…" required />
          </FormField>

          <FormField label="Tipo" htmlFor="type">
            <div className="flex flex-wrap gap-2">
              {TYPES.map(t => (
                <button type="button" key={t.value} onClick={() => { setType(t.value); setIcon(t.icon) }}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${type === t.value ? 'bg-brand-900/40 border-brand-600 text-brand-300' : 'bg-ink-700 border-white/8 text-slate-400 hover:text-slate-200'}`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </FormField>

          <FormField label="Saldo inicial" htmlFor="initialBalance">
            <CurrencyInput id="initialBalance" name="initialBalance" defaultValue={account?.initialBalance ?? 0} />
          </FormField>

          <FormField label="Ícone" htmlFor="icon">
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(e => (
                <button type="button" key={e} onClick={() => setIcon(e)}
                  className={`size-9 rounded-lg text-lg flex items-center justify-center border transition-colors ${icon === e ? 'border-brand-600 bg-brand-900/40' : 'border-white/8 bg-ink-700 hover:border-white/20'}`}>
                  {e}
                </button>
              ))}
            </div>
          </FormField>

          <FormField label="Cor" htmlFor="color">
            <div className="flex flex-wrap gap-2">
              {SWATCHES.map(c => (
                <button type="button" key={c} onClick={() => setColor(c)}
                  className={`size-8 rounded-full flex items-center justify-center ${color === c ? 'ring-2 ring-white/60' : ''}`} style={{ backgroundColor: c }}>
                  {color === c && <span className="text-white text-xs">✓</span>}
                </button>
              ))}
            </div>
          </FormField>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" loading={pending}>Salvar</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
