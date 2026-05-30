/**
 * Theme-aware color tokens.
 * Use in client components with useTheme() hook.
 */

export interface ThemeColors {
  // Stat card backgrounds (BorderGlow backgroundColor)
  cardReceiver: string
  cardIncome:   string
  cardExpense:  string
  cardBalance:  string
  cardDanger:   string  // A Pagar section
  cardNeutral:  string  // Neutral cards
  // BorderGlow glow colors (as HSL string for glowColor prop)
  glowReceiver: string
  glowIncome:   string
  glowExpense:  string
  glowBalance:  string
}

export const darkColors: ThemeColors = {
  cardReceiver: '#062828',
  cardIncome:   '#052E16',
  cardExpense:  '#450A0A',
  cardBalance:  '#111E32',
  cardDanger:   '#1A0505',
  cardNeutral:  '#0C1628',
  glowReceiver: '187 80 50',
  glowIncome:   '142 71 45',
  glowExpense:  '0 84 60',
  glowBalance:  '221 83 53',
}

export const lightColors: ThemeColors = {
  cardReceiver: '#E0F9F9',
  cardIncome:   '#ECFDF5',
  cardExpense:  '#FFF1F2',
  cardBalance:  '#EFF6FF',
  cardDanger:   '#FFF1F2',
  cardNeutral:  '#F8FAFC',
  glowReceiver: '187 50 60',
  glowIncome:   '142 50 40',
  glowExpense:  '0 60 60',
  glowBalance:  '221 60 55',
}

export function getColors(isDark: boolean): ThemeColors {
  return isDark ? darkColors : lightColors
}
