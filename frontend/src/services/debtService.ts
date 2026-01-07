import { api } from '@/lib/api';
import type {
  Debt,
  DebtFormData,
  DebtPaymentFormData,
  DebtSummary,
  DebtBreakdown,
  DebtPayoffProgress,
  DebtProjection,
  DebtPayment,
  FinanceApiResponse
} from '@/types/finance';

const BASE_URL = '/finance/debts';

export const debtService = {
  // ===== CRUD Operations =====

  async createDebt(data: DebtFormData): Promise<Debt> {
    const response = await api.post<FinanceApiResponse<Debt>>(BASE_URL, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create debt');
    }
    return response.data.data;
  },

  async getDebts(params?: {
    status?: string;
    debtType?: string;
    active?: boolean;
  }): Promise<Debt[]> {
    const response = await api.get<FinanceApiResponse<Debt[]>>(BASE_URL, { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch debts');
    }
    return response.data.data;
  },

  async getDebt(id: string): Promise<Debt> {
    const response = await api.get<FinanceApiResponse<Debt>>(`${BASE_URL}/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch debt');
    }
    return response.data.data;
  },

  async updateDebt(id: string, data: Partial<DebtFormData>): Promise<Debt> {
    const response = await api.put<FinanceApiResponse<Debt>>(`${BASE_URL}/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update debt');
    }
    return response.data.data;
  },

  async deleteDebt(id: string): Promise<void> {
    const response = await api.delete<FinanceApiResponse<void>>(`${BASE_URL}/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete debt');
    }
  },

  // ===== Payment Tracking =====

  async recordPayment(id: string, data: DebtPaymentFormData): Promise<{
    debt: Debt;
    paymentDetails: {
      amount: number;
      principalPaid: number;
      interestPaid: number;
      remainingBalance: number;
    };
  }> {
    const response = await api.post<FinanceApiResponse<{
      debt: Debt;
      paymentDetails: {
        amount: number;
        principalPaid: number;
        interestPaid: number;
        remainingBalance: number;
      };
    }>>(`${BASE_URL}/${id}/payments`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to record payment');
    }
    return response.data.data;
  },

  async getPayments(id: string): Promise<{
    debtName: string;
    payments: DebtPayment[];
  }> {
    const response = await api.get<FinanceApiResponse<{
      debtName: string;
      payments: DebtPayment[];
    }>>(`${BASE_URL}/${id}/payments`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch payments');
    }
    return response.data.data;
  },

  async deletePayment(debtId: string, paymentId: string): Promise<Debt> {
    const response = await api.delete<FinanceApiResponse<Debt>>(
      `${BASE_URL}/${debtId}/payments/${paymentId}`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to delete payment');
    }
    return response.data.data;
  },

  // ===== Analytics =====

  async getDebtSummary(): Promise<DebtSummary> {
    const response = await api.get<FinanceApiResponse<DebtSummary>>(`${BASE_URL}/summary`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch debt summary');
    }
    return response.data.data;
  },

  async getDebtBreakdown(): Promise<DebtBreakdown[]> {
    const response = await api.get<FinanceApiResponse<DebtBreakdown[]>>(`${BASE_URL}/breakdown`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch debt breakdown');
    }
    return response.data.data;
  },

  async getPayoffProgress(): Promise<DebtPayoffProgress[]> {
    const response = await api.get<FinanceApiResponse<DebtPayoffProgress[]>>(
      `${BASE_URL}/payoff-progress`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch payoff progress');
    }
    return response.data.data;
  },

  async getDebtProjection(id: string): Promise<DebtProjection> {
    const response = await api.get<FinanceApiResponse<DebtProjection>>(
      `${BASE_URL}/${id}/projection`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch debt projection');
    }
    return response.data.data;
  },
};
