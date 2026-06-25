import axios from 'axios';
import type { AnalysisResult, ExampleSchema } from '../types/schema';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
});

export const analyzeSchema = async (sql: string, dialect: string = 'postgresql'): Promise<AnalysisResult> => {
  const response = await api.post<AnalysisResult>('/analyze', { sql, dialect });
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

export default api;
