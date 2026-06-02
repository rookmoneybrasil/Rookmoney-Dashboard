import { serverApi } from '@/lib/api-client'
import { CSVImporter } from '@/components/import/csv-importer'
import { OFXImporter } from '@/components/import/ofx-importer'
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
          Importe o extrato do seu banco ou escaneie comprovantes com IA.
        </p>
        <p className="text-xs text-slate-600 mt-1 max-w-md">
          Exporte o extrato OFX direto do internet banking e importe aqui — sem precisar de app de terceiros.
          Também é possível enviar CSV ou fotografar comprovantes.
        </p>
      </div>

      <Tabs
        tabs={[
          {
            id:      'ofx',
            label:   'Extrato do banco (OFX)',
            icon:    '🏦',
            content: <OFXImporter categories={cats} />,
          },
          {
            id:      'csv',
            label:   'Importar CSV',
            icon:    '📊',
            content: <CSVImporter categories={cats} />,
          },
          {
            id:      'receipt',
            label:   'Comprovante / Nota',
            icon:    '🧾',
            content: <ReceiptScanner categories={cats} />,
          },
        ]}
      />
    </div>
  )
}
