import { serverApi } from '@/lib/api-client'
import { CSVImporter } from '@/components/import/csv-importer'
import { ReceiptScanner } from '@/components/import/receipt-scanner'
import { Tabs } from '@/components/import/import-tabs'
import { ProGate } from '@/components/ui/pro-gate'

export default async function ImportPage() {
  const user = await serverApi.me()
  if (user.plan !== 'PRO') {
    return (
      <ProGate feature="Importação de dados e Scanner de recibo" locked>
        <div className="h-64 rounded-xl bg-ink-800 border border-white/6" />
      </ProGate>
    )
  }

  const categories = await serverApi.categories()

  const cats = categories.map((c) => ({
    id:    c.id,
    name:  c.name,
    color: c.color,
    icon:  c.icon,
  }))

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Importar transações</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Escaneie comprovantes com IA ou envie um CSV para importar em lote.
        </p>
        <p className="text-xs text-slate-600 mt-1 max-w-md">Fotografe um comprovante ou extrato e a IA extrai os dados automaticamente. Também é possível importar um arquivo CSV com múltiplas transações de uma vez.</p>
      </div>

      <Tabs
        tabs={[
          {
            id:      'receipt',
            label:   'Comprovante / Nota',
            icon:    '🧾',
            content: <ReceiptScanner categories={cats} />,
          },
          {
            id:      'csv',
            label:   'Importar CSV',
            icon:    '📊',
            content: <CSVImporter categories={cats} />,
          },
        ]}
      />
    </div>
  )
}
