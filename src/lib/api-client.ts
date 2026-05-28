/**
 * API Client — Rookmoney Dashboard → Rookmoney API
 *
 * server() — para Server Components (Next.js App Router)
 *   Lê o cookie rook_session do request e o encaminha para a API.
 *
 * client() — para Client Components (browser)
 *   Usa credentials:'include' para enviar cookies automaticamente.
 */

// ─── Server-side (App Router server components) ───────────────────────────────

async function serverFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { cookies } = await import('next/headers')
  const store  = await cookies()
  const cookie = store.get('rook_session')

  const base = process.env.API_URL ?? 'http://localhost:3000'

  const res = await fetch(`${base}/api/v1${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: `rook_session=${cookie.value}` } : {}),
      ...(init?.headers ?? {}),
    },
  })

  if (res.status === 401) {
    const { redirect } = await import('next/navigation')
    redirect('/login')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? `API error ${res.status}`)
  }

  const json = await res.json()
  return (json as { data: T }).data
}

// ─── Client-side (browser fetch) ─────────────────────────────────────────────

async function clientFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? ''

  const res = await fetch(`${base}/api/v1${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`)
  }

  const json = await res.json()
  return (json as { data: T }).data
}

// ─── API namespace ────────────────────────────────────────────────────────────

export const serverApi = {
  // Auth / profile
  me:       () => serverFetch<User>('/auth/me'),
  settings: () => serverFetch<User>('/settings'),

  // Dashboard
  dashboard: () => serverFetch<DashboardData>('/dashboard'),

  // Transactions
  transactions: (params?: Record<string, string>) =>
    serverFetch<TransactionPage>(`/transactions${toQs(params)}`),

  // Goals
  goals: (includeCompleted = false) =>
    serverFetch<Goal[]>(`/goals${includeCompleted ? '?completed=true' : ''}`),

  // Bills
  bills: (onlyPending = false) =>
    serverFetch<Bill[]>(`/bills${onlyPending ? '?pending=true' : ''}`),

  // Categories
  categories: () => serverFetch<Category[]>('/categories'),

  // Budget
  budget: (month?: string) =>
    serverFetch<BudgetItem[]>(`/budget${month ? `?month=${month}` : ''}`),

  // Reports
  reports: (months = 6) => serverFetch<ReportsData>(`/reports?months=${months}`),

  // People
  people: () => serverFetch<Person[]>('/people'),
  person: (id: string) => serverFetch<PersonDetail>(`/people/${id}`),

  // Income
  incomeSources: () => serverFetch<IncomeSource[]>('/income-sources'),

  // Recurring
  recurring: () => serverFetch<RecurringTransaction[]>('/recurring'),

  // Notifications
  notifications: () => serverFetch<AppNotification[]>('/notifications'),

  // Admin
  adminStats: () => serverFetch<AdminStats>('/admin/stats'),
  adminUsers: (params?: Record<string, string>) =>
    serverFetch<AdminUsersPage>(`/admin/users${toQs(params)}`),
  adminUser: (id: string) => serverFetch<AdminUserDetail>(`/admin/users/${id}`),
}

export const clientApi = {
  // Auth
  login:    (data: { email: string; password: string; rememberMe?: boolean }) =>
    clientFetch<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: { name: string; email: string; password: string }) =>
    clientFetch<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  logout:   () => clientFetch<void>('/auth/logout', { method: 'POST' }),
  me:       () => clientFetch<User>('/auth/me'),

  // Transactions
  createTransaction: (data: TransactionInput) =>
    clientFetch<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  updateTransaction: (id: string, data: Partial<TransactionInput>) =>
    clientFetch<Transaction>(`/transactions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTransaction: (id: string) =>
    clientFetch<void>(`/transactions/${id}`, { method: 'DELETE' }),

  // Goals
  createGoal:   (data: GoalInput) =>
    clientFetch<Goal>('/goals', { method: 'POST', body: JSON.stringify(data) }),
  updateGoal:   (id: string, data: Partial<GoalInput>) =>
    clientFetch<Goal>(`/goals/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteGoal:   (id: string) =>
    clientFetch<void>(`/goals/${id}`, { method: 'DELETE' }),
  contributeToGoal: (id: string, amount: number, note?: string) =>
    clientFetch<void>(`/goals/${id}?action=contribute`, { method: 'POST', body: JSON.stringify({ amount, note }) }),

  // Bills
  createBill: (data: BillInput) =>
    clientFetch<Bill>('/bills', { method: 'POST', body: JSON.stringify(data) }),
  updateBill: (id: string, data: Partial<BillInput>) =>
    clientFetch<Bill>(`/bills/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteBill: (id: string) =>
    clientFetch<void>(`/bills/${id}`, { method: 'DELETE' }),
  markBillPaid: (id: string, paid = true) =>
    clientFetch<Bill>(`/bills/${id}?action=pay`, { method: 'POST', body: JSON.stringify({ paid }) }),

  // Categories
  createCategory: (data: CategoryInput) =>
    clientFetch<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: string, data: Partial<CategoryInput>) =>
    clientFetch<Category>(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCategory: (id: string) =>
    clientFetch<void>(`/categories/${id}`, { method: 'DELETE' }),

  // Budget
  upsertBudget: (data: { categoryId: string; amount: number; month: string }) =>
    clientFetch<Budget>('/budget', { method: 'POST', body: JSON.stringify(data) }),
  deleteBudget: (id: string) =>
    clientFetch<void>(`/budget/${id}`, { method: 'DELETE' }),

  // Income Sources
  createIncomeSource: (data: IncomeSourceInput) =>
    clientFetch<IncomeSource>('/income-sources', { method: 'POST', body: JSON.stringify(data) }),
  updateIncomeSource: (id: string, data: Partial<IncomeSourceInput>) =>
    clientFetch<IncomeSource>(`/income-sources/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteIncomeSource: (id: string) =>
    clientFetch<void>(`/income-sources/${id}`, { method: 'DELETE' }),

  // Recurring Transactions
  createRecurring: (data: RecurringInput) =>
    clientFetch<RecurringTransaction>('/recurring', { method: 'POST', body: JSON.stringify(data) }),
  updateRecurring: (id: string, data: Partial<RecurringInput>) =>
    clientFetch<RecurringTransaction>(`/recurring/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteRecurring: (id: string) =>
    clientFetch<void>(`/recurring/${id}`, { method: 'DELETE' }),
  toggleRecurring: (id: string) =>
    clientFetch<RecurringTransaction>(`/recurring/${id}?action=toggle`, { method: 'POST' }),

  // People
  createPerson: (data: PersonInput) =>
    clientFetch<Person>('/people', { method: 'POST', body: JSON.stringify(data) }),
  updatePerson: (id: string, data: Partial<PersonInput>) =>
    clientFetch<Person>(`/people/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePerson: (id: string) =>
    clientFetch<void>(`/people/${id}`, { method: 'DELETE' }),
  createEntry: (personId: string, data: EntryInput) =>
    clientFetch<PersonEntry>(`/people/${personId}?action=entry`, { method: 'POST', body: JSON.stringify(data) }),
  settleEntry: (id: string) =>
    clientFetch<PersonEntry>(`/people/entries/${id}?action=settle`, { method: 'POST' }),
  unsettleEntry: (id: string) =>
    clientFetch<PersonEntry>(`/people/entries/${id}?action=unsettle`, { method: 'POST' }),
  deleteEntry: (id: string) =>
    clientFetch<void>(`/people/entries/${id}`, { method: 'DELETE' }),

  // Settings
  getProfile: () => clientFetch<User>('/settings'),
  updateProfile: (data: { name?: string; whatsappPhone?: string }) =>
    clientFetch<User>('/settings', { method: 'PATCH', body: JSON.stringify(data) }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    clientFetch<void>('/settings?action=password', { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAccount: () =>
    clientFetch<void>('/settings', { method: 'DELETE' }),

  // Bill groups
  deleteBillGroup:        (groupId: string) => clientFetch<void>(`/bills/group/${groupId}`, { method: 'DELETE' }),
  deleteInstallmentGroup: (groupId: string) => clientFetch<void>(`/bills/group/${groupId}`, { method: 'DELETE' }),

  // Admin
  adminSetPlan:  (id: string, plan: 'FREE' | 'PRO') =>
    clientFetch<void>(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ plan }) }),
  adminSetAdmin: (id: string, isAdmin: boolean) =>
    clientFetch<void>(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ isAdmin }) }),
  adminDeleteUser: (id: string) =>
    clientFetch<void>(`/admin/users/${id}`, { method: 'DELETE' }),
}

export interface AppNotification { id: string; type: 'bill' | 'goal' | 'budget'; title: string; message: string; href: string; urgency: 'high' | 'medium' }

// ─── Types for dashboard components ──────────────────────────────────────────
export type HealthComponent = { key: string; label: string; score: number; max: number; detail: string; status: 'good' | 'ok' | 'warn' | 'bad' | 'neutral' }
export type HealthTip       = { icon: string; message: string; href?: string }
export type FinancialHealth = { score: number; grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F'; label: string; color: string; components: HealthComponent[]; tips: HealthTip[] }
export type ProjectionItem  = { id: string; label: string; amount: number; sublabel?: string; icon?: string }
export type MonthProjection = { month: string; label: string; income: number; expense: number; balance: number; cumulativeBalance: number; monthlyResult?: number; items?: ProjectionItem[]; incomeItems: { sources: ProjectionItem[]; recurring: ProjectionItem[]; people: ProjectionItem[] }; expenseItems: { bills: ProjectionItem[]; recurring: ProjectionItem[]; people: ProjectionItem[] } }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toQs(params?: Record<string, string>): string {
  if (!params) return ''
  const qs = new URLSearchParams(params).toString()
  return qs ? `?${qs}` : ''
}

// ─── Types (mirror API responses) ────────────────────────────────────────────

export interface User { id: string; name: string; email: string; plan: string; hasOnboarded: boolean; whatsappPhone?: string | null; createdAt?: string; updatedAt?: string; badges?: Record<string, number> }
export interface AuthResponse { token: string; user: User }
export interface Category { id: string; name: string; icon: string; color: string; isDefault: boolean; userId: string | null }
export interface CategoryInput { name: string; icon: string; color: string }
export interface Transaction { id: string; amount: number; type: 'INCOME' | 'EXPENSE'; description: string | null; date: string; category: Category; categoryId: string; userId: string; createdAt: string; updatedAt: string }
export interface TransactionInput { amount: number; type: 'INCOME' | 'EXPENSE'; description: string; date: string; categoryId: string }
export type TransactionFilter = { month?: string; type?: 'INCOME' | 'EXPENSE' | 'ALL'; categoryId?: string; search?: string; page?: number; pageSize?: number }
export interface TransactionPage { items: Transaction[]; total: number; page: number; totalPages: number }
export interface GoalContribution { id: string; amount: number; note: string | null; createdAt: string }
export interface Goal { id: string; name: string; targetAmount: number; currentAmount: number; deadline: string | null; description: string | null; icon: string | null; color: string | null; isCompleted: boolean; completedAt: string | null; createdAt: string; updatedAt: string; userId: string; contributions: GoalContribution[] }
export interface GoalInput { name: string; targetAmount: number; currentAmount?: number; deadline?: string; description?: string; icon?: string; color?: string }
export interface Bill { id: string; name: string; amount: number; dueDate: string; isPaid: boolean; paidAt: string | null; isRecurring: boolean; notes: string | null; categoryId: string | null; category: Category | null; installmentTotal: number | null; installmentCurrent: number | null; installmentGroupId: string | null; paidTransactionId: string | null; createdAt: string; updatedAt: string; userId: string }
export interface BillInput { name: string; amount: number; dueDate: string; isRecurring?: boolean; categoryId?: string; installments?: number; notes?: string }
export interface Budget { id: string; categoryId: string; month: string; amount: number; category: Category }
export interface IncomeSourceInput { name: string; type?: string; amount: number; isRecurring?: boolean; dayOfMonth?: number | null; notes?: string | null; categoryId?: string | null }
export interface RecurringInput { name: string; type: 'INCOME' | 'EXPENSE'; amount: number; frequency?: string; dayOfMonth?: number | null; description?: string | null; categoryId: string }
export interface PersonInput { name: string; color?: string | null; notes?: string | null }
export interface EntryInput { type: 'THEY_OWE_ME' | 'I_OWE_THEM'; description: string; amount: number; date: string; notes?: string | null; categoryId?: string | null }
export interface BudgetItem extends Budget { spent: number }
export interface Person { id: string; name: string; color: string | null; notes: string | null; createdAt: string; updatedAt: string; userId: string; balance: number; openEntriesCount: number; openCount?: number; entries?: PersonEntry[] }
export interface PersonDetail extends Person { entries: PersonEntry[] }
export interface PersonEntry { id: string; type: 'THEY_OWE_ME' | 'I_OWE_THEM'; description: string; amount: number; date: string; isSettled: boolean; settledAt: string | null; notes: string | null; installmentTotal: number | null; installmentCurrent: number | null; installmentGroupId: string | null; settledTransactionId: string | null; category: { id: string; name: string; icon: string; color: string } | null; categoryId: string | null; personId: string; userId: string; createdAt: string; updatedAt: string }
// PersonEntryRow with date as Date — used by components that expect Prisma types
export type PersonEntryRow = Omit<PersonEntry, 'date' | 'settledAt' | 'createdAt'> & { date: Date | string; settledAt: Date | string | null; createdAt: Date | string }
export interface IncomeSource { id: string; name: string; type: string; amount: number; isRecurring: boolean; dayOfMonth: number | null; notes: string | null; lastAutoPayMonth: string | null; categoryId: string | null; category: Category | null; createdAt: string; updatedAt: string; userId: string }
export interface RecurringTransaction { id: string; name: string; amount: number; type: 'INCOME' | 'EXPENSE'; frequency: string; isActive: boolean; dayOfMonth: number | null; description: string | null; lastAutoMonth: string | null; category: Category; categoryId: string; createdAt: string; updatedAt: string; userId: string }
export interface DashboardData { userName: string; monthBalance: number; monthIncome: number; monthExpense: number; incomeChange: number; expenseChange: number; totalReceivable: number; totalPeopleReceivable: number; totalIncomeReceivable: number; recentTransactions: Transaction[]; goals: Goal[]; upcomingBills: Bill[]; pendingBillsCount: number; overdueCount: number; healthScore: number; projections: ProjectionMonth[]; mood: string }
export interface ProjectionMonth { month: string; projectedIncome: number; projectedExpense: number; projectedBalance: number }
export interface ReportsData { monthly: MonthlyReport[]; period: PeriodReport; categoryTrend: CategoryTrend[]; topExpenses: TopExpense[]; spendingByDay: SpendingDay[]; incomeSources: IncomeSourceReport[] }
export interface MonthlyReport { monthKey: string; monthFull: string; totalIncome: number; totalExpense: number; balance: number; savingsRate: number }
export interface PeriodReport { totalIncome: number; totalExpense: number; balance: number; netBalance: number; savingsRate: number; avgMonthlyIncome: number; avgMonthlyExpense: number; positiveMonths: number; totalMonths: number; bestMonth: string | null; worstMonth: string | null }
export interface CategoryTrend { categoryId: string; name: string; icon: string; color: string; total: number; prevTotal: number; change: number; pct: number; delta: number }
export interface TopExpense { id: string; description: string | null; amount: number; date: string; category: Category }
export interface SpendingDay { day: number; total: number; count?: number }
export interface IncomeSourceReport { name: string; total: number; icon?: string; color?: string; pct?: number }
export interface AdminStats { totalUsers: number; proUsers: number; freeUsers: number; proRate: number; newToday: number; newThisWeek: number; newThisMonth: number; totalTransactions: number; transactionsThisMonth: number; totalGoals: number; mrr: number; arr: number; recentUsers: { id: string; name: string; email: string; plan: string; createdAt: string }[] }
export interface AdminUser { id: string; name: string; email: string; plan: string; isAdmin: boolean; createdAt: string; updatedAt: string; whatsappPhone?: string | null; stripeCustomerId?: string | null; stripeSubscriptionId?: string | null; _count: { transactions: number; goals: number; bills: number; budgets: number; people: number } }
export interface AdminUserDetail { user: AdminUser; recentTransactions: Transaction[] }
export interface AdminUsersPage { users: AdminUser[]; total: number; page: number; totalPages: number }
