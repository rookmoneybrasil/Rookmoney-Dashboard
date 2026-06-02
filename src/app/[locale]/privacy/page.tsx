import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Política de Privacidade — Rook Money' }

export default function PrivacyPage() {
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

        <h1 className="text-3xl font-bold mb-2">Política de Privacidade</h1>
        <p className="text-sm text-slate-500 mb-10">Última atualização: junho de 2026</p>

        <div className="flex flex-col gap-8 text-slate-300 text-sm leading-relaxed">
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-slate-100">1. Dados que Coletamos</h2>
            <p>Coletamos apenas os dados necessários para operar o serviço:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5 text-slate-400">
              <li><strong className="text-slate-300">Cadastro:</strong> nome, e-mail e senha (armazenada com hash bcrypt)</li>
              <li><strong className="text-slate-300">Financeiros:</strong> transações, metas, contas e categorias que você registra</li>
              <li><strong className="text-slate-300">Uso:</strong> logs de acesso para segurança e diagnóstico de problemas</li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-slate-100">2. Como Usamos seus Dados</h2>
            <p>Seus dados são usados exclusivamente para:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5 text-slate-400">
              <li>Fornecer e melhorar as funcionalidades do Rook Money</li>
              <li>Enviar notificações e alertas que você configurou</li>
              <li>Processar pagamentos do plano Pro (via Stripe)</li>
              <li>Garantir a segurança da sua conta</li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-slate-100">3. Compartilhamento de Dados</h2>
            <p>
              Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins
              comerciais. Compartilhamos dados apenas com:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5 text-slate-400">
              <li><strong className="text-slate-300">Stripe:</strong> para processamento de pagamentos (dados de cartão nunca tocam nossos servidores)</li>
              <li><strong className="text-slate-300">Autoridades:</strong> quando exigido por lei</li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-slate-100">4. Segurança</h2>
            <p>
              Seus dados são transmitidos com criptografia TLS e armazenados em servidores seguros.
              Senhas são armazenadas com hash bcrypt. Tokens de sessão são assinados com JWT e expiram
              automaticamente.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-slate-100">5. Cookies e Sessão</h2>
            <p>
              Usamos um cookie de sessão (<code className="text-xs bg-ink-700 px-1 py-0.5 rounded">rook_session</code>) para manter você
              autenticado. Não utilizamos cookies de rastreamento ou publicidade. Se você desmarcar
              "Lembrar de mim" no login, o cookie expira ao fechar o navegador.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-slate-100">6. Seus Direitos (LGPD)</h2>
            <p>Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5 text-slate-400">
              <li>Acessar todos os seus dados (via exportação nas Configurações)</li>
              <li>Corrigir dados incorretos (via Configurações)</li>
              <li>Excluir sua conta e todos os dados associados (via Configurações)</li>
              <li>Portabilidade: exportar seus dados em CSV</li>
            </ul>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-slate-100">7. Retenção de Dados</h2>
            <p>
              Seus dados são mantidos enquanto sua conta estiver ativa. Ao excluir a conta, todos
              os dados são removidos permanentemente em até 30 dias.
            </p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-slate-100">8. Contato</h2>
            <p>
              Para exercer seus direitos ou tirar dúvidas sobre privacidade, entre em contato pelo
              e-mail{' '}
              <a href="mailto:privacidade@rookmoney.com.br" className="text-brand-400 hover:text-brand-300">
                privacidade@rookmoney.com.br
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/6 text-center">
          <p className="text-sm text-slate-600">
            Consulte também nossos{' '}
            <Link href="/terms" className="text-brand-400 hover:text-brand-300">
              Termos de Uso
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
