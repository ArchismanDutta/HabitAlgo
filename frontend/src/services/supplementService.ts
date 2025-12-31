import { api } from '@/lib/api';
import type {
  Supplement,
  SupplementFormData,
  SupplementLog,
  SupplementAdherence,
  SupplementTiming,
  GymApiResponse
} from '@/types/gym';

const BASE_URL = '/gym/supplements';

export const supplementService = {
  // ===== SUPPLEMENTS =====
  async getSupplements(): Promise<Supplement[]> {
    const response = await api.get<GymApiResponse<Supplement[]>>(BASE_URL);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch supplements');
    }
    return response.data.data;
  },

  async getSupplement(id: string): Promise<Supplement> {
    const response = await api.get<GymApiResponse<Supplement>>(`${BASE_URL}/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch supplement');
    }
    return response.data.data;
  },

  async createSupplement(data: SupplementFormData): Promise<Supplement> {
    const response = await api.post<GymApiResponse<Supplement>>(BASE_URL, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create supplement');
    }
    return response.data.data;
  },

  async updateSupplement(id: string, data: Partial<SupplementFormData>): Promise<Supplement> {
    const response = await api.put<GymApiResponse<Supplement>>(`${BASE_URL}/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update supplement');
    }
    return response.data.data;
  },

  async deleteSupplement(id: string): Promise<void> {
    const response = await api.delete<GymApiResponse<void>>(`${BASE_URL}/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete supplement');
    }
  },

  // ===== SUPPLEMENT LOGS =====
  async logSupplement(supplementId: string, date: string, timing: SupplementTiming, taken: boolean, amount?: string, notes?: string): Promise<SupplementLog> {
    const response = await api.post<GymApiResponse<SupplementLog>>(`${BASE_URL}/logs`, {
      supplementId,
      date,
      timing,
      taken,
      amount,
      notes
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to log supplement');
    }
    return response.data.data;
  },

  async getSupplementLogs(params?: { date?: string; supplementId?: string; startDate?: string; endDate?: string }): Promise<SupplementLog[]> {
    const response = await api.get<GymApiResponse<SupplementLog[]>>(`${BASE_URL}/logs`, { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch supplement logs');
    }
    return response.data.data;
  },

  async updateSupplementLog(id: string, data: { taken: boolean; amount?: string; notes?: string }): Promise<SupplementLog> {
    const response = await api.put<GymApiResponse<SupplementLog>>(`${BASE_URL}/logs/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update supplement log');
    }
    return response.data.data;
  },

  async deleteSupplementLog(id: string): Promise<void> {
    const response = await api.delete<GymApiResponse<void>>(`${BASE_URL}/logs/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete supplement log');
    }
  },

  async getAdherenceStats(params?: { startDate?: string; endDate?: string }): Promise<SupplementAdherence[]> {
    const response = await api.get<GymApiResponse<SupplementAdherence[]>>(`${BASE_URL}/adherence`, { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch adherence stats');
    }
    return response.data.data;
  },
};
