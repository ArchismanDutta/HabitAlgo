import { api } from '@/lib/api';
import type {
  HealthReport,
  HealthReportFormData,
  MetricTrendData,
  HealthReportSummary,
  GymApiResponse
} from '@/types/gym';

const BASE_URL = '/gym';

export const healthReportService = {
  // ===== CRUD Operations =====
  async createHealthReport(data: HealthReportFormData): Promise<HealthReport> {
    const response = await api.post<GymApiResponse<HealthReport>>(`${BASE_URL}/health-reports`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to create health report');
    }
    return response.data.data;
  },

  async updateHealthReport(id: string, data: HealthReportFormData): Promise<HealthReport> {
    const response = await api.put<GymApiResponse<HealthReport>>(`${BASE_URL}/health-reports/${id}`, data);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to update health report');
    }
    return response.data.data;
  },

  async getHealthReports(params?: {
    startDate?: string;
    endDate?: string;
    category?: string;
  }): Promise<HealthReport[]> {
    const response = await api.get<GymApiResponse<HealthReport[]>>(`${BASE_URL}/health-reports`, { params });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch health reports');
    }
    return response.data.data;
  },

  async getHealthReport(id: string): Promise<HealthReport> {
    const response = await api.get<GymApiResponse<HealthReport>>(`${BASE_URL}/health-reports/${id}`);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch health report');
    }
    return response.data.data;
  },

  async getLatestHealthReport(): Promise<HealthReport | null> {
    const response = await api.get<GymApiResponse<HealthReport>>(`${BASE_URL}/health-reports/latest`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch latest health report');
    }
    return response.data.data || null;
  },

  async deleteHealthReport(id: string): Promise<void> {
    const response = await api.delete<GymApiResponse<void>>(`${BASE_URL}/health-reports/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to delete health report');
    }
  },

  // ===== Analytics =====
  async getMetricTrend(metricName: string, limit: number = 12): Promise<MetricTrendData> {
    const response = await api.get<GymApiResponse<MetricTrendData>>(
      `${BASE_URL}/health-analytics/trend`,
      { params: { metricName, limit } }
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch metric trend');
    }
    return response.data.data;
  },

  async getAvailableMetrics(): Promise<{ category: string; metrics: string[] }[]> {
    const response = await api.get<GymApiResponse<{ category: string; metrics: string[] }[]>>(
      `${BASE_URL}/health-analytics/metrics`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to fetch available metrics');
    }
    return response.data.data;
  },

  async getLatestReportSummary(): Promise<HealthReportSummary | null> {
    const response = await api.get<GymApiResponse<HealthReportSummary>>(
      `${BASE_URL}/health-reports/summary`
    );
    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch report summary');
    }
    return response.data.data || null;
  },
};
