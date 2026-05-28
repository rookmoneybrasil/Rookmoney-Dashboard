export type MascotMood =
  | 'idle'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'euphoric'
  | 'confused'
  | 'determined'
  | 'celebrating'
  | 'counting'

export interface MascotEvent {
  mood:    MascotMood
  message: string
}

export const MASCOT_SRCS: Record<MascotMood, string> = {
  idle:        '/SVG/CONTANDO DINHEIRO.svg',
  happy:       '/SVG/ESTADO - FELIZ.svg',
  sad:         '/SVG/ESTADO - TRISTE.svg',
  angry:       '/SVG/ESTADO - BRAVO.svg',
  euphoric:    '/SVG/ESTADO - EUFORICO.svg',
  confused:    '/SVG/ESTADO - CONFUSO.svg',
  determined:  '/SVG/ESTADO - DETERMINADO.svg',
  celebrating: '/SVG/COMEMORANDO.svg',
  counting:    '/SVG/CONTANDO DINHEIRO.svg',
}

// Dispatch from any client component
export function triggerMascot(mood: MascotMood, message: string) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent<MascotEvent>('mascot:react', { detail: { mood, message } })
  )
}
