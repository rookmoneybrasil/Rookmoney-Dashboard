'use client'

import { FileDown, Printer } from 'lucide-react'

interface MonthData {
  month:        string
  monthFull:    string
  totalIncome:  number
  totalExpense: number
  balance:      number
  categoryBreakdown: { name: string; total: number; pct: number }[]
}

export function ReportsExport({ data }: { data: MonthData[] }) {
  function exportCSV() {
    const rows = [
      ['Mês', 'Receitas (R$)', 'Despesas (R$)', 'Saldo (R$)'],
      ...data.map((m) => [
        m.monthFull,
        m.totalIncome.toFixed(2).replace('.', ','),
        m.totalExpense.toFixed(2).replace('.', ','),
        m.balance.toFixed(2).replace('.', ','),
      ]),
    ]
    const csv  = rows.map((r) => r.map((c) => `"${c}"`).join(';')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `rook-relatorio-${new Date().toISOString().slice(0, 7)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportPDF() {
    document.body.classList.add('printing')
    window.print()
    setTimeout(() => {
      document.body.classList.remove('printing')
    }, 1000)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={exportCSV}
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-ink-700 hover:bg-ink-600 border border-ink-500 text-slate-300 text-xs font-medium transition-colors"
        title="Exportar CSV"
      >
        <FileDown className="size-3.5" />
        CSV
      </button>
      <button
        onClick={exportPDF}
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-ink-700 hover:bg-ink-600 border border-ink-500 text-slate-300 text-xs font-medium transition-colors print:hidden"
        title="Imprimir / Salvar PDF"
      >
        <Printer className="size-3.5" />
        PDF
      </button>
    </div>
  )
}
