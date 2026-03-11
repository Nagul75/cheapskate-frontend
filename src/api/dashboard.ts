import api from "@/lib/axiosInstance";
import { useQuery } from "@tanstack/react-query";

export interface SummaryData {
  income: number;
  expenses: number;
  net: number;
}

export interface CategoryBreakdown {
  category: {
    id: string;
    name: string;
    color: string;
    icon: string;
  } | null;
  spent: number;
  budget: number;
}

export interface CategorySummaryData {
  breakdown: CategoryBreakdown[];
  month: string;
  year: string;
}

export interface TimeData {
  period: string;
  income: number;
  expense: number;
}

export interface TimeSummaryData {
  data: TimeData[];
  granularity: string;
}

export const dashboardApi = {
  getSummary: async (month: number, year: number): Promise<SummaryData> => {
    const { data } = await api.get('/api/dashboard/summary', {
      params: { month, year }
    });
    return data;
  },

  getSummaryByCategory: async (month: number, year: number): Promise<CategorySummaryData> => {
    const { data } = await api.get('/api/dashboard/by-category', {
      params: { month, year }
    });
    return data;
  },

  getSummaryOverTime: async (
    startDate: string,
    endDate: string,
    granularity: 'daily' | 'weekly' = 'daily'
  ): Promise<TimeSummaryData> => {
    const { data } = await api.get('/api/dashboard/over-time', {
      params: { startDate, endDate, granularity }
    });
    return data;
  }
};

// React Query hooks
export const useSummary = (month: number, year: number) => {
  return useQuery({
    queryKey: ['summary', month, year],
    queryFn: () => dashboardApi.getSummary(month, year),
  });
};

export const useSummaryByCategory = (month: number, year: number) => {
  return useQuery({
    queryKey: ['summaryByCategory', month, year],
    queryFn: () => dashboardApi.getSummaryByCategory(month, year),
  });
};

export const useSummaryOverTime = (
  startDate: string,
  endDate: string,
  granularity: 'daily' | 'weekly' = 'daily'
) => {
  return useQuery({
    queryKey: ['summaryOverTime', startDate, endDate, granularity],
    queryFn: () => dashboardApi.getSummaryOverTime(startDate, endDate, granularity),
  });
};