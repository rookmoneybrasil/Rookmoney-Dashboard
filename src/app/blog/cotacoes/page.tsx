import type { Metadata } from 'next'
import { CotacoesClient } from './client'

export const metadata: Metadata = {
  title: 'Cotações em Tempo Real · Blog · Rook Money',
  description: 'Acompanhe as cotações da Bolsa brasileira, moedas e criptoativos em tempo real. Maiores altas e baixas do Ibovespa.',
}

export default function CotacoesPage() {
  return <CotacoesClient />
}
