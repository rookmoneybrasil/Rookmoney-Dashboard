import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Termos de Uso — Rook Money' }

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-ink-900 text-slate-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-8"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </Link>

        <h1 className="text-3xl font-bold mb-2">Termos de Uso</h1>
        <p className="text-sm text-slate-500 mb-10">Última atualização: junho de 2026</p>

        <div className="flex flex-col gap-8 text-slate-300 text-sm leading-relaxed">
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-slate-100">1. Aceitação dos Termos</h2>
            <p>
              Ao criar uma conta ou utilizar o Rook Money, você concorda com estes Termos de Uso.
              Se não concordar, não utilize o serviço.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-slate-100">2. Descrição do Serviço</h2>
            <p>
              O Rook Money é uma plataforma de organização financeira pessoal que permite registrar
              transações, metas, contas a pagar, orçamentos e relatórios financeiros. O serviço é
              oferecido em planos gratuito e pago (Pro).
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-slate-100">3. Uso Adequado</h2>
            <p>Você se compromete a:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5 text-slate-400">
              <li>Fornecer informações verídicas no cadastro</li>
              <li>Manter sua senha em sigilo e não compartilhá-la</li>
              <li>Não utilizar o serviço para fins ilegais ou fraudulentos</li>
              <li>Não tentar acessar dados de outros usuários</li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-slate-100">4. Planos e Pagamentos</h2>
            <p>
              O plano gratuito possui limitações de uso descritas na página de preços. O plano Pro
              é cobrado mensalmente via cartão de crédito. Cancelamentos podem ser feitos a qualquer
              momento nas configurações da conta, com efeito ao fim do período pago.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-slate-100">5. Dados e Privacidade</h2>
            <p>
              Seus dados financeiros são armazenados com segurança e nunca são compartilhados com
              terceiros para fins comerciais. Consulte nossa{' '}
              <Link href="/privacy" className="text-brand-400 hover:text-brand-300 underline">
                Política de Privacidade
              </Link>{' '}
              para mais detalhes.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-slate-100">6. Disponibilidade</h2>
            <p>
              Nos esforçamos para manter o serviço disponível 24/7, mas não garantimos uptime
              ininterrupto. Manutenções programadas serão comunicadas com antecedência quando possível.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-slate-100">7. Rescisão</h2>
            <p>
              Você pode encerrar sua conta a qualquer momento nas configurações. Reservamos o direito
              de suspender contas que violem estes termos.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-slate-100">8. Alterações nos Termos</h2>
            <p>
              Podemos atualizar estes termos periodicamente. Mudanças significativas serão comunicadas
              por e-mail. O uso continuado após a notificação implica aceite das alterações.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-slate-100">9. Contato</h2>
            <p>
              Dúvidas sobre estes termos? Entre em contato pelo e-mail{' '}
              <a href="mailto:contato@rookmoney.com.br" className="text-brand-400 hover:text-brand-300">
                contato@rookmoney.com.br
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
