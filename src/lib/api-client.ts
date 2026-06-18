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

  // 204 No Content (DELETE) — no body to parse
  if (res.status === 204) return undefined as T

  const json = await res.json()
  return (json as { data: T }).data
}

// ─── Client-side (browser fetch) ─────────────────────────────────────────────

async function clientFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/v1${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string; code?: string }
    // Plan limit hit → redirect to billing page automatically
    if (err.code === 'PLAN_LIMIT' || err.code === 'PRO_REQUIRED') {
      window.location.href = '/billing'
      throw new Error(err.error ?? 'Limite do plano atingido.')
    }
    throw new Error(err.error ?? `HTTP ${res.status}`)
  }

  // 204 No Content (DELETE) — no body to parse
  if (res.status === 204) return undefined as T

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

  // Recurring Bills (templates)
  recurringBills: () => serverFetch<RecurringBill[]>('/bills/recurring'),

  // Reports
  reports: (months = 6, month?: string) => serverFetch<ReportsData>(`/reports?months=${months}${month ? `&month=${month}` : ''}`),

  // People
  people: () => serverFetch<Person[]>('/people'),
  person: (id: string) => serverFetch<PersonDetail>(`/people/${id}`),

  // Income
  incomeSources: () => serverFetch<IncomeSource[]>('/income-sources'),
  incomeHistory: () => serverFetch<Record<string, { id: string; amount: number; date: string; category: { id: string; name: string; icon: string; color: string } | null }[]>>('/income-sources/history'),

  // Recurring
  recurring: () => serverFetch<RecurringTransaction[]>('/recurring'),

  // Calendar
  calendar: (month?: string) => serverFetch<CalendarData>(`/calendar${month ? `?month=${month}` : ''}`),

  // Person recurring
  personRecurring: (personId: string) => serverFetch<PersonEntryRecurringItem[]>(`/people/recurring?personId=${personId}`),

  // Notifications
  notifications: () => serverFetch<AppNotification[]>('/notifications'),

  // Achievements
  achievements: () => serverFetch<AchievementsResponse>('/achievements'),

  // Pluggy — Open Finance
  pluggyItems: () => serverFetch<PluggyItemRecord[]>('/pluggy/items').catch(() => [] as PluggyItemRecord[]),
  pluggyBoletos: () => serverFetch<{ boletos: PluggyBoleto[]; items: { id: string; connectorName: string; ok: boolean }[] }>('/pluggy/boletos').catch(() => ({ boletos: [], items: [] })),

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
  contributeToGoal: (id: string, amount: number, categoryId?: string, note?: string) =>
    clientFetch<void>(`/goals/${id}?action=contribute`, { method: 'POST', body: JSON.stringify({ amount, categoryId, note }) }),
  withdrawFromGoal: (id: string, amount: number, categoryId?: string) =>
    clientFetch<void>(`/goals/${id}?action=withdraw`, { method: 'POST', body: JSON.stringify({ amount, categoryId }) }),

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
  revertIncomeReceipt: (id: string) =>
    clientFetch<IncomeSource>(`/income-sources/${id}?action=revert`, { method: 'POST' }),
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
  editEntry: (id: string, data: Partial<EntryInput> & { applyToGroup?: boolean }) =>
    clientFetch<PersonEntry>(`/people/entries/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteEntry: (id: string) =>
    clientFetch<void>(`/people/entries/${id}`, { method: 'DELETE' }),
  deleteEntryGroup: (id: string) =>
    clientFetch<void>(`/people/entries/${id}?applyToGroup=true`, { method: 'DELETE' }),

  // Person Entry Recurring
  createPersonRecurring: (data: { personId: string; type: string; description: string; amount: number; dayOfMonth?: number; firstDate?: string | null; notes?: string | null; categoryId?: string | null }) =>
    clientFetch<PersonEntryRecurringItem>('/people/recurring', { method: 'POST', body: JSON.stringify(data) }),
  updatePersonRecurring: (id: string, data: { description?: string; amount?: number; dayOfMonth?: number; categoryId?: string | null; notes?: string | null; isActive?: boolean }) =>
    clientFetch<PersonEntryRecurringItem>(`/people/recurring/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  stopPersonRecurring: (id: string) =>
    clientFetch<void>(`/people/recurring/${id}`, { method: 'DELETE' }),
  migratePersonRecurring: () =>
    clientFetch<{ converted: number; message: string }>('/people/migrate-recurring', { method: 'POST' }),

  // Settings
  getProfile: () => clientFetch<User>('/settings'),
  updateProfile: (data: { name?: string; whatsappPhone?: string; profileImage?: string | null; bio?: string | null; city?: string | null; occupation?: string | null; birthdate?: string | null }) =>
    clientFetch<User>('/settings', { method: 'PATCH', body: JSON.stringify(data) }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    clientFetch<void>('/settings?action=password', { method: 'PATCH', body: JSON.stringify(data) }),
  updateNotifications: (data: { notifBillReminder?: boolean; notifCategoryLimit?: boolean; notifMonthlyEmail?: boolean }) =>
    clientFetch<void>('/settings?action=notifications', { method: 'PATCH', body: JSON.stringify(data) }),
  updatePreferences: (data: { currency?: string; dateFormat?: string }) =>
    clientFetch<void>('/settings?action=preferences', { method: 'PATCH', body: JSON.stringify(data) }),
  disconnectGoogle: () =>
    clientFetch<void>('/settings?action=disconnect-google', { method: 'PATCH' }),
  deleteAccount: () =>
    clientFetch<void>('/settings', { method: 'DELETE' }),

  // Recurring Bills (templates)
  createRecurringBill: (data: RecurringBillInput) =>
    clientFetch<RecurringBill>('/bills/recurring', { method: 'POST', body: JSON.stringify(data) }),
  updateRecurringBill: (id: string, data: Partial<RecurringBillInput> & { isActive?: boolean }) =>
    clientFetch<RecurringBill>(`/bills/recurring/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteRecurringBill: (id: string) =>
    clientFetch<void>(`/bills/recurring/${id}`, { method: 'DELETE' }),

  // Bill groups
  deleteBillGroup:        (groupId: string) => clientFetch<void>(`/bills/group/${groupId}`, { method: 'DELETE' }),
  deleteInstallmentGroup: (groupId: string) => clientFetch<void>(`/bills/group/${groupId}`, { method: 'DELETE' }),

  // Achievements
  checkAchievements: (trigger: string, ctx?: Record<string, unknown>) =>
    clientFetch<AchievementCheckResponse>('/achievements', { method: 'POST', body: JSON.stringify({ trigger, ctx }) }),
  markAchievementsSeen: () =>
    clientFetch<void>('/achievements/seen', { method: 'POST' }),

  // Export
  exportData: () => clientFetch<Record<string, unknown>>('/export'),

  // Billing (Stripe)
  createCheckout: (annual = false) => clientFetch<{ url: string }>('/billing/checkout', { method: 'POST', body: JSON.stringify({ annual }) }),
  createPortal:   () => clientFetch<{ url: string }>('/billing/portal',   { method: 'POST' }),

  // Admin
  adminSetPlan:  (id: string, plan: 'FREE' | 'PRO') =>
    clientFetch<void>(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ plan }) }),
  adminSetAdmin: (id: string, isAdmin: boolean) =>
    clientFetch<void>(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ isAdmin }) }),
  adminDeleteUser: (id: string) =>
    clientFetch<void>(`/admin/users/${id}`, { method: 'DELETE' }),

  // Pluggy — Open Finance
  pluggyConnectToken: () =>
    clientFetch<{ accessToken: string }>('/pluggy/connect-token', { method: 'POST' }),
  pluggyItems: () =>
    clientFetch<PluggyItemRecord[]>('/pluggy/items'),
  pluggySaveItem: (itemId: string) =>
    clientFetch<PluggyItemRecord>('/pluggy/items', { method: 'POST', body: JSON.stringify({ itemId }) }),
  pluggyDeleteItem: (id: string) =>
    clientFetch<void>(`/pluggy/items/${id}`, { method: 'DELETE' }),
  pluggyBoletos: () =>
    clientFetch<{ boletos: PluggyBoleto[]; items: { id: string; connectorName: string; ok: boolean }[] }>('/pluggy/boletos'),
}

export interface CalendarEvent { id: string; day: number; type: 'bill' | 'income' | 'recurring'; label: string; amount: number; status: 'pending' | 'paid' | 'overdue' | 'expected' | 'received'; href: string; color: string }
export interface CalendarData { month: string; daysInMonth: number; firstWeekday: number; events: CalendarEvent[]; byDay: Record<string, CalendarEvent[]> }

export interface AppNotification { id: string; type: 'bill' | 'goal' | 'budget' | 'person' | 'income'; title: string; message: string; href: string; urgency: 'high' | 'medium' | 'low' }

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

export interface UserUsage { transactionsThisMonth: number; bills: number; goals: number; people: number; customCategories: number; recurring: number }
export interface UserLimits { transactionsPerMonth: number | null; bills: number | null; goals: number | null; people: number | null; customCategories: number | null; recurring: number | null; budget: boolean; reports: boolean; projection: boolean; import: boolean }
export interface User { id: string; name: string; email: string; plan: string; hasOnboarded: boolean; whatsappPhone?: string | null; profileImage?: string | null; bio?: string | null; city?: string | null; occupation?: string | null; birthdate?: string | null; createdAt?: string; updatedAt?: string; badges?: Record<string, number>; usage?: UserUsage; limits?: UserLimits; hasGoogle?: boolean; notifBillReminder?: boolean; notifCategoryLimit?: boolean; notifMonthlyEmail?: boolean; currency?: string; dateFormat?: string; stripeCustomerId?: string | null; stripeSubscriptionId?: string | null }
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
export interface Bill { id: string; name: string; amount: number; dueDate: string; isPaid: boolean; paidAt: string | null; isRecurring: boolean; notes: string | null; categoryId: string | null; category: Category | null; installmentTotal: number | null; installmentCurrent: number | null; installmentGroupId: string | null; paidTransactionId: string | null; recurringBillId: string | null; createdAt: string; updatedAt: string; userId: string }
export interface BillInput { name: string; amount: number; dueDate: string; isRecurring?: boolean; categoryId?: string; installments?: number; alreadyPaid?: number; notes?: string }
export interface RecurringBill { id: string; name: string; amount: number; dayOfMonth: number; isActive: boolean; lastAutoMonth: string | null; notes: string | null; categoryId: string | null; category: Category | null; createdAt: string; updatedAt: string; userId: string }
export interface RecurringBillInput { name: string; amount: number; dayOfMonth: number; categoryId?: string | null; notes?: string | null; generateNow?: boolean }
export interface Budget { id: string; categoryId: string; month: string; amount: number; category: Category }
export interface IncomeSourceInput { name: string; type?: string; amount: number; isRecurring?: boolean; dayOfMonth?: number | null; startDate?: string | null; notes?: string | null; categoryId?: string | null }
export interface RecurringInput { name: string; type: 'INCOME' | 'EXPENSE'; amount: number; frequency?: string; dayOfMonth?: number | null; description?: string | null; categoryId: string }
export interface PersonInput { name: string; color?: string | null; notes?: string | null }
export interface EntryInput { type: 'THEY_OWE_ME' | 'I_OWE_THEM'; description: string; amount: number; date: string; notes?: string | null; categoryId?: string | null }
export interface BudgetItem extends Budget { spent: number }
export interface Person { id: string; name: string; color: string | null; notes: string | null; createdAt: string; updatedAt: string; userId: string; balance: number; theyOweMe?: number; iOweThem?: number; openEntriesCount: number; openCount?: number; entries?: PersonEntry[] }
export interface PersonDetail extends Person { entries: PersonEntry[] }
export interface PersonEntryRecurringItem { id: string; type: 'THEY_OWE_ME' | 'I_OWE_THEM'; description: string; amount: number; dayOfMonth: number; isActive: boolean; notes: string | null; lastMonth: string | null; personId: string; person: { id: string; name: string; color: string | null }; categoryId: string | null; category: { id: string; name: string; icon: string; color: string } | null; createdAt: string }
export interface PersonEntry { id: string; type: 'THEY_OWE_ME' | 'I_OWE_THEM'; description: string; amount: number; date: string; isSettled: boolean; settledAt: string | null; notes: string | null; installmentTotal: number | null; installmentCurrent: number | null; installmentGroupId: string | null; settledTransactionId: string | null; category: { id: string; name: string; icon: string; color: string } | null; categoryId: string | null; personId: string; userId: string; createdAt: string; updatedAt: string }
// PersonEntryRow with date as Date — used by components that expect Prisma types
export type PersonEntryRow = Omit<PersonEntry, 'date' | 'settledAt' | 'createdAt'> & { date: Date | string; settledAt: Date | string | null; createdAt: Date | string }
export interface IncomeSource { id: string; name: string; type: string; amount: number; isRecurring: boolean; dayOfMonth: number | null; startDate: string | null; notes: string | null; lastAutoPayMonth: string | null; categoryId: string | null; category: Category | null; createdAt: string; updatedAt: string; userId: string }
export interface RecurringTransaction { id: string; name: string; amount: number; type: 'INCOME' | 'EXPENSE'; frequency: string; isActive: boolean; dayOfMonth: number | null; description: string | null; lastAutoMonth: string | null; category: Category; categoryId: string; createdAt: string; updatedAt: string; userId: string }
export interface UpcomingPersonPayable { id: string; description: string; amount: number; date: string; person: { name: string } }
export interface MonthIncomeTransaction extends Transaction { isRecurringIncome: boolean }
export interface MonthlyHistory { month: string; income: number; expense: number }
export interface TopCategory { name: string; icon: string; color: string; amount: number; pct: number }
export interface DashboardData { userName: string; monthBalance: number; monthIncome: number; monthExpense: number; incomeChange: number; expenseChange: number; totalReceivable: number; totalPeopleReceivable: number; totalIncomeReceivable: number; recentTransactions: Transaction[]; monthIncomeTransactions: MonthIncomeTransaction[]; monthPeopleReceived: UpcomingPersonPayable[]; goals: Goal[]; upcomingBills: Bill[]; upcomingPersonPayables: UpcomingPersonPayable[]; futurePersonPayables: UpcomingPersonPayable[]; upcomingPeopleReceivable: UpcomingPersonPayable[]; pendingIncomeSources: { id: string; name: string; amount: number; isRecurring: boolean; dayOfMonth: number | null }[]; pendingBillsCount: number; pendingBillsAmount: number; personPayablesAmount: number; overdueCount: number; overBudgetCount: number; projections: ProjectionMonth[]; mood: string; monthlyHistory: MonthlyHistory[]; topCategories: TopCategory[]; insight: string }
export type ProjectionBreakdownItem = { id: string; label: string; amount: number; icon?: string }
export interface ProjectionMonth {
  month: string; projectedIncome: number; projectedExpense: number; projectedBalance: number
  incomeItems?:  { sources: ProjectionBreakdownItem[]; recurring: ProjectionBreakdownItem[]; people: ProjectionBreakdownItem[] }
  expenseItems?: { bills: ProjectionBreakdownItem[]; recurring: ProjectionBreakdownItem[]; people: ProjectionBreakdownItem[] }
}
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

// ─── Pluggy — Open Finance ────────────────────────────────────────────────────
export interface PluggyItemRecord {
  id: string; itemId: string; connectorId: number; connectorName: string
  status: string; lastSyncAt: string | null; createdAt: string
}
// ─── Achievements ────────────────────────────────────────────────────────────
export type AchievementCategory = 'onboarding' | 'organization' | 'payments' | 'goals' | 'volume' | 'financial'
export interface AchievementItem { slug: string; category: AchievementCategory; icon: string; unlocked: boolean; unlockedAt: string | null; seen: boolean }
export interface AchievementsResponse { achievements: AchievementItem[]; total: number; done: number; unseen: number }
export interface AchievementCheckResponse { newlyUnlocked: { slug: string; icon: string }[] }

export interface PluggyBoleto {
  id: string; description: string; amount: number; date: string
  type: string; status: string
  connectorName: string
  paymentData?: {
    payer?: string; payerDocument?: string
    receiver?: string; receiverDocument?: string
    barCode?: string; reference?: string
    reason?: string; dueDate?: string
  }
}
