'use client'

/**
 * Sound effects using Web Audio API — no external files needed.
 * All sounds are generated programmatically.
 *
 * Respects user preference stored in localStorage ('rook_sounds').
 * Default: enabled.
 */

const PREF_KEY = 'rook_sounds'

function isEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const v = localStorage.getItem(PREF_KEY)
  return v !== 'off'
}

export function toggleSounds(): boolean {
  const next = !isEnabled()
  localStorage.setItem(PREF_KEY, next ? 'on' : 'off')
  return next
}

export function getSoundsEnabled(): boolean {
  return isEnabled()
}

// ─── Audio context singleton ──────────────────────────────────────────────────

let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

async function ensureRunning(): Promise<AudioContext | null> {
  if (!isEnabled()) return null
  try {
    const c = getCtx()
    if (c.state === 'suspended') await c.resume()
    return c
  } catch { return null }
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function tone(
  c:       AudioContext,
  freq:    number,
  start:   number,
  dur:     number,
  gain  =  0.25,
  type: OscillatorType = 'sine',
  fadeOut = true,
) {
  const osc = c.createOscillator()
  const g   = c.createGain()
  osc.connect(g)
  g.connect(c.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freq, start)
  g.gain.setValueAtTime(gain, start)
  if (fadeOut) g.gain.exponentialRampToValueAtTime(0.001, start + dur)
  osc.start(start)
  osc.stop(start + dur + 0.01)
}

// ─── Sound effects ────────────────────────────────────────────────────────────

/** Income transaction created — bright ascending ping */
export async function playIncome() {
  const c = await ensureRunning()
  if (!c) return
  const t = c.currentTime
  tone(c, 880,  t,       0.08, 0.15, 'sine')
  tone(c, 1320, t + 0.07, 0.12, 0.12, 'sine')
}

/** Expense transaction created — short neutral pop */
export async function playExpense() {
  const c = await ensureRunning()
  if (!c) return
  tone(c, 440, c.currentTime, 0.12, 0.1, 'sine')
}

/** Bill marked as paid — satisfying check */
export async function playBillPaid() {
  const c = await ensureRunning()
  if (!c) return
  const t = c.currentTime
  tone(c, 523, t,       0.07, 0.12, 'sine')
  tone(c, 659, t + 0.06, 0.07, 0.1,  'sine')
  tone(c, 784, t + 0.12, 0.15, 0.12, 'sine')
}

/** Goal completed — ascending fanfare */
export async function playGoalComplete() {
  const c = await ensureRunning()
  if (!c) return
  const t: number = c.currentTime
  tone(c, 523,  t,        0.18, 0.15)
  tone(c, 659,  t + 0.08, 0.18, 0.15)
  tone(c, 784,  t + 0.16, 0.18, 0.15)
  tone(c, 1047, t + 0.24, 0.18, 0.15)
  tone(c, 1319, t + 0.32, 0.22, 0.18)
}

/** PRO upgrade celebration — full fanfare with harmony */
export async function playProUpgrade() {
  const c = await ensureRunning()
  if (!c) return
  const t: number = c.currentTime
  tone(c, 523,  t,        0.18, 0.18)
  tone(c, 659,  t + 0.07, 0.18, 0.18)
  tone(c, 784,  t + 0.14, 0.18, 0.18)
  tone(c, 1047, t + 0.21, 0.18, 0.18)
  tone(c, 1319, t + 0.28, 0.25, 0.18)
  tone(c, 1047, t + 0.35, 0.18, 0.15)
  tone(c, 1319, t + 0.42, 0.30, 0.20)
  tone(c, 262,  t,        0.25, 0.08)
  tone(c, 330,  t + 0.14, 0.25, 0.08)
  tone(c, 392,  t + 0.28, 0.25, 0.08)
}

/** Error / validation fail — low double buzz */
export async function playError() {
  const c = await ensureRunning()
  if (!c) return
  const t = c.currentTime
  tone(c, 220, t,       0.12, 0.12, 'square')
  tone(c, 180, t + 0.15, 0.18, 0.1,  'square')
}

/** Soft click — for confirming destructive actions */
export async function playClick() {
  const c = await ensureRunning()
  if (!c) return
  tone(c, 700, c.currentTime, 0.04, 0.06, 'sine')
}

/** Notification / alert — soft ding */
export async function playNotification() {
  const c = await ensureRunning()
  if (!c) return
  const t = c.currentTime
  tone(c, 880, t,       0.06, 0.1, 'sine')
  tone(c, 660, t + 0.1, 0.15, 0.07, 'sine')
}
