import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, compact = false): string {
  if (compact && Math.abs(value) >= 1000) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value)
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value)
}

export function formatDate(date: Date | string, pattern = 'dd/MM/yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '-'
  return format(d, pattern, { locale: ptBR })
}

export function formatDateRelative(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '-'
  return format(d, "d 'de' MMMM", { locale: ptBR })
}

export function formatMonthYear(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '-'
  return format(d, 'MMMM yyyy', { locale: ptBR })
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function calculateProgress(current: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(Math.round((current / target) * 100), 100)
}

export function getDaysUntil(date: Date | string): number {
  const d = typeof date === 'string' ? parseISO(date) : date
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function classifyBillStatus(dueDate: Date | string, isPaid: boolean) {
  if (isPaid) return 'paid' as const
  const days = getDaysUntil(dueDate)
  if (days < 0) return 'overdue' as const
  if (days <= 3) return 'urgent' as const
  return 'pending' as const
}
