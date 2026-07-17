import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Target, ShieldCheck, PenLine, Mail, TrendingUp, Users } from 'lucide-react'
import { APP_URL } from '@/lib/app-url'

export const metadata: Metadata = {
  title: 'Sobre',
  description: 'Quem é o Rook Money, por que escrevemos sobre finanças e como produzimos nosso conteúdo. Conheça a equipe por trás do app de controle financeiro.',
  alternates: { canonical: `${APP_URL}/blog/sobre` },
  openGraph: {
    title: 'Sobre · Rook Money',
    description: 'Quem é o Rook Money e como produzimos nosso conteúdo sobre finanças pessoais.',
    type: 'website',
  },
}

const VALUES = [
  {
    icon: Target,
    title: 'Prático, não teórico',
    text: 'Cada artigo tem um passo a passo, um exemplo com números reais ou uma decisão concreta pra tomar. Nada de encher linguiça com definição de dicionário.',
  },
  {
    icon: TrendingUp,
    title: 'Realidade brasileira',
    text: 'Escrevemos pra quem ganha em real, paga Selic, declara imposto no Brasil e sente o preço do mercado subir. Não traduzimos conselho gringo.',
  },
  {
    icon: ShieldCheck,
    title: 'Sem promessa milagrosa',
    text: 'Não vendemos enriquecimento rápido nem indicamos ativo específico como “dica quente”. Organização financeira é método, não sorte.',
  },
]

export default function SobrePage() {
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Rook Money',
    url: APP_URL,
    logo: `${APP_URL}/icon-512.png`,
    description: 'Aplicativo brasileiro de controle financeiro pessoal: contas, gastos, metas, orçamento e dívidas em um só lugar.',
    email: 'contato@rookmoney.com',
    sameAs: [APP_URL],
  }

  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Sobre o Rook Money',
    url: `${APP_URL}/blog/sobre`,
    publisher: { '@type': 'Organization', name: 'Rook Money', url: APP_URL },
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }} />

      {/* Hero */}
      <div className="flex flex-col items-center text-center gap-5 mb-14">
        <Image src="/rookinho.png" alt="Rookinho, o mascote do Rook Money" width={96} height={96} className="rounded-2xl" />
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Sobre o Rook Money</h1>
        <p className="text-lg text-slate-500 max-w-xl">
          Somos um aplicativo brasileiro de controle financeiro pessoal — e este blog é onde
          compartilhamos, sem enrolação, o que aprendemos ajudando pessoas a organizar o dinheiro.
        </p>
      </div>

      {/* Quem somos */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Quem somos</h2>
        <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-brand-600">
          <p>
            O <strong>Rook Money</strong> é um app de finanças pessoais criado no Brasil para resolver um
            problema simples e universal: a maioria das pessoas não sabe pra onde o dinheiro vai. Reunimos
            contas a pagar, gastos, rendas, metas, orçamento e dívidas entre pessoas em um só lugar,
            com uma experiência leve — e o Rookinho, nosso assistente, pra dar aquele empurrão.
          </p>
          <p>
            Todo dia lidamos com dúvidas reais de usuários sobre orçamento, reserva de emergência,
            parcelamento, investimento e como parar de terminar o mês no vermelho. Este blog nasceu
            dessas conversas. O objetivo não é te transformar num economista — é te dar clareza pra
            tomar decisões melhores com o que você já ganha.
          </p>
        </div>
      </section>

      {/* Valores */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-slate-900 mb-5">No que acreditamos</h2>
        <div className="grid gap-4">
          {VALUES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4 p-5 rounded-2xl border border-slate-200 bg-slate-50/60">
              <div className="shrink-0 size-11 rounded-xl bg-brand-600/10 flex items-center justify-center">
                <Icon className="size-5 text-brand-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Como produzimos */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-3">
          <PenLine className="size-5 text-brand-600" />
          <h2 className="text-xl font-bold text-slate-900">Como produzimos o conteúdo</h2>
        </div>
        <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
          <p>
            Os artigos são escritos pela equipe editorial do Rook Money com o apoio de ferramentas de IA
            para pesquisa e primeira versão, sempre a partir de temas de finanças pessoais que importam pro
            público brasileiro. Antes de publicar, prezamos por:
          </p>
          <ul>
            <li>Informação correta e atual — quando citamos taxas, regras ou números, é o cenário vigente na data do artigo.</li>
            <li>Utilidade real — todo texto precisa deixar o leitor com algo aplicável, não só “consciente”.</li>
            <li>Originalidade — não republicamos o mesmo tema repetidamente nem copiamos de terceiros.</li>
          </ul>
          <p>
            Conteúdo não é recomendação personalizada de investimento. Cada situação é única; use nossos
            artigos como ponto de partida e, para decisões relevantes, procure um profissional habilitado.
          </p>
        </div>
      </section>

      {/* Contato */}
      <section className="mb-14">
        <div className="flex items-center gap-2 mb-3">
          <Users className="size-5 text-brand-600" />
          <h2 className="text-xl font-bold text-slate-900">Fale com a gente</h2>
        </div>
        <p className="text-slate-600 mb-4">
          Achou um erro, quer sugerir um tema ou tem uma dúvida sobre o app? A gente lê tudo.
        </p>
        <a
          href="mailto:contato@rookmoney.com"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium hover:border-slate-400 transition-colors"
        >
          <Mail className="size-4 text-brand-600" />
          contato@rookmoney.com
        </a>
      </section>

      {/* CTA */}
      <div className="py-12 px-8 rounded-2xl bg-slate-900 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Organize suas finanças com o Rook Money</h3>
        <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
          Contas, gastos, metas e dívidas num só lugar. Grátis para começar.
        </p>
        <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-colors">
          Criar conta grátis
        </Link>
      </div>
    </div>
  )
}
