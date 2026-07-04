'use client'

import { useState } from 'react'
import { CategorySelect } from '@/components/ui/category-select'
import { Plus, ChevronDown, ChevronUp } from 'lucide-react'
import {
  Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter,
} from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input, FormField, Textarea } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import { DateInput } from '@/components/ui/date-input'
import { triggerMascot } from '@/lib/mascot'
import { formatCurrency } from '@/lib/utils'
import { getServiceBrand, QUICK_BILL_SERVICES } from '@/lib/service-brands'
import { clientApi } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'
import { useTranslations } from 'next-intl'

interface Category { id: string; name: string; icon: string; color: string }
interface Props { categories: Category[] }

type Mode = 'avulso' | 'parcelado' | 'recorrente'

export function BillModal({ categories }: Props) {
  const t = useTranslations('bills')
  const c = useTranslations('common')
  const [open,         setOpen]       = useState(false)
  const [mode,         setMode]       = useState<Mode>('avulso')
  const [categoryId,   setCatId]      = useState('')
  const [installments, setInst]       = useState(2)
  const [alreadyPaid,  setAlready]    = useState(0)
  const [amountNum,    setAmountNum]  = useState(0)
  const [name,         setName]       = useState('')
  const [showServices, setShowSvc]    = useState(false)

  const detectedBrand = getServiceBrand(name, undefined)

  function reset() {
    setOpen(false); setMode('avulso'); setCatId('')
    setInst(2); setAlready(0); setAmountNum(0); setName(''); setShowSvc(false)
  }

  const { mutate, pending, error } = useMutation(
    (data: { name: string; amount: string; dueDate: string; categoryId: string; installments?: number; alreadyPaid?: number; notes: string }) =>
      clientApi.createBill({
        name: data.name,
        amount: parseFloat(data.amount),
        dueDate: data.dueDate,
        isRecurring: false,
        categoryId: data.categoryId || undefined,
        installments: data.installments,
        alreadyPaid:  data.alreadyPaid,
        notes: data.notes || undefined,
      }),
    { onSuccess: () => { reset(); triggerMascot('determined', 'Conta registrada! 📅') } },
  )

  const { mutate: mutateRecurring, pending: pendingRecurring, error: errorRecurring } = useMutation(
    (data: { name: string; amount: string; dayOfMonth: string; categoryId: string; notes: string; firstDate: string }) =>
      clientApi.createRecurringBill({
        name:       data.name,
        amount:     parseFloat(data.amount),
        dayOfMonth: parseInt(data.dayOfMonth) || 1,
        categoryId: data.categoryId || null,
        notes:      data.notes || null,
        firstDate:  data.firstDate || undefined, // month drives startMonth; if this month & past, gera já
      }),
    { onSuccess: () => { reset(); triggerMascot('determined', 'Conta fixa cadastrada! Vou gerar automaticamente todo mês. 🔁') } },
  )

  const isBusy = pending || pendingRecurring
  const anyError = error || errorRecurring

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)

    if (mode === 'recorrente') {
      mutateRecurring({
        name:       name,
        amount:     fd.get('amount') as string,
        dayOfMonth: fd.get('dayOfMonth') as string,
        categoryId,
        notes:      fd.get('notes') as string,
        firstDate:  fd.get('firstDate') as string,
      })
      return
    }

    const remaining = installments - alreadyPaid
    mutate({
      name,
      amount: mode === 'parcelado'
        ? String(amountNum * remaining)        // total amount for remaining installments
        : (fd.get('amount') as string),
      dueDate: fd.get('dueDate') as string,
      categoryId,
      installments: mode === 'parcelado' ? installments : undefined,  // full total
      alreadyPaid:  mode === 'parcelado' ? alreadyPaid  : undefined,  // offset for numbering
      notes: fd.get('notes') as string,
    })
  }

  const remaining   = installments - alreadyPaid
  const submitLabel = mode === 'parcelado'
    ? t('createInstallments', { count: remaining })
    : mode === 'recorrente' ? t('saveFixed') : c('add')

  const dateLabel   = mode === 'parcelado' ? t('nextDue') : t('firstDue')
  const amountLabel = mode === 'parcelado' ? t('perInstallmentLabel') : t('amountLabel')

  return (
    <Modal open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors shrink-0"
      >
        <Plus className="size-3.5" />
        {t('new')}
      </button>

      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>{t('newTitle')}</ModalTitle>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {anyError && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">{anyError}</p>
          )}

          {/* Mode selector */}
          <div className="flex gap-2">
            {([
              { key: 'avulso',     label: t('mode.single'),      icon: '💸' },
              { key: 'parcelado',  label: t('mode.installment'), icon: '📅' },
              { key: 'recorrente', label: t('mode.recurring'),   icon: '🔁' },
            ] as { key: Mode; label: string; icon: string }[]).map((m) => (
              <button key={m.key} type="button" onClick={() => setMode(m.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-medium transition-all ${
                  mode === m.key
                    ? 'bg-brand-800/60 border-brand-600/50 text-brand-300'
                    : 'bg-ink-800 border-ink-600 text-slate-500 hover:border-ink-500'
                }`}>
                <span>{m.icon}</span>{m.label}
              </button>
            ))}
          </div>

          {/* Name field */}
          <FormField label={t('billName')} htmlFor="name" required>
            <div className="flex flex-col gap-2">
              {/* Dropdown de serviços */}
              <button
                type="button"
                onClick={() => setShowSvc(!showServices)}
                className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-ink-700 border border-ink-600 hover:border-ink-500 text-xs text-slate-400 transition-colors"
              >
                <span>{name ? t('serviceName', { name }) : t('selectService')}</span>
                {showServices ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
              </button>

              {showServices && (
                <div className="flex flex-wrap gap-1.5 p-2 bg-ink-800/60 border border-ink-600 rounded-xl max-h-32 overflow-y-auto">
                  {QUICK_BILL_SERVICES.map(({ key, label, brand }) => {
                    const active = name.toLowerCase() === label.toLowerCase()
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => { setName(active ? '' : label); setShowSvc(false) }}
                        className="flex items-center gap-1.5 h-7 px-2 rounded-lg text-xs font-medium transition-all border shrink-0"
                        style={
                          active
                            ? { backgroundColor: brand.color, color: brand.text, borderColor: brand.color }
                            : { backgroundColor: brand.color + '18', color: brand.color, borderColor: brand.color + '40' }
                        }
                      >
                        <span className="size-4 rounded flex items-center justify-center text-[9px] font-bold shrink-0"
                          style={{ backgroundColor: brand.color, color: brand.text }}>
                          {brand.short}
                        </span>
                        {label}
                      </button>
                    )
                  })}
                </div>
              )}

              <div className="relative">
                <Input id="name" name="name" type="text"
                  placeholder={t('typeName')}
                  value={name} onChange={(e) => setName(e.target.value)} required />
                {detectedBrand && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                    <div className="size-5 rounded-md flex items-center justify-center text-[10px] font-bold"
                      style={{ backgroundColor: detectedBrand.color, color: detectedBrand.text }}>
                      {detectedBrand.short}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label={amountLabel} htmlFor="amount" required>
              <CurrencyInput id="amount" name="amount" required onValueChange={setAmountNum} />
            </FormField>
            {mode === 'recorrente' ? (
              <FormField label={t('everyDay')} htmlFor="dayOfMonth" required>
                <Input id="dayOfMonth" name="dayOfMonth" type="number" min={1} max={31}
                  defaultValue={1} placeholder="1-31" required />
              </FormField>
            ) : (
              <FormField label={dateLabel} htmlFor="dueDate" required>
                <DateInput id="dueDate" name="dueDate" defaultValue={new Date().toISOString().split('T')[0]} required />
              </FormField>
            )}
          </div>
          {mode === 'recorrente' && (
            <FormField label="1ª data (quando começa)" htmlFor="firstDate" required>
              <DateInput id="firstDate" name="firstDate" defaultValue={new Date().toISOString().split('T')[0]} required />
            </FormField>
          )}
          {mode === 'recorrente' && (
            <p className="text-xs text-slate-600 -mt-2 px-1">
              {t('autoGenerate')}
            </p>
          )}

          {/* Parcelado options */}
          {mode === 'parcelado' && (
            <div className="flex flex-col gap-3 p-3 rounded-lg bg-ink-800/60 border border-ink-600">
              <div className="grid grid-cols-2 gap-3">
                <FormField label={t('totalInstallments')} htmlFor="installments">
                  <div className="flex items-center gap-2">
                    <input type="number" min={2} max={120} value={installments}
                      onChange={(e) => { const v = Number(e.target.value); setInst(v); if (alreadyPaid >= v) setAlready(v - 1) }}
                      className="w-full bg-ink-700 border border-white/8 rounded-lg px-3 py-2 text-sm text-slate-200 text-center focus:outline-none focus:border-brand-500/50" />
                    <span className="text-xs text-slate-500 shrink-0">{t('installmentsOf')}</span>
                  </div>
                </FormField>
                <FormField label={t('alreadyPaid')} htmlFor="alreadyPaid">
                  <div className="flex items-center gap-2">
                    <input type="number" min={0} max={installments - 1} value={alreadyPaid}
                      onChange={(e) => setAlready(Math.min(Number(e.target.value), installments - 1))}
                      className="w-full bg-ink-700 border border-white/8 rounded-lg px-3 py-2 text-sm text-slate-200 text-center focus:outline-none focus:border-brand-500/50" />
                    <span className="text-xs text-slate-500 shrink-0">{t('paidOf')}</span>
                  </div>
                </FormField>
              </div>
              {amountNum > 0 && (
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-slate-400">
                    <span className="font-medium text-slate-200">{t('remainingInstallments', { count: installments - alreadyPaid })}</span>
                    {' '}× {formatCurrency(amountNum)} = <span className="font-medium text-brand-300">{formatCurrency(amountNum * (installments - alreadyPaid))}</span>
                  </p>
                  {alreadyPaid > 0 && (
                    <p className="text-[11px] text-slate-600">{alreadyPaid} parcela{alreadyPaid > 1 ? 's' : ''} já paga{alreadyPaid > 1 ? 's' : ''} não serão cadastradas</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Recorrente info */}
          {mode === 'recorrente' && (
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-brand-900/30 border border-brand-700/40">
              <p className="text-sm text-brand-300 font-medium">{t('recurringInfo')}</p>
              {amountNum > 0 && (
                <p className="text-xs text-slate-400">{formatCurrency(amountNum)}{t('recurringNote')}</p>
              )}
            </div>
          )}

          <FormField label={c('category')} htmlFor="categoryId">
            <CategorySelect categories={categories} value={categoryId} onChange={setCatId} placeholder={c('optional')} />
          </FormField>

          <FormField label={c('notes')} htmlFor="notes">
            <Textarea id="notes" name="notes" placeholder={c('optional')} className="min-h-[56px]" />
          </FormField>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={reset}>{c('cancel')}</Button>
            <Button type="submit" loading={isBusy} disabled={!name.trim()}>{submitLabel}</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
