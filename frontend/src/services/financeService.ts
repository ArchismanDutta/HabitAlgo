import api from '../lib/api';
import type {
  FinancialAccount,
  FinancialTransaction,
  Budget,
  RecurringTransaction,
  FinancialGoal,
  FinancialSummary,
  NetWorthData,
  SpendingTrend,
  DayOfWeekSpending,
  TimeOfDaySpending,
  ImpulseAnalysis,
  TopMerchant,
  CorrelationData,
  CategoryBreakdown,
  AccountFormData,
  TransactionFormData,
  BudgetFormData,
  RecurringFormData,
  GoalFormData,
  FinanceApiResponse
} from '../types/finance';

// ============================================
// ACCOUNT SERVICES
// ============================================

export const accountService = {
  async getAll(active?: boolean): Promise<FinancialAccount[]> {
    const params = active !== undefined ? { active } : {};
    const response = await api.get<FinanceApiResponse<FinancialAccount[]>>(
      '/finance/accounts',
      { params }
    );
    return response.data.data || [];
  },

  async getById(id: string): Promise<FinancialAccount> {
    const response = await api.get<FinanceApiResponse<FinancialAccount>>(
      `/finance/accounts/${id}`
    );
    return response.data.data!;
  },

  async create(data: AccountFormData): Promise<FinancialAccount> {
    const response = await api.post<FinanceApiResponse<FinancialAccount>>(
      '/finance/accounts',
      data
    );
    return response.data.data!;
  },

  async update(id: string, data: Partial<AccountFormData>): Promise<FinancialAccount> {
    const response = await api.put<FinanceApiResponse<FinancialAccount>>(
      `/finance/accounts/${id}`,
      data
    );
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/finance/accounts/${id}`);
  },

  async getNetWorth(): Promise<NetWorthData> {
    const response = await api.get<FinanceApiResponse<NetWorthData>>(
      '/finance/networth'
    );
    return response.data.data!;
  }
};

// ============================================
// TRANSACTION SERVICES
// ============================================

export const transactionService = {
  async getAll(params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
    category?: string;
    accountId?: string;
    isImpulsive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ transactions: FinancialTransaction[]; total: number }> {
    const response = await api.get<FinanceApiResponse<FinancialTransaction[]>>(
      '/finance/transactions',
      { params }
    );
    return {
      transactions: response.data.data || [],
      total: response.data.total || 0
    };
  },

  async getByDate(date: string): Promise<FinancialTransaction[]> {
    const response = await api.get<FinanceApiResponse<FinancialTransaction[]>>(
      `/finance/transactions/date/${date}`
    );
    return response.data.data || [];
  },

  async getById(id: string): Promise<{
    transaction: FinancialTransaction;
    ledgerEntries: any[];
  }> {
    const response = await api.get<FinanceApiResponse<any>>(
      `/finance/transactions/${id}`
    );
    return response.data.data!;
  },

  async create(data: TransactionFormData): Promise<FinancialTransaction> {
    const response = await api.post<FinanceApiResponse<FinancialTransaction>>(
      '/finance/transactions',
      data
    );
    return response.data.data!;
  },

  async update(id: string, data: Partial<TransactionFormData>): Promise<FinancialTransaction> {
    const response = await api.put<FinanceApiResponse<FinancialTransaction>>(
      `/finance/transactions/${id}`,
      data
    );
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/finance/transactions/${id}`);
  },

  async bulkCreate(transactions: TransactionFormData[]): Promise<{
    created: FinancialTransaction[];
    errors: any[];
  }> {
    const response = await api.post<FinanceApiResponse<any>>(
      '/finance/transactions/bulk',
      { transactions }
    );
    return {
      created: response.data.data || [],
      errors: response.data.errors || []
    };
  }
};

// ============================================
// BUDGET SERVICES
// ============================================

export const budgetService = {
  async getAll(active?: boolean): Promise<Budget[]> {
    const params = active !== undefined ? { active } : {};
    const response = await api.get<FinanceApiResponse<Budget[]>>(
      '/finance/budgets',
      { params }
    );
    return response.data.data || [];
  },

  async getById(id: string): Promise<Budget> {
    const response = await api.get<FinanceApiResponse<Budget>>(
      `/finance/budgets/${id}`
    );
    return response.data.data!;
  },

  async create(data: BudgetFormData): Promise<Budget> {
    const response = await api.post<FinanceApiResponse<Budget>>(
      '/finance/budgets',
      data
    );
    return response.data.data!;
  },

  async update(id: string, data: Partial<BudgetFormData>): Promise<Budget> {
    const response = await api.put<FinanceApiResponse<Budget>>(
      `/finance/budgets/${id}`,
      data
    );
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/finance/budgets/${id}`);
  },

  async recalculate(id: string): Promise<Budget> {
    const response = await api.post<FinanceApiResponse<Budget>>(
      `/finance/budgets/${id}/recalculate`
    );
    return response.data.data!;
  },

  async resetAll(): Promise<{ resetCount: number }> {
    const response = await api.post<FinanceApiResponse<any>>(
      '/finance/budgets/reset'
    );
    return { resetCount: response.data.resetCount || 0 };
  }
};

// ============================================
// RECURRING TRANSACTION SERVICES
// ============================================

export const recurringService = {
  async getAll(active?: boolean): Promise<RecurringTransaction[]> {
    const params = active !== undefined ? { active } : {};
    const response = await api.get<FinanceApiResponse<RecurringTransaction[]>>(
      '/finance/recurring',
      { params }
    );
    return response.data.data || [];
  },

  async getDue(): Promise<RecurringTransaction[]> {
    const response = await api.get<FinanceApiResponse<RecurringTransaction[]>>(
      '/finance/recurring/due'
    );
    return response.data.data || [];
  },

  async getUpcoming(days: number = 7): Promise<RecurringTransaction[]> {
    const response = await api.get<FinanceApiResponse<RecurringTransaction[]>>(
      '/finance/recurring/upcoming',
      { params: { days } }
    );
    return response.data.data || [];
  },

  async create(data: RecurringFormData): Promise<RecurringTransaction> {
    const response = await api.post<FinanceApiResponse<RecurringTransaction>>(
      '/finance/recurring',
      data
    );
    return response.data.data!;
  },

  async update(id: string, data: Partial<RecurringFormData>): Promise<RecurringTransaction> {
    const response = await api.put<FinanceApiResponse<RecurringTransaction>>(
      `/finance/recurring/${id}`,
      data
    );
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/finance/recurring/${id}`);
  },

  async execute(id: string): Promise<{
    transaction: FinancialTransaction;
    recurring: RecurringTransaction;
  }> {
    const response = await api.post<FinanceApiResponse<any>>(
      `/finance/recurring/${id}/execute`
    );
    return response.data.data!;
  },

  async autoExecute(): Promise<{
    executed: any[];
    errors: any[];
  }> {
    const response = await api.post<FinanceApiResponse<any>>(
      '/finance/recurring/auto-execute'
    );
    return {
      executed: response.data.data || [],
      errors: response.data.errors || []
    };
  }
};

// ============================================
// ANALYTICS SERVICES
// ============================================

export const analyticsService = {
  async getSummary(year?: number, month?: number): Promise<FinancialSummary> {
    const params: any = {};
    if (year) params.year = year;
    if (month) params.month = month;

    const response = await api.get<FinanceApiResponse<FinancialSummary>>(
      '/finance/analytics/summary',
      { params }
    );
    return response.data.data!;
  },

  async getTrends(months: number = 6): Promise<SpendingTrend[]> {
    const response = await api.get<FinanceApiResponse<SpendingTrend[]>>(
      '/finance/analytics/trends',
      { params: { months } }
    );
    return response.data.data || [];
  },

  async getCategoryBreakdown(
    year?: number,
    month?: number,
    type: 'expense' | 'income' = 'expense'
  ): Promise<CategoryBreakdown[]> {
    const params: any = { type };
    if (year) params.year = year;
    if (month) params.month = month;

    const response = await api.get<FinanceApiResponse<CategoryBreakdown[]>>(
      '/finance/analytics/categories',
      { params }
    );
    return response.data.data || [];
  },

  async getDayOfWeekSpending(months: number = 3): Promise<DayOfWeekSpending[]> {
    const response = await api.get<FinanceApiResponse<DayOfWeekSpending[]>>(
      '/finance/analytics/day-of-week',
      { params: { months } }
    );
    return response.data.data || [];
  },

  async getTimeOfDaySpending(months: number = 3): Promise<TimeOfDaySpending[]> {
    const response = await api.get<FinanceApiResponse<TimeOfDaySpending[]>>(
      '/finance/analytics/time-of-day',
      { params: { months } }
    );
    return response.data.data || [];
  },

  async getImpulseAnalysis(year?: number, month?: number): Promise<ImpulseAnalysis> {
    const params: any = {};
    if (year) params.year = year;
    if (month) params.month = month;

    const response = await api.get<FinanceApiResponse<ImpulseAnalysis>>(
      '/finance/analytics/impulse',
      { params }
    );
    return response.data.data!;
  },

  async getTopMerchants(year?: number, month?: number, limit: number = 10): Promise<TopMerchant[]> {
    const params: any = { limit };
    if (year) params.year = year;
    if (month) params.month = month;

    const response = await api.get<FinanceApiResponse<TopMerchant[]>>(
      '/finance/analytics/merchants',
      { params }
    );
    return response.data.data || [];
  },

  async recalculateSummary(year?: number, month?: number): Promise<FinancialSummary> {
    const response = await api.post<FinanceApiResponse<FinancialSummary>>(
      '/finance/analytics/recalculate',
      { year, month }
    );
    return response.data.data!;
  }
};

// ============================================
// CORRELATION SERVICES
// ============================================

export const correlationService = {
  async getHabitFinanceCorrelation(
    startDate?: string,
    endDate?: string,
    minSampleSize: number = 5
  ): Promise<CorrelationData> {
    const params: any = { minSampleSize };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await api.get<FinanceApiResponse<CorrelationData>>(
      '/finance/correlations/habits',
      { params }
    );
    return response.data.data!;
  }
};

// ============================================
// GOAL SERVICES
// ============================================

export const goalService = {
  async getAll(active?: boolean, achieved?: boolean): Promise<FinancialGoal[]> {
    const params: any = {};
    if (active !== undefined) params.active = active;
    if (achieved !== undefined) params.achieved = achieved;

    const response = await api.get<FinanceApiResponse<FinancialGoal[]>>(
      '/finance/goals',
      { params }
    );
    return response.data.data || [];
  },

  async getById(id: string): Promise<FinancialGoal> {
    const response = await api.get<FinanceApiResponse<FinancialGoal>>(
      `/finance/goals/${id}`
    );
    return response.data.data!;
  },

  async create(data: GoalFormData): Promise<FinancialGoal> {
    const response = await api.post<FinanceApiResponse<FinancialGoal>>(
      '/finance/goals',
      data
    );
    return response.data.data!;
  },

  async update(id: string, data: Partial<GoalFormData>): Promise<FinancialGoal> {
    const response = await api.put<FinanceApiResponse<FinancialGoal>>(
      `/finance/goals/${id}`,
      data
    );
    return response.data.data!;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/finance/goals/${id}`);
  },

  async addContribution(id: string, amount: number): Promise<FinancialGoal> {
    const response = await api.post<FinanceApiResponse<FinancialGoal>>(
      `/finance/goals/${id}/contribute`,
      { amount }
    );
    return response.data.data!;
  },

  async getStats(): Promise<{
    totalGoals: number;
    activeGoals: number;
    achievedGoals: number;
    onTrackGoals: number;
    offTrackGoals: number;
    totalTargetAmount: number;
    totalCurrentAmount: number;
    totalRemaining: number;
    avgProgress: number;
  }> {
    const response = await api.get<FinanceApiResponse<any>>(
      '/finance/goals/stats/summary'
    );
    return response.data.data!;
  }
};

// Export default object with all services
export default {
  accounts: accountService,
  transactions: transactionService,
  budgets: budgetService,
  recurring: recurringService,
  analytics: analyticsService,
  correlations: correlationService,
  goals: goalService
};
