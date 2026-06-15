import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('landing')

  const features = [
    t('features.items.dashboard.title'),
    t('features.items.goals.title'),
    t('features.items.reports.title'),
  ]

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col relative overflow-hidden border-r border-white/6">
        <Image
          src="/ChatGPT Image 28_05_2026, 03_06_44.png"
          alt=""
          fill
          className="object-cover object-center"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(8,14,29,1) 0%, rgba(8,14,29,0.82) 28%, rgba(8,14,29,0.3) 55%, transparent 100%)',
          }}
        />
        <div className="relative z-10 p-8">
          <Link href="/">
            <Image
              src="/SVG/logo branco.svg"
              alt="Rook Money"
              width={150}
              height={44}
              priority
              className="hover:opacity-80 transition-opacity"
            />
          </Link>
        </div>
        <div className="flex-1" />
        <div className="relative z-10 px-8 pb-10 flex flex-col gap-5">
          <div>
            <blockquote className="text-2xl font-bold text-white leading-snug">
              &ldquo;{t('hero.badge')}&rdquo;
            </blockquote>
            <p className="text-slate-400 text-sm leading-relaxed mt-2 max-w-sm">
              {t('hero.description')}
            </p>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            {features.map((feat) => (
              <div key={feat} className="flex items-center gap-1.5 bg-white/8 border border-white/10 rounded-full px-3 py-1">
                <div className="size-1.5 rounded-full bg-brand-400 shrink-0" />
                <span className="text-xs text-slate-300 whitespace-nowrap">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-10">
        <div className="mb-8 lg:hidden">
          <Image src="/SVG/logo branco.svg" alt="Rook Money" width={140} height={40} priority />
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
