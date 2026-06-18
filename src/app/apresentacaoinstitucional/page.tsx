import type { Metadata } from 'next'
import { InstitutionalSlider } from './slider'

export const metadata: Metadata = {
  title: 'Apresentação Institucional — Rook Money',
  description: 'Conheça o Rook Money: controle financeiro pessoal, simples e inteligente. Dashboard, contas, metas, conquistas e muito mais.',
}

export default function ApresentacaoInstitucionalPage() {
  return <InstitutionalSlider />
}
