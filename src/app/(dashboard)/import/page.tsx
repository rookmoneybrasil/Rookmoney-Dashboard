import { getCategories } from '@/app/actions/categories'
import { CSVImporter } from '@/components/import/csv-importer'
import { ReceiptScanner } from '@/components/import/receipt-scanner'
import { Tabs } from '@/components/import/import-tabs'

export default async function ImportPage() {
  const categories = await getCategories()

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
