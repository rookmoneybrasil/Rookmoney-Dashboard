// Base URL do site público. Centralizado + `.trim()` porque a env var
// NEXT_PUBLIC_APP_URL no Vercel já veio com um "\n" no fim, o que quebrava
// a linha do Sitemap no robots.txt e podia sujar canonical/OG/links de email.
// Sempre importe daqui em vez de ler process.env.NEXT_PUBLIC_APP_URL direto.
export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://rookmoney.com')
  .trim()
  .replace(/\/+$/, '')
