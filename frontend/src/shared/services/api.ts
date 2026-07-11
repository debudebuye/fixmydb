import axios, { type AxiosRequestConfig } from 'axios';
import type { AnalysisResult, ExampleSchema } from '../types/schema';

// ── Axios client ──
const api = axios.create({
  baseURL: '/api/v1',
  timeout: 120000,
});

// ── Response interceptor: unwrap { success, data, error, meta } envelope ──
api.interceptors.response.use(
  (res) => {
    const body = res.data;
    if (body && typeof body === 'object' && 'success' in body) {
      if (!body.success && body.error) {
        const err = new Error(body.error.message || 'Request failed');
        (err as any).code = body.error.code;
        (err as any).details = body.error.details;
        (err as any).requestId = body.meta?.requestId;
        return Promise.reject(err);
      }
      res.data = body.data;
      (res as any).meta = body.meta;
    }
    return res;
  },
  (error) => {
    if (error.response?.data && typeof error.response.data === 'object' && 'error' in error.response.data) {
      const apiErr = error.response.data.error;
      error.message = apiErr.message || error.message;
      (error as any).code = apiErr.code;
      (error as any).details = apiErr.details;
      (error as any).requestId = error.response.data.meta?.requestId;
    }
    return Promise.reject(error);
  },
);

// ── Retry helper with exponential backoff ──
async function withRetry<T>(fn: () => Promise<T>, retries = 2, baseDelay = 500): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const status = err.response?.status;
      if (status && status >= 400 && status < 500 && status !== 429) throw err;
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError;
}

// ── Public API functions ──

export interface AIConfigPayload {
  provider: string;
  model: string;
  baseURL: string;
  apiKey: string;
}

export const analyzeSchema = async (sql: string, dialect: string = 'postgresql', deviceId?: string, aiConfig?: AIConfigPayload): Promise<AnalysisResult> => {
  const response = await withRetry(() =>
    api.post<AnalysisResult>('/analyze', { sql, dialect, deviceId, aiConfig })
  );
  return response.data;
};

export const uploadSchemaFile = async (files: File[]): Promise<{ sql: string; files: { filename: string; size: number }[]; fileCount: number }> => {
  const formData = new FormData();
  files.forEach(f => formData.append('files', f));
  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getExampleSchemas = async (): Promise<ExampleSchema[]> => {
  const response = await withRetry(() =>
    api.get<ExampleSchema[]>('/schema/examples')
  );
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
  totalDownloads: number;
  recentAnalyses: RecentAnalysis[];
}

export const fetchStats = async (): Promise<LiveStats> => {
  const response = await api.get<LiveStats>('/stats');
  return response.data;
};

export const trackDownloadEvent = async (deviceId: string | null, type: string = 'sql') => {
  try {
    await api.post('/stats/download', { deviceId, type });
  } catch {
    // fire-and-forget
  }
};

export default api;
