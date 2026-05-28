/* ─── Enums ───────────────────────────────────────────────────────── */

export type TransactionType = 'INCOME' | 'EXPENSE'

export type BillStatus = 'pending' | 'paid' | 'overdue' | 'urgent'

export type GoalStatus = 'active' | 'completed' | 'archived'

/* ─── Core entities ───────────────────────────────────────────────── */

export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  isDefault: boolean
  userId?: string
}

export interface Transaction {
  id: string
  amount: number
  type: TransactionType
  description?: string
  date: string
  createdAt: string
  categoryId: string
  category: Category
  userId: string
}

export interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  deadline?: string
  description?: string
  icon?: string
  color?: string
  isCompleted: boolean
  createdAt: string
  userId: string
}

export interface Bill {
  id: string
  name: string
  amount: number
  dueDate: string
  isPaid: boolean
  paidAt?: string
  isRecurring: boolean
  notes?: string
  categoryId?: string
  category?: Category
  createdAt: string
  userId: string
}

/* ─── Dashboard ───────────────────────────────────────────────────── */

export interface MonthlySummary {
  month: string
  totalIncome: number
  totalExpense: number
  balance: number
}

export interface CategoryBreakdown {
  categoryId: string
  categoryName: string
  categoryColor: string
  categoryIcon: string
  total: number
  percentage: number
  transactionCount: number
}

export interface DashboardData {
  currentBalance: number
  monthIncome: number
  monthExpense: number
  monthBalance: number
  recentTransactions: Transaction[]
  categoryBreakdown: CategoryBreakdown[]
  monthlySummary: MonthlySummary[]
  activeGoals: Goal[]
  upcomingBills: Bill[]
  insights: Insight[]
}

/* ─── Insights ────────────────────────────────────────────────────── */

export type InsightType =
  | 'top_category'
  | 'category_increase'
  | 'category_decrease'
  | 'goal_progress'
  | 'positive_month'
  | 'negative_month'
  | 'no_activity'

export interface Insight {
  id: string
  type: InsightType
  message: string
  highlight?: string
  createdAt: string
}

/* ─── Forms ───────────────────────────────────────────────────────── */

export interface TransactionFormData {
  amount: number
  type: TransactionType
  description?: string
  date: string
  categoryId: string
}

export interface GoalFormData {
  name: string
  targetAmount: number
  currentAmount?: number
  deadline?: string
  description?: string
  icon?: string
  color?: string
}

export interface BillFormData {
  name: string
  amount: number
  dueDate: string
  isRecurring: boolean
  notes?: string
  categoryId?: string
}

/* ─── API responses ───────────────────────────────────────────────── */

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

/* ─── Auth ────────────────────────────────────────────────────────── */

export interface Session {
  userId: string
  name: string
  email: string
}

export interface AuthFormState {
  errors?: {
    name?: string[]
    email?: string[]
    password?: string[]
  }
  message?: string
}
