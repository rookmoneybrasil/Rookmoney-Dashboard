import Image from 'next/image'

interface Props {
  insight: string
  mood:    string
}

const MOOD_SRC: Record<string, string> = {
  happy:       '/SVG/ESTADO - FELIZ.svg',
  angry:       '/SVG/ESTADO - BRAVO.svg',
  sad:         '/SVG/ESTADO - TRISTE.svg',
  confused:    '/SVG/ESTADO - CONFUSO.svg',
  determined:  '/SVG/ESTADO - DETERMINADO.svg',
  idle:        '/SVG/ESTADO - FELIZ.svg',
}

export function RookinhoInsight({ insight, mood }: Props) {
  if (!insight) return null

  const src = MOOD_SRC[mood] ?? MOOD_SRC.idle

  return (
    <div className="bg-ink-800 border border-white/6 rounded-2xl p-4 flex items-start gap-3">
      {/* Mascot */}
      <div className="relative size-12 shrink-0">
        <Image src={src} alt="Rookinho" fill className="object-contain" />
      </div>

      {/* Speech bubble */}
      <div className="flex-1 bg-ink-700/60 border border-white/6 rounded-xl rounded-tl-none px-3.5 py-2.5 relative">
        {/* Arrow */}
        <div className="absolute -left-2 top-3 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-ink-700/60" />
        <p className="text-sm text-slate-300 leading-relaxed">{insight}</p>
      </div>
    </div>
  )
}
