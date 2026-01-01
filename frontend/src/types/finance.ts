/**
 * Finance Types - Personal Finance Operating System (PFOS)
 */

// ============================================
// ACCOUNT TYPES
// ============================================

export type AccountType =
  | 'bank_checking'
  | 'bank_savings'
  | 'credit_card'
  | 'wallet'
  | 'cash'
  | 'investment'
  | 'loan'
  | 'goal';

export type AccountSubtype =
  | 'emergency_fund'
  | 'travel_fund'
  | 'house_fund'
  | 'education_fund'
  | 'retirement'
  | 'other';

export interface FinancialAccount {
  _id: string;
  userId: string;
  name: string;
  type: AccountType;
  subtype?: AccountSubtype | null;
  currency: string;
  currentBalance: number;
  creditLimit?: number | null;
  originalAmount?: number | null;
  targetAmount?: number | null;
  targetDate?: string | null;
  accountNumber?: string | null;
  bankName?: string | null;
  color: string;
  icon: string;
  isActive: boolean;
  lastTransactionDate?: string | null;
  availableCredit?: number | null;
  goalProgress?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface NetWorthData {
  assets: number;
  liabilities: number;
  netWorth: number;
}

// ============================================
// TRANSACTION TYPES
// ============================================

export type TransactionType =
  | 'expense'
  | 'income'
  | 'transfer'
  | 'credit_card_payment'
  | 'loan_payment'
  | 'investment'
  | 'withdrawal'
  | 'deposit';

export type PaymentMethod =
  | 'cash'
  | 'card'
  | 'upi'
  | 'bank_transfer'
  | 'cheque'
  | 'other';

export interface FinancialTransaction {
  _id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  date: string;
  time?: string | null;
  accountId: string | FinancialAccount;
  toAccountId?: string | FinancialAccount | null;
  category?: string;
  subcategory?: string | null;
  merchant?: string | null;
  description?: string | null;
  tags?: string[];
  isRecurring: boolean;
  recurringTemplateId?: string | null;
  paymentMethod: PaymentMethod;
  isImpulsive: boolean;
  isPlanned: boolean;
  impulseScore: number;
  linkedHabitId?: string | null;
  mood?: number | null;
  location?: string | null;
  attachments?: TransactionAttachment[];
  budgetId?: string | null;
  reconciled: boolean;
  autoCategorized: boolean;
  userCorrected: boolean;
  originalCategory?: string | null;
  isDeleted: boolean;
  dayOfWeek?: string;
  hourOfDay?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionAttachment {
  filename: string;
  url: string;
  uploadedAt: string;
}

export interface ImpulseDetectionResult {
  isImpulsive: boolean;
  score: number;
  reasons: ImpulseReason[];
  confidence: 'very_low' | 'low' | 'medium' | 'high';
}

export interface ImpulseReason {
  factor: string;
  score: number;
  description: string;
}

// ============================================
// LEDGER TYPES
// ============================================

export type EntryType = 'debit' | 'credit';

export interface LedgerEntry {
  _id: string;
  userId: string;
  transactionId: string;
  date: string;
  accountId?: string | null;
  entryType: EntryType;
  amount: number;
  category?: string | null;
  subcategory?: string | null;
  description?: string | null;
  merchant?: string | null;
  tags?: string[];
  reconciled: boolean;
  createdAt: string;
}

// ============================================
// BUDGET TYPES
// ============================================

export type BudgetType = 'category' | 'subcategory' | 'merchant' | 'total';
export type BudgetPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type BudgetStatus = 'ok' | 'warning' | 'exceeded';

export interface Budget {
  _id: string;
  userId: string;
  name: string;
  type: BudgetType;
  category?: string;
  subcategory?: string | null;
  merchant?: string | null;
  period: BudgetPeriod;
  limit: number;
  amount: number; // Same as limit - budget amount
  currentSpent: number;
  spent: number; // Same as currentSpent - amount spent
  alertThreshold: number;
  alertSent: boolean;
  rolloverUnused: boolean;
  allowRollover: boolean; // Same as rolloverUnused
  carryOver: number;
  startDate: string;
  endDate?: string | null;
  color: string;
  icon: string;
  isActive: boolean;
  lastResetDate: string;
  remaining: number;
  percentageUsed: number;
  status: BudgetStatus;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// RECURRING TRANSACTION TYPES
// ============================================

export type RecurringType =
  | 'sip'
  | 'emi'
  | 'subscription'
  | 'salary'
  | 'bill'
  | 'rent'
  | 'other';

export type RecurringFrequency =
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly';

export interface RecurringTransaction {
  _id: string;
  userId: string;
  name: string;
  type: TransactionType;
  recurringType: RecurringType;
  amount: number;
  frequency: RecurringFrequency;
  dayOfMonth?: number;
  dayOfWeek?: number | null;
  accountId: string | FinancialAccount;
  toAccountId?: string | FinancialAccount | null;
  category?: string;
  subcategory?: string | null;
  merchant?: string | null;
  description?: string | null;
  tags?: string[];
  startDate: string;
  endDate?: string | null;
  totalInstallments?: number | null;
  completedInstallments: number;
  autoCreate: boolean;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
  lastCreatedDate?: string | null;
  nextScheduledDate?: string | null;
  color: string;
  icon: string;
  isActive: boolean;
  progress?: number | null;
  remainingInstallments?: number | null;
  totalAmount?: number | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// GOAL TYPES
// ============================================

export type GoalType =
  | 'savings'
  | 'debt_payoff'
  | 'investment'
  | 'purchase'
  | 'emergency_fund'
  | 'other';

export interface FinancialGoal {
  _id: string;
  userId: string;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  linkedAccountId?: string | null;
  targetDate: string;
  monthlyContribution: number;
  priority: number;
  description?: string | null;
  category?: string | null;
  color: string;
  icon: string;
  milestones?: GoalMilestone[];
  isActive: boolean;
  isAchieved: boolean;
  achievedDate?: string | null;
  progressPercentage: number;
  remainingAmount: number;
  daysRemaining: number;
  requiredMonthlySavings: number;
  onTrack: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GoalMilestone {
  name: string;
  amount: number;
  achieved: boolean;
  achievedDate?: string;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface FinancialSummary {
  _id: string;
  userId: string;
  year: number;
  month: number;
  totalIncome: number;
  incomeByCategory: CategoryBreakdown[];
  totalExpenses: number;
  expensesByCategory: CategoryBreakdown[];
  netSavings: number;
  savingsRate: number;
  totalTransactions: number;
  incomeTransactions: number;
  expenseTransactions: number;
  transferTransactions: number;
  avgDailyExpense: number;
  avgTransactionAmount: number;
  largestExpense?: LargestTransaction;
  largestIncome?: LargestTransaction;
  expensesByDay: DayExpense[];
  paymentMethodBreakdown: PaymentMethodBreakdown[];
  // impulseSpending: number; // Total impulse spending amount
  impulsePercentage: number; // Percentage of impulse spending
  impulseSummary?: ImpulseSpendingSummary; // Alternative structure
  impulseSpending?: number | ImpulseAnalysis;
  budgetAdherence: BudgetAdherenceSummary;
  accountBalances: AccountBalance[];
  netWorth: number;
  topSpendingDays: TopSpendingDay[];
  dayOfWeekPattern: DayOfWeekPattern[];
  healthScore: number;
  calculatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  total: number; // Same as amount
  count: number;
  avgAmount?: number;
}

export interface LargestTransaction {
  amount: number;
  category: string;
  description?: string;
  date: string;
}

export interface DayExpense {
  date: string;
  amount: number;
  count: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  amount: number;
  count: number;
}

export interface ImpulseSpendingSummary {
  total: number;
  count: number;
  percentage: number;
}

export interface BudgetAdherenceSummary {
  totalBudget: number;
  totalSpent: number;
  adherenceRate: number;
}

export interface AccountBalance {
  accountId: string;
  accountName: string;
  balance: number;
}

export interface TopSpendingDay {
  date: string;
  amount: number;
  transactionCount: number;
}

export interface DayOfWeekPattern {
  day: string;
  avgSpending: number;
  transactionCount: number;
}

export interface SpendingTrend {
  year: number;
  month: number;
  monthName: string;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  healthScore: number;
}

export interface DayOfWeekSpending {
  day: string;
  total: number;
  count: number;
  average: number;
}

export interface TimeOfDaySpending {
  timeRange: string;
  total: number;
  count: number;
  average: number;
}

export interface ImpulseAnalysis {
  totalExpenses: number;
  totalImpulse: number;
  impulsePercentage: number;
  impulseCount: number;
  totalCount: number;
  avgImpulseAmount: number;
  topCategories: CategoryBreakdown[];
}

export interface TopMerchant {
  merchant: string;
  total: number;
  count: number;
  avgAmount: number;
}

// ============================================
// CORRELATION TYPES
// ============================================

export interface HabitFinanceCorrelation {
  habitId: string;
  habitName: string;
  habitCategory: string;
  avgSpendingWhenCompleted: number;
  avgSpendingWhenNotCompleted: number;
  spendingImpact: number;
  avgImpulseWhenCompleted: number;
  avgImpulseWhenNotCompleted: number;
  impulseImpact: number;
  completedDays: number;
  notCompletedDays: number;
  significance: 'low' | 'medium' | 'high';
}

export interface OverallCorrelation {
  avgSpendingHighCompletion: number;
  avgSpendingLowCompletion: number;
  impact: number;
  highCompletionDays: number;
  lowCompletionDays: number;
}

export interface MoodCorrelation {
  moodRange: string;
  avgSpending: number;
  days: number;
}

export interface CategoryCorrelation {
  category: string;
  totalSpending: number;
  transactionCount: number;
  impulsePercentage: number;
  avgDailyCompletionRate: number;
  daysWithSpending: number;
}

export interface CorrelationData {
  habitCorrelations: HabitFinanceCorrelation[];
  overallCorrelation: OverallCorrelation | null;
  moodCorrelation: MoodCorrelation[];
  categoryCorrelations: CategoryCorrelation[];
  dateRange: {
    start: string;
    end: string;
    days: number;
  };
}

// ============================================
// MERCHANT MEMORY TYPES
// ============================================

export interface MerchantMemory {
  _id: string;
  userId: string;
  merchantName: string;
  originalNames: string[];
  category: string;
  subcategory?: string | null;
  confidenceScore: number;
  useCount: number;
  correctionCount: number;
  lastUsedDate: string;
  averageAmount: number;
  typicalPaymentMethod?: PaymentMethod | null;
  typicalTags: string[];
  isRecurring: boolean;
  suggestedFrequency?: RecurringFrequency | null;
  autoApply: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// FORM DATA TYPES
// ============================================

export interface AccountFormData {
  name: string;
  type: AccountType;
  subtype?: AccountSubtype | null;
  currency?: string;
  creditLimit?: number | null;
  originalAmount?: number | null;
  targetAmount?: number | null;
  targetDate?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

export interface TransactionFormData {
  type: TransactionType;
  amount: number;
  date: string;
  time?: string;
  accountId: string;
  toAccountId?: string | null;
  category?: string;
  subcategory?: string | null;
  merchant?: string | null;
  description?: string | null;
  tags?: string[];
  paymentMethod?: PaymentMethod;
  isPlanned?: boolean;
  linkedHabitId?: string | null;
  mood?: number | null;
  location?: string | null;
}

export interface BudgetFormData {
  name?: string;
  type: BudgetType;
  category?: string;
  subcategory?: string | null;
  merchant?: string | null;
  period: BudgetPeriod;
  limit: number;
  amount?: number; // Same as limit
  alertThreshold?: number;
  rolloverUnused?: boolean;
  allowRollover?: boolean; // Same as rolloverUnused
  startDate?: string;
  endDate?: string | null;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

export interface RecurringFormData {
  name: string;
  type: TransactionType;
  recurringType: RecurringType;
  amount: number;
  frequency: RecurringFrequency;
  dayOfMonth?: number;
  dayOfWeek?: number | null;
  accountId: string;
  toAccountId?: string | null;
  category?: string;
  subcategory?: string | null;
  merchant?: string | null;
  description?: string | null;
  tags?: string[];
  startDate: string;
  endDate?: string | null;
  totalInstallments?: number | null;
  autoCreate?: boolean;
  reminderEnabled?: boolean;
  reminderDaysBefore?: number;
  color?: string;
  icon?: string;
}

export interface GoalFormData {
  name: string;
  type: GoalType;
  targetAmount: number;
  linkedAccountId?: string | null;
  targetDate: string;
  monthlyContribution?: number;
  priority?: number;
  description?: string | null;
  category?: string | null;
  color?: string;
  icon?: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface FinanceApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  total?: number;
  message?: string;
  error?: string;
  errors?: any[]; // For bulk operations
  resetCount?: number; // For budget reset
}

// ============================================
// CONSTANTS
// ============================================

export const EXPENSE_CATEGORIES = [
  'groceries',
  'dining_out',
  'transportation',
  'utilities',
  'rent',
  'entertainment',
  'shopping',
  'health',
  'education',
  'insurance',
  'travel',
  'fitness',
  'subscriptions',
  'gifts',
  'personal_care',
  'home_improvement',
  'pets',
  'charity',
  'other'
] as const;

export const INCOME_CATEGORIES = [
  'salary',
  'freelance',
  'business',
  'investment',
  'rental',
  'gifts',
  'refund',
  'other'
] as const;

export const TRANSACTION_COLORS = {
  expense: '#ef4444',
  income: '#10b981',
  transfer: '#3b82f6',
  credit_card_payment: '#f59e0b',
  loan_payment: '#f59e0b',
  investment: '#8b5cf6',
  withdrawal: '#6366f1',
  deposit: '#06b6d4'
} as const;