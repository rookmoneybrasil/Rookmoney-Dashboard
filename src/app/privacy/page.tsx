import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade — Rook Money',
  description: 'Saiba como o Rook Money coleta, usa e protege seus dados pessoais.',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
      <div className="flex flex-col gap-2 text-slate-300">{children}</div>
    </section>
  )
}

function Li({ children }: { children: React.ReactNode }) {
  return <li className="text-slate-400">{children}</li>
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-ink-900 text-slate-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-8"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </Link>

        <h1 className="text-3xl font-bold mb-2">Política de Privacidade</h1>
        <p className="text-sm text-slate-500 mb-10">Última atualização: 16 de junho de 2026</p>

        <div className="flex flex-col gap-8 text-sm leading-relaxed">

          <p className="text-slate-400">
            O <strong className="text-slate-200">Rook Money</strong> ("nós", "nosso" ou "o aplicativo") é um
            serviço de gestão financeira pessoal desenvolvido por <strong className="text-slate-200">Rookmoney
            Brasil</strong>. Esta Política de Privacidade descreve como coletamos, utilizamos, armazenamos e
            protegemos seus dados ao usar nosso aplicativo mobile e plataforma web. Ao criar uma conta ou usar
            o serviço, você concorda com os termos desta política.
          </p>

          <Section title="1. Dados que Coletamos">
            <p>Coletamos apenas os dados necessários para fornecer o serviço:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <Li><strong className="text-slate-300">Cadastro:</strong> nome completo, endereço de e-mail e senha (armazenada com hash bcrypt — nunca em texto puro).</Li>
              <Li><strong className="text-slate-300">Perfil opcional:</strong> foto de perfil, bio, cidade, profissão e data de nascimento — preenchidos somente se você optar.</Li>
              <Li><strong className="text-slate-300">Login social:</strong> se você entrar com o Google, recebemos seu nome, e-mail e foto pública do perfil Google.</Li>
              <Li><strong className="text-slate-300">WhatsApp:</strong> número de telefone em formato E.164, somente se você configurar a integração.</Li>
              <Li><strong className="text-slate-300">Dados financeiros:</strong> transações, contas a pagar, metas, orçamentos, fontes de renda, parcelas e categorias que você registra. Esses dados pertencem exclusivamente a você e são usados para gerar seus relatórios e alertas.</Li>
              <Li><strong className="text-slate-300">Dados de pessoas (Carteira):</strong> nomes de contatos e valores de dívidas/empréstimos que você registra voluntariamente.</Li>
              <Li><strong className="text-slate-300">Imagens de feedback:</strong> capturas de tela ou fotos que você envia opcionalmente ao reportar um bug ou enviar sugestão.</Li>
              <Li><strong className="text-slate-300">Token de push:</strong> identificador anônimo gerado pelo sistema operacional do dispositivo para enviar notificações. Não identifica você pessoalmente.</Li>
              <Li><strong className="text-slate-300">Dados de uso:</strong> contador de uso da IA e do scanner de recibos (apenas para aplicar limites do plano), data do último acesso.</Li>
              <Li><strong className="text-slate-300">Logs técnicos:</strong> endereço IP, tipo de dispositivo e erros da aplicação — coletados apenas para diagnóstico de problemas e segurança.</Li>
            </ul>
          </Section>

          <Section title="2. Finalidade do Tratamento">
            <p>Seus dados são tratados exclusivamente para:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <Li>Criar e autenticar sua conta de forma segura.</Li>
              <Li>Exibir seu painel financeiro, relatórios e alertas personalizados.</Li>
              <Li>Enviar notificações push e e-mails de lembrete que você ativou nas Configurações.</Li>
              <Li>Processar a assinatura do plano Pro (via Stripe).</Li>
              <Li>Diagnosticar erros e melhorar a qualidade do serviço.</Li>
              <Li>Cumprir obrigações legais e prevenir fraudes.</Li>
            </ul>
            <p>
              <strong className="text-slate-200">Não usamos seus dados financeiros para fins de crédito, scoring ou
              publicidade de terceiros.</strong>
            </p>
          </Section>

          <Section title="3. Compartilhamento com Terceiros">
            <p>
              Não vendemos, alugamos nem compartilhamos seus dados para fins comerciais. O compartilhamento
              ocorre apenas com os seguintes provedores de infraestrutura, vinculados por contratos de
              confidencialidade:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <Li><strong className="text-slate-300">Railway (EUA):</strong> hospedagem da API e banco de dados PostgreSQL.</Li>
              <Li><strong className="text-slate-300">Vercel (EUA):</strong> hospedagem do aplicativo web e do painel.</Li>
              <Li><strong className="text-slate-300">Stripe (EUA):</strong> processamento de pagamentos. Dados de cartão nunca transitam pelos nossos servidores — são processados diretamente pela Stripe.</Li>
              <Li><strong className="text-slate-300">Resend (EUA):</strong> envio de e-mails transacionais (confirmação de conta, lembretes, resumo mensal).</Li>
              <Li><strong className="text-slate-300">Google LLC:</strong> autenticação OAuth se você optar por "Entrar com o Google".</Li>
              <Li><strong className="text-slate-300">Expo (EUA):</strong> serviço de entrega de notificações push (Expo Push API). O token do dispositivo é repassado à Expo para entregar alertas — a Expo não tem acesso aos seus dados financeiros.</Li>
              <Li><strong className="text-slate-300">Autoridades públicas:</strong> quando exigido por lei, ordem judicial ou para proteger direitos legais.</Li>
            </ul>
          </Section>

          <Section title="4. Permissões do Aplicativo Mobile">
            <p>O aplicativo pode solicitar as seguintes permissões do seu dispositivo:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <Li><strong className="text-slate-300">Câmera:</strong> para tirar foto ao enviar feedback com screenshot. Nunca acessada em background.</Li>
              <Li><strong className="text-slate-300">Galeria de fotos:</strong> para selecionar uma imagem ao enviar feedback. Não fazemos upload de fotos automaticamente.</Li>
              <Li><strong className="text-slate-300">Notificações:</strong> para enviar lembretes de contas e alertas de orçamento. Você pode desativar a qualquer momento nas Configurações do app ou do sistema.</Li>
              <Li><strong className="text-slate-300">Internet:</strong> necessária para sincronizar seus dados com nossos servidores.</Li>
            </ul>
          </Section>

          <Section title="5. Segurança">
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <Li>Toda comunicação entre o app e nossos servidores usa <strong className="text-slate-300">criptografia TLS 1.2+</strong>.</Li>
              <Li>Senhas são armazenadas com <strong className="text-slate-300">hash bcrypt</strong> — ninguém em nossa equipe pode visualizá-las.</Li>
              <Li>Tokens de sessão JWT são assinados com chave secreta e expiram automaticamente.</Li>
              <Li>O banco de dados está em rede privada sem acesso público direto.</Li>
              <Li>Em caso de comprometimento de segurança que afete seus dados, notificaremos por e-mail no prazo máximo de 72 horas.</Li>
            </ul>
          </Section>

          <Section title="6. Cookies e Sessão">
            <p>
              No aplicativo web, usamos um cookie de sessão (<code className="text-xs bg-slate-800 px-1 py-0.5 rounded">rook_session</code>) para
              manter você autenticado. Não utilizamos cookies de rastreamento, analytics de terceiros
              ou publicidade comportamental.
            </p>
            <p>
              Se você desmarcar "Lembrar de mim" no login, o cookie expira ao fechar o navegador.
            </p>
          </Section>

          <Section title="7. Retenção de Dados">
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <Li>Seus dados são mantidos enquanto sua conta estiver ativa.</Li>
              <Li>Ao excluir a conta (disponível em Configurações → Excluir conta), todos os seus dados pessoais e financeiros são removidos permanentemente dos nossos sistemas em até <strong className="text-slate-300">30 dias</strong>.</Li>
              <Li>Logs técnicos são retidos por até 90 dias para fins de segurança e diagnóstico.</Li>
              <Li>Dados de transações de pagamento podem ser retidos por até 5 anos para fins fiscais e contábeis, conforme exigência legal.</Li>
            </ul>
          </Section>

          <Section title="8. Seus Direitos (LGPD — Lei 13.709/2018)">
            <p>
              Em conformidade com a <strong className="text-slate-200">Lei Geral de Proteção de Dados (LGPD)</strong>,
              você tem os seguintes direitos, exercíveis a qualquer momento:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <Li><strong className="text-slate-300">Acesso:</strong> consultar todos os seus dados via exportação em CSV (Configurações → Exportar dados).</Li>
              <Li><strong className="text-slate-300">Correção:</strong> atualizar seus dados pessoais diretamente nas Configurações.</Li>
              <Li><strong className="text-slate-300">Exclusão:</strong> excluir sua conta e todos os dados associados em Configurações → Excluir conta.</Li>
              <Li><strong className="text-slate-300">Portabilidade:</strong> exportar suas transações e dados em formato CSV.</Li>
              <Li><strong className="text-slate-300">Oposição:</strong> desativar notificações por e-mail e push a qualquer momento nas Configurações.</Li>
              <Li><strong className="text-slate-300">Revogação de consentimento:</strong> você pode revogar o acesso do login Google desconectando a conta em Configurações.</Li>
            </ul>
            <p>
              Para exercer qualquer direito não disponível no app, entre em contato pelo e-mail{' '}
              <a href="mailto:privacidade@rookmoney.com" className="text-brand-400 hover:text-brand-300 underline">
                privacidade@rookmoney.com
              </a>
              . Respondemos em até <strong className="text-slate-200">15 dias úteis</strong>.
            </p>
          </Section>

          <Section title="9. Privacidade de Menores">
            <p>
              O Rook Money é destinado a usuários com <strong className="text-slate-200">18 anos ou mais</strong>.
              Não coletamos intencionalmente dados de menores de idade. Se tomarmos conhecimento de
              que uma conta pertence a um menor, excluiremos os dados imediatamente.
            </p>
          </Section>

          <Section title="10. Transferência Internacional de Dados">
            <p>
              Nossos servidores estão localizados nos <strong className="text-slate-200">Estados Unidos</strong> (Railway e Vercel).
              A transferência de dados para fora do Brasil é feita com base em cláusulas contratuais padrão
              e garantias adequadas de proteção, conforme permitido pela LGPD (Art. 33).
            </p>
          </Section>

          <Section title="11. Alterações nesta Política">
            <p>
              Podemos atualizar esta política periodicamente. Quando houver mudanças relevantes, notificaremos
              você por e-mail e/ou por aviso no aplicativo com pelo menos <strong className="text-slate-200">15 dias de antecedência</strong>.
              A data de "última atualização" no topo desta página será sempre atualizada.
            </p>
            <p>
              O uso contínuo do serviço após a vigência das alterações implica aceitação da nova política.
            </p>
          </Section>

          <Section title="12. Contato e Encarregado de Dados (DPO)">
            <p>Para dúvidas, solicitações ou reclamações sobre privacidade:</p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              <Li>
                <strong className="text-slate-300">E-mail:</strong>{' '}
                <a href="mailto:privacidade@rookmoney.com" className="text-brand-400 hover:text-brand-300 underline">
                  privacidade@rookmoney.com
                </a>
              </Li>
              <Li><strong className="text-slate-300">Empresa:</strong> Rookmoney Brasil</Li>
              <Li>
                <strong className="text-slate-300">Autoridade reguladora:</strong> Autoridade Nacional de Proteção de Dados (ANPD) —{' '}
                <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:text-brand-300 underline">
                  gov.br/anpd
                </a>
              </Li>
            </ul>
          </Section>

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
