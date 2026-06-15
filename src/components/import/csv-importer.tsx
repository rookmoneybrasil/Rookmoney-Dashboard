'use client'

import * as React from 'react'
import { Upload, FileText, X, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react'
import { importTransactions } from '@/app/actions/import'

type Category = {
  id: string
  name: string
  color: string
  icon: string
}

interface CSVImporterProps {
  categories: Category[]
}

type ParsedRow = {
  [key: string]: string
}

type MappedRow = {
  date: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  categoryId: string
  _raw: ParsedRow
  _index: number
  _error?: string
}

const COLUMN_FIELDS = ['date', 'description', 'amount', 'type'] as const
type ColumnField = (typeof COLUMN_FIELDS)[number]

const FIELD_LABELS: Record<ColumnField, string> = {
  date: 'Data',
  description: 'Descrição',
  amount: 'Valor',
  type: 'Tipo',
}

// Attempt to detect which CSV column maps to which field
function autoDetect(headers: string[]): Record<ColumnField, string> {
  const lower = headers.map((h) => h.toLowerCase().trim())

  const find = (...candidates: string[]) => {
    for (const c of candidates) {
      const i = lower.findIndex((h) => h.includes(c))
      if (i !== -1) return headers[i]
    }
    return ''
  }

  return {
    date: find('data', 'date', 'dt', 'vencimento'),
    description: find('descri', 'desc', 'memo', 'hist', 'narr', 'name'),
    amount: find('valor', 'amount', 'value', 'quantia', 'total'),
    type: find('tipo', 'type', 'natureza', 'categ'),
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if ((char === ',' || char === ';') && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

function parseCSV(text: string): { headers: string[]; rows: ParsedRow[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length < 2) return { headers: [], rows: [] }

  const headers = parseCSVLine(lines[0]).map((h) => h.replace(/^["']|["']$/g, '').trim())
  const rows: ParsedRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCSVLine(lines[i])
    const row: ParsedRow = {}
    headers.forEach((h, idx) => {
      row[h] = (cells[idx] ?? '').replace(/^["']|["']$/g, '').trim()
    })
    rows.push(row)
  }

  return { headers, rows }
}

function inferType(raw: string): 'INCOME' | 'EXPENSE' {
  const lower = raw.toLowerCase().trim()
  if (
    lower === 'receita' ||
    lower === 'income' ||
    lower === 'entrada' ||
    lower === '+' ||
    lower === 'credit' ||
    lower === 'crédito'
  ) {
    return 'INCOME'
  }
  return 'EXPENSE'
}

function parseDate(raw: string): string {
  // Try ISO first
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10)
  // DD/MM/YYYY
  const dmY = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (dmY) return `${dmY[3]}-${dmY[2].padStart(2, '0')}-${dmY[1].padStart(2, '0')}`
  // MM/DD/YYYY
  const mdY = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/)
  if (mdY) {
    const year = mdY[3].length === 2 ? `20${mdY[3]}` : mdY[3]
    return `${year}-${mdY[1].padStart(2, '0')}-${mdY[2].padStart(2, '0')}`
  }
  return raw
}

function parseAmount(raw: string): number {
  // Remove currency symbols and spaces, replace comma as decimal
  const cleaned = raw.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.')
  return Math.abs(parseFloat(cleaned))
}

export function CSVImporter({ categories }: CSVImporterProps) {
  const [dragOver, setDragOver] = React.useState(false)
  const [fileName, setFileName] = React.useState<string | null>(null)
  const [headers, setHeaders] = React.useState<string[]>([])
  const [rawRows, setRawRows] = React.useState<ParsedRow[]>([])
  const [mapping, setMapping] = React.useState<Record<ColumnField, string>>({
    date: '',
    description: '',
    amount: '',
    type: '',
  })
  const [rowCategories, setRowCategories] = React.useState<Record<number, string>>({})
  const [status, setStatus] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [loading, setLoading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    if (!file.name.endsWith('.csv')) {
      setStatus({ type: 'error', message: 'Por favor, selecione um arquivo .csv' })
      return
    }
    setStatus(null)
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const { headers: h, rows: r } = parseCSV(text)
      setHeaders(h)
      setRawRows(r)
      const detected = autoDetect(h)
      setMapping(detected)
      setRowCategories({})
    }
    reader.readAsText(file, 'UTF-8')
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function setRowCategory(index: number, catId: string) {
    setRowCategories((prev) => ({ ...prev, [index]: catId }))
  }

  function setAllCategories(catId: string) {
    const all: Record<number, string> = {}
    rawRows.forEach((_, i) => {
      all[i] = catId
    })
    setRowCategories(all)
  }

  function buildMappedRows(): MappedRow[] {
    return rawRows.map((row, i) => {
      const rawDate = mapping.date ? row[mapping.date] ?? '' : ''
      const rawDesc = mapping.description ? row[mapping.description] ?? '' : ''
      const rawAmount = mapping.amount ? row[mapping.amount] ?? '' : ''
      const rawType = mapping.type ? row[mapping.type] ?? '' : 'EXPENSE'

      const date = parseDate(rawDate)
      const amount = parseAmount(rawAmount)
      const type = inferType(rawType)
      const categoryId = rowCategories[i] ?? ''

      return {
        date,
        description: rawDesc,
        amount,
        type,
        categoryId,
        _raw: row,
        _index: i,
      }
    })
  }

  const mappedRows = rawRows.length > 0 ? buildMappedRows() : []
  const previewRows = mappedRows.slice(0, 10)
  const extraCount = mappedRows.length - previewRows.length

  async function handleImport() {
    setStatus(null)
    const rows = buildMappedRows()

    const missingCategory = rows.some((r) => !r.categoryId)
    if (missingCategory) {
      setStatus({ type: 'error', message: 'Selecione uma categoria para todas as transações.' })
      return
    }

    setLoading(true)
    try {
      const result = await importTransactions(
        rows.map((r) => ({
          date: r.date,
          description: r.description,
          amount: r.amount,
          type: r.type,
          categoryId: r.categoryId,
        }))
      )

      if (result.error) {
        setStatus({ type: 'error', message: result.error })
      } else {
        setStatus({
          type: 'success',
          message: `${result.success} transaç${(result.success ?? 0) === 1 ? 'ão importada' : 'ões importadas'} com sucesso!`,
        })
        setFileName(null)
        setHeaders([])
        setRawRows([])
        setRowCategories({})
      }
    } catch {
      setStatus({ type: 'error', message: 'Erro ao importar. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setFileName(null)
    setHeaders([])
    setRawRows([])
    setRowCategories({})
    setStatus(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Status banner */}
      {status && (
        <div
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm border ${
            status.type === 'success'
              ? 'bg-green-950/40 border-green-700/40 text-green-300'
              : 'bg-red-950/40 border-red-700/40 text-red-300'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      {/* Drop zone */}
      {!fileName ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors ${
            dragOver
              ? 'border-brand-500 bg-brand-800/20'
              : 'border-white/10 hover:border-white/20 bg-ink-700/30'
          }`}
        >
          <div className="size-14 rounded-2xl bg-brand-800/50 border border-brand-700/30 flex items-center justify-center text-brand-400">
            <Upload className="size-7" />
          </div>
          <div className="text-center">
            <p className="font-medium text-slate-200">Arraste um arquivo CSV ou clique para selecionar</p>
            <p className="text-sm text-slate-500 mt-1">
              Colunas esperadas: data, descrição, valor, tipo
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={onInputChange}
          />
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-ink-700 border border-white/6 rounded-xl px-4 py-3">
          <FileText className="size-5 text-brand-400 shrink-0" />
          <span className="text-slate-200 font-medium flex-1 truncate">{fileName}</span>
          <span className="text-sm text-slate-500">{rawRows.length} linha{rawRows.length !== 1 ? 's' : ''}</span>
          <button
            onClick={reset}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded"
            title="Remover arquivo"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Column mapping */}
      {headers.length > 0 && (
        <div className="bg-ink-700 border border-white/6 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-slate-200 mb-4">Mapeamento de colunas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {COLUMN_FIELDS.map((field) => (
              <div key={field} className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {FIELD_LABELS[field]}
                </label>
                <div className="relative">
                  <select
                    value={mapping[field]}
                    onChange={(e) => setMapping((m) => ({ ...m, [field]: e.target.value }))}
                    className="w-full appearance-none bg-ink-800 border border-white/10 text-slate-200 text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-brand-600 transition-colors"
                  >
                    <option value="">— não mapear —</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3.5 text-slate-500 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview table */}
      {mappedRows.length > 0 && (
        <div className="bg-ink-700 border border-white/6 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
            <h2 className="text-sm font-semibold text-slate-200">
              Pré-visualização
            </h2>
            {/* Apply category to all */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Categoria para todas:</span>
              <div className="relative">
                <select
                  defaultValue=""
                  onChange={(e) => e.target.value && setAllCategories(e.target.value)}
                  className="appearance-none bg-ink-800 border border-white/10 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 pr-6 focus:outline-none focus:border-brand-600 transition-colors"
                >
                  <option value="">Selecionar…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 size-3 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/6">
                  {['Data', 'Descrição', 'Valor', 'Tipo', 'Categoria'].map((h) => (
                    <th
                      key={h}
                      className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {previewRows.map((row) => {
                  const catId = rowCategories[row._index] ?? ''
                  return (
                    <tr key={row._index} className="hover:bg-ink-600/20 transition-colors">
                      <td className="py-2.5 px-4 text-slate-400 tabular-nums whitespace-nowrap">
                        {row.date || <span className="text-red-400 text-xs">—</span>}
                      </td>
                      <td className="py-2.5 px-4 text-slate-300 max-w-[200px] truncate">
                        {row.description || <span className="text-slate-600 text-xs italic">sem descrição</span>}
                      </td>
                      <td className={`py-2.5 px-4 tabular-nums font-medium whitespace-nowrap ${
                        row.type === 'INCOME' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {isNaN(row.amount)
                          ? <span className="text-red-400 text-xs">inválido</span>
                          : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.amount)
                        }
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                          row.type === 'INCOME'
                            ? 'bg-green-950/50 text-green-400 border border-green-800/40'
                            : 'bg-red-950/50 text-red-400 border border-red-800/40'
                        }`}>
                          {row.type === 'INCOME' ? 'Receita' : 'Despesa'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="relative">
                          <select
                            value={catId}
                            onChange={(e) => setRowCategory(row._index, e.target.value)}
                            className={`appearance-none text-xs rounded-lg px-2.5 py-1.5 pr-6 focus:outline-none transition-colors border ${
                              catId
                                ? 'bg-ink-800 border-white/10 text-slate-300 focus:border-brand-600'
                                : 'bg-red-950/20 border-red-700/30 text-red-400 focus:border-red-500'
                            }`}
                          >
                            <option value="">Selecionar…</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 size-3 text-slate-500 pointer-events-none" />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {extraCount > 0 && (
            <div className="px-5 py-3 border-t border-white/6 text-sm text-slate-500 text-center">
              e mais {extraCount} linha{extraCount !== 1 ? 's' : ''}...
            </div>
          )}
        </div>
      )}

      {/* Import button */}
      {mappedRows.length > 0 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            {mappedRows.length} transaç{mappedRows.length === 1 ? 'ão' : 'ões'} detectada{mappedRows.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={handleImport}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-brand-600/20"
          >
            {loading ? (
              <>
                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Importando…
              </>
            ) : (
              <>
                <Upload className="size-4" />
                Importar {mappedRows.length} transaç{mappedRows.length === 1 ? 'ão' : 'ões'}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
