import api from './api';
import type { AnalysisResult } from '../types/schema';

export interface HistoryEntry {
  id: string;
  timestamp: string;
  healthScore: number;
  tablesFound: number;
  issuesCount: number;
  recommendationsCount: number;
  sqlPreview: string;
  dialect: string;
  fullResult?: AnalysisResult;
}

export async function getHistory(): Promise<HistoryEntry[]> {
  try {
    const { data } = await api.get<HistoryEntry[]>('/history');
    return data;
  } catch {
    return [];
  }
}

export async function addToHistory(entry: Omit<HistoryEntry, 'id' | 'timestamp'> & { fullResult?: AnalysisResult }): Promise<void> {
  try {
    await api.post('/history', {
      ...entry,
      id: Date.now().toString(36),
      timestamp: new Date().toISOString(),
    });
  } catch {
    // offline fallback
  }
}

export async function clearHistory(): Promise<void> {
  try {
    await api.delete('/history');
  } catch {
    // offline fallback
  }
}
