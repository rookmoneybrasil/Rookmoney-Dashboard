export type HelpCategory = 'como-usar' | 'planos' | 'conta' | 'app' | 'financeiro'

export interface HelpArticle {
  id: string
  title: string
  category: HelpCategory
  content: string
}

export const CATEGORY_INFO: Record<HelpCategory, { label: string; icon: string; description: string }> = {
  'como-usar':  { label: 'Como usar',          icon: '📖', description: 'Aprenda a usar o Rook Money' },
  'planos':     { label: 'Planos e pagamento',  icon: '💳', description: 'PRO, PRO+ e formas de pagamento' },
  'conta':      { label: 'Conta e perfil',       icon: '👤', description: 'Configurações, senha e dados' },
  'app':        { label: 'App mobile',           icon: '📱', description: 'Android, iOS e sincronização' },
  'financeiro': { label: 'Dicas financeiras',    icon: '💡', description: 'Aproveite melhor a plataforma' },
}

export const HELP_ARTICLES: HelpArticle[] = [
  // ── Como usar ──────────────────────────────────────────────────────
  {
    id: 'primeiros-passos',
    title: 'Primeiros passos no Rook Money',
    category: 'como-usar',
    content: `Bem-vindo ao Rook Money! Aqui está como começar:

**1. Crie sua conta**
Acesse [rookmoney.com/register](/register) e preencha nome, e-mail e senha. É grátis.

**2. Complete o onboarding**
Após o cadastro, o app guia você pra configurar suas categorias, rendas e primeiras transações.

**3. Registre suas transações**
No dashboard, clique no botão "+" para adicionar receitas e despesas. Você pode categorizar cada uma.

**4. Crie metas financeiras**
Vá em Metas e defina objetivos como reserva de emergência, viagem ou investimentos. Aporte quando puder.

**5. Configure contas a pagar**
Em Contas, adicione suas despesas fixas e parceladas. O Rook avisa antes do vencimento.`,
  },
  {
    id: 'como-adicionar-transacao',
    title: 'Como adicionar uma transação',
    category: 'como-usar',
    content: `Para registrar uma receita ou despesa:

1. No **Dashboard**, clique no botão **"+"**
2. Escolha o tipo: **Receita** ou **Despesa**
3. Preencha o valor, descrição, data e categoria
4. Clique em **Salvar**

A transação aparece imediatamente no dashboard, relatórios e orçamento.

**Dica:** você pode editar ou excluir qualquer transação depois clicando nela na lista.`,
  },
  {
    id: 'como-criar-meta',
    title: 'Como criar e gerenciar metas',
    category: 'como-usar',
    content: `Metas te ajudam a poupar para objetivos específicos.

**Criar uma meta:**
1. Vá em **Metas** no menu lateral
2. Clique em **"Nova meta"**
3. Defina nome, valor alvo e prazo (opcional)
4. Clique em **Salvar**

**Contribuir para uma meta:**
- Na página da meta, clique em **"Aportar"**
- Digite o valor e confirme
- O progresso atualiza automaticamente

**Retirar de uma meta:**
- Clique em **"Retirar"** se precisar do dinheiro de volta
- O saldo da meta é ajustado

Cada aporte cria uma transação EXPENSE automaticamente pra manter seu balanço correto.`,
  },
  {
    id: 'como-usar-contas-pagar',
    title: 'Como usar Contas a Pagar',
    category: 'como-usar',
    content: `O módulo de Contas organiza tudo que você precisa pagar.

**Tipos de conta:**
- **Avulsa** — uma conta única (ex: conserto do carro)
- **Parcelada** — dividida em parcelas (ex: compra em 6x)
- **Fixa/Recorrente** — repete todo mês (ex: Netflix, aluguel)

**Pagar uma conta:**
1. Na lista de contas, clique no botão **"Pagar"**
2. O Rook cria uma transação EXPENSE automaticamente
3. A conta é marcada como paga

**Conta fixa:**
- Cadastre uma vez e o Rook gera automaticamente todo mês
- Se deletar a conta do mês, ela não regenera (funciona como "pular este mês")`,
  },
  {
    id: 'como-usar-pessoas',
    title: 'Como usar o módulo Pessoas',
    category: 'como-usar',
    content: `Pessoas te ajuda a controlar quem te deve e quem você deve.

**Adicionar uma pessoa:**
1. Vá em **Pessoas** no menu
2. Clique em **"Nova pessoa"**
3. Dê um nome e uma cor

**Adicionar uma entrada:**
- Clique na pessoa
- Adicione: **"Me deve"** ou **"Eu devo"**
- Preencha descrição, valor e data

**Liquidar uma entrada:**
- Quando a pessoa pagar (ou você pagar), clique em **"Liquidar"**
- O Rook cria a transação automaticamente (INCOME se te pagaram, EXPENSE se você pagou)

**Parcelamento com pessoas:**
- Ao criar uma entrada, defina o número de parcelas
- O Rook cria todas as parcelas automaticamente`,
  },
  {
    id: 'como-usar-orcamento',
    title: 'Como configurar orçamentos',
    category: 'como-usar',
    content: `Orçamentos te avisam quando está gastando demais em uma categoria. *(PRO)*

**Criar orçamento:**
1. Vá em **Orçamento** no menu
2. Escolha a categoria (ex: Alimentação)
3. Defina o limite mensal (ex: R$800)
4. O Rook mostra seu progresso em tempo real

**Alertas:**
- Quando atingir 80% do limite, o indicador fica amarelo
- Quando ultrapassar, fica vermelho
- No dashboard, você vê quantas categorias estão acima do limite`,
  },
  {
    id: 'como-usar-rookinho',
    title: 'Como usar o Rookinho IA',
    category: 'como-usar',
    content: `O Rookinho é seu assistente financeiro com inteligência artificial. *(PRO)*

**O que ele faz:**
- Responde perguntas sobre suas finanças
- Cria transações, metas e contas por conversa
- Analisa seus gastos e dá dicas personalizadas
- Entende imagens, PDFs e planilhas Excel

**Como usar:**
1. Clique no ícone do Rookinho no canto inferior ou vá em **Chat**
2. Escreva sua pergunta ou peça algo (ex: "quanto gastei em alimentação este mês?")
3. O Rookinho consulta seus dados reais e responde

**Limite:** 30 mensagens/mês no PRO, 100 no PRO+.`,
  },

  // ── Planos ──────────────────────────────────────────────────────────
  {
    id: 'planos-diferenca',
    title: 'Qual a diferença entre Free, PRO e PRO+?',
    category: 'planos',
    content: `O Rook Money tem 3 planos:

| Recurso | Free | PRO (R$19,90/mês) | PRO+ (R$34,90/mês) |
|---------|------|-------|--------|
| Transações/mês | 30 | Ilimitadas | Ilimitadas |
| Metas | 2 | Ilimitadas | Ilimitadas |
| Contas a pagar | 5 | Ilimitadas | Ilimitadas |
| Pessoas | 3 | Ilimitadas | Ilimitadas |
| Orçamento | — | ✅ | ✅ |
| Relatórios | — | ✅ | ✅ |
| Projeção financeira | — | ✅ | ✅ |
| Rookinho IA | — | 30 msgs/mês | 100 msgs/mês |
| Importação CSV | — | ✅ | ✅ |

**Como fazer upgrade:**
Vá em **Configurações → Plano** ou clique em qualquer banner PRO na plataforma.`,
  },
  {
    id: 'como-cancelar',
    title: 'Como cancelar minha assinatura',
    category: 'planos',
    content: `Você pode cancelar a qualquer momento:

1. Vá em **Configurações → Plano**
2. Clique em **"Gerenciar assinatura"**
3. No portal Stripe, clique em **"Cancelar plano"**

**O que acontece:**
- Você continua usando o PRO até o fim do período pago
- Após o vencimento, volta automaticamente para o Free
- Seus dados **não são apagados** — só os limites do Free voltam a valer

Se mudar de ideia, pode assinar novamente a qualquer momento.`,
  },

  // ── Conta ──────────────────────────────────────────────────────────
  {
    id: 'como-trocar-senha',
    title: 'Como trocar minha senha',
    category: 'conta',
    content: `1. Vá em **Configurações → Segurança**
2. Digite sua senha atual
3. Digite a nova senha (mín. 8 caracteres, 1 número, 1 caractere especial)
4. Confirme a nova senha
5. Clique em **"Alterar senha"**

**Esqueceu a senha?**
Na tela de login, clique em **"Esqueci minha senha"**. Você recebe um e-mail para redefinir.`,
  },
  {
    id: 'como-editar-perfil',
    title: 'Como editar meu perfil',
    category: 'conta',
    content: `1. Vá em **Configurações**
2. Na seção **Perfil**, edite:
   - Nome
   - Foto de perfil (URL de imagem)
   - Cidade, profissão, bio
3. Clique em **Salvar**

Seu nome aparece no dashboard, no chat com o Rookinho e nos relatórios.`,
  },
  {
    id: 'como-excluir-conta',
    title: 'Como excluir minha conta',
    category: 'conta',
    content: `⚠️ **Atenção: esta ação é irreversível.**

1. Vá em **Configurações**
2. Role até o final da página
3. Clique em **"Excluir conta"**
4. Confirme a exclusão

**O que acontece:**
- Todos os seus dados são apagados permanentemente
- Se tiver assinatura ativa, ela é cancelada automaticamente
- Não é possível recuperar a conta depois`,
  },

  // ── App ──────────────────────────────────────────────────────────────
  {
    id: 'como-baixar-app',
    title: 'Como baixar o app',
    category: 'app',
    content: `O Rook Money está disponível para:

- **Android:** [Google Play Store](https://play.google.com/store/apps/details?id=com.rookmoney.app)
- **iOS:** Em breve na App Store
- **Web:** Acesse [rookmoney.com](https://rookmoney.com) pelo navegador

O app sincroniza automaticamente com a versão web — o que você faz no celular aparece no computador e vice-versa.`,
  },
  {
    id: 'app-vs-web',
    title: 'Qual a diferença entre app e web?',
    category: 'app',
    content: `Ambos acessam os mesmos dados. As diferenças são:

| Recurso | Web | App |
|---------|-----|-----|
| Dashboard completo | ✅ | ✅ |
| Transações | ✅ | ✅ |
| Metas | ✅ | ✅ |
| Contas | ✅ | ✅ |
| Orçamento | ✅ | ✅ |
| Relatórios | ✅ | ✅ |
| Notificações push | ❌ | ✅ |
| Rookinho IA | ✅ | ✅ |
| Importação CSV | ✅ | ❌ |

**Recomendação:** use o app no dia a dia para registrar gastos rápidos, e a web para análises mais detalhadas e importação.`,
  },

  // ── Dicas financeiras ──────────────────────────────────────────────
  {
    id: 'dica-categorias',
    title: 'Como organizar suas categorias',
    category: 'financeiro',
    content: `Categorias bem organizadas são a base de uma boa visão financeira.

**Categorias essenciais:**
- 🏠 Moradia (aluguel, condomínio, IPTU)
- 🍽️ Alimentação (supermercado, restaurantes)
- 🚗 Transporte (combustível, Uber, estacionamento)
- 💊 Saúde (plano, farmácia, academia)
- 📚 Educação (cursos, livros, escola)
- 🎮 Lazer (streaming, cinema, viagens)
- 💰 Investimentos
- 👕 Vestuário

**Dica:** não crie categorias demais. 8-12 categorias cobrem 95% dos gastos. Categorias muito específicas dificultam a análise.`,
  },
  {
    id: 'dica-recorrentes',
    title: 'Como automatizar suas finanças no Rook',
    category: 'financeiro',
    content: `O Rook pode automatizar grande parte do controle financeiro:

**1. Rendas recorrentes**
Cadastre seu salário e rendas fixas em **Rendas**. O Rook registra automaticamente todo mês.

**2. Contas fixas**
Cadastre Netflix, aluguel, internet em **Contas Fixas**. O Rook gera a conta todo mês e avisa do vencimento.

**3. Transações recorrentes**
Em **Recorrentes**, cadastre despesas que se repetem (academia, estacionamento). O Rook lança automaticamente.

**Resultado:** depois de configurar, você só precisa registrar gastos variáveis (alimentação, lazer, compras). O resto é automático.`,
  },
]

export function searchArticles(query: string): HelpArticle[] {
  const q = query.toLowerCase()
  return HELP_ARTICLES.filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.content.toLowerCase().includes(q)
  )
}

export function getArticlesByCategory(category: HelpCategory): HelpArticle[] {
  return HELP_ARTICLES.filter(a => a.category === category)
}

export function getArticleById(id: string): HelpArticle | undefined {
  return HELP_ARTICLES.find(a => a.id === id)
}
