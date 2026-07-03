import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '72px 80px',
          background: 'linear-gradient(135deg, #080E1D 0%, #0D2460 60%, #080E1D 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Glow */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '60%',
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.3) 0%, transparent 70%)',
        }} />

        {/* Rookinho mascot */}
        <img
          src="https://rookmoney.com/rookinho/rookinho-thumbsup.png"
          width={380}
          height={380}
          style={{ position: 'absolute', right: 10, bottom: 0 }}
        />

        {/* Logo text */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg,#2563EB,#6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 900, color: 'white',
          }}>R</div>
          <span style={{ fontSize: 36, fontWeight: 800, color: 'white', letterSpacing: '-1px' }}>
            Rook Money
          </span>
        </div>

        {/* Headline — two <span> lines in a column flex, not <br/>, since Satori
            requires every multi-child <div> to declare an explicit display and
            doesn't reliably lay out <br/> inside flex anyway */}
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 64, fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: 20, letterSpacing: '-2px' }}>
          <span>Seu dinheiro no</span>
          <span style={{ color: '#818cf8' }}>movimento certo.</span>
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: 24, color: '#94a3b8', fontWeight: 400, maxWidth: 620 }}>
          Dashboard inteligente, metas financeiras e relatórios. Grátis para começar.
        </div>

        {/* Pills */}
        <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
          {['Grátis para começar', 'LGPD compliant', 'Cancele quando quiser'].map(t => (
            <div key={t} style={{
              padding: '8px 20px', borderRadius: 99,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.14)',
              color: '#cbd5e1', fontSize: 18, fontWeight: 500,
            }}>{t}</div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
