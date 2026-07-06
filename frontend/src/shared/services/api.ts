import axios from 'axios';
import type { AnalysisResult, ExampleSchema } from '../types/schema';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 120000,
});

export interface AIConfigPayload {
  provider: string;
  model: string;
  baseURL: string;
  apiKey: string;
}

export const analyzeSchema = async (sql: string, dialect: string = 'postgresql', deviceId?: string, aiConfig?: AIConfigPayload): Promise<AnalysisResult> => {
  const response = await api.post<AnalysisResult>('/analyze', { sql, dialect, deviceId, aiConfig });
  return response.data;
};

export const uploadSchemaFile = async (file: File): Promise<{ sql: string; filename: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getExampleSchemas = async (): Promise<ExampleSchema[]> => {
  const response = await api.get<ExampleSchema[]>('/schema/examples');
  return response.data;
};

export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export interface RecentAnalysis {
  analysesId: string;
  deviceId: string | null;
  createdAt: string;
}

export interface LiveStats {
  totalUsers: number;
  totalSchemasProcessed: number;
  recentAnalyses: RecentAnalysis[];
}

export const fetchStats = async (): Promise<LiveStats> => {
  const response = await api.get<LiveStats>('/stats');
  return response.data;
};

export default api;
