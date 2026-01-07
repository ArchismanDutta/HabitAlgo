import { create } from 'zustand';
import { HealthReport, HealthReportFormData, MetricTrendData, HealthReportSummary } from '@/types/gym';
import { healthReportService } from '@/services/healthReportService';

interface HealthReportStore {
  reports: HealthReport[];
  latestReport: HealthReport | null;
  reportSummary: HealthReportSummary | null;
  selectedMetricTrend: MetricTrendData | null;
  availableMetrics: { category: string; metrics: string[] }[];
  loading: boolean;
  error: string | null;

  // CRUD operations
  fetchReports: (params?: { startDate?: string; endDate?: string }) => Promise<void>;
  fetchLatestReport: () => Promise<void>;
  fetchReportSummary: () => Promise<void>;
  createReport: (data: HealthReportFormData) => Promise<void>;
  updateReport: (id: string, data: HealthReportFormData) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;

  // Analytics
  fetchAvailableMetrics: () => Promise<void>;
  fetchMetricTrend: (metricName: string, limit?: number) => Promise<void>;
}

export const useHealthReportStore = create<HealthReportStore>((set, get) => ({
  reports: [],
  latestReport: null,
  reportSummary: null,
  selectedMetricTrend: null,
  availableMetrics: [],
  loading: false,
  error: null,

  fetchReports: async (params?: { startDate?: string; endDate?: string }) => {
    set({ loading: true, error: null });
    try {
      const reports = await healthReportService.getHealthReports(params);
      set({ reports, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchLatestReport: async () => {
    try {
      const latestReport = await healthReportService.getLatestHealthReport();
      set({ latestReport });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchReportSummary: async () => {
    try {
      const reportSummary = await healthReportService.getLatestReportSummary();
      set({ reportSummary });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  createReport: async (data: HealthReportFormData) => {
    set({ loading: true, error: null });
    try {
      const report = await healthReportService.createHealthReport(data);

      // Add new report to the list
      set((state) => ({
        reports: [report, ...state.reports],
        latestReport: report,
        loading: false
      }));

      // Refresh summary and metrics
      get().fetchReportSummary();
      get().fetchAvailableMetrics();
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateReport: async (id: string, data: HealthReportFormData) => {
    set({ loading: true, error: null });
    try {
      const report = await healthReportService.updateHealthReport(id, data);

      // Update the report in the list
      set((state) => ({
        reports: state.reports.map((r) => r._id === id ? report : r),
        loading: false
      }));

      // Refresh summary and metrics
      get().fetchReportSummary();
      get().fetchAvailableMetrics();
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteReport: async (id: string) => {
    try {
      await healthReportService.deleteHealthReport(id);
      set((state) => ({
        reports: state.reports.filter((r) => r._id !== id)
      }));
      get().fetchReportSummary();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  fetchAvailableMetrics: async () => {
    try {
      const availableMetrics = await healthReportService.getAvailableMetrics();
      set({ availableMetrics });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  fetchMetricTrend: async (metricName: string, limit: number = 12) => {
    set({ loading: true, error: null });
    try {
      const selectedMetricTrend = await healthReportService.getMetricTrend(metricName, limit);
      set({ selectedMetricTrend, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));
