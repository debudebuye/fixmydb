import api from './api';
import type { AnalysisResult } from '../types/schema';

/** A saved analysis result stored on the backend for later review. */
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

/** Fetch all saved analysis entries from the backend. Returns empty array on failure. */
export async function getHistory(): Promise<HistoryEntry[]> {
  try {
    const { data } = await api.get<HistoryEntry[]>('/history');
    return data;
  } catch {
    return [];
  }
}

/** Save an analysis result to the backend history. Silently fails if offline. */
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

/** Delete all saved history entries from the backend. */
export async function clearHistory(): Promise<void> {
  try {
    await api.delete('/history');
  } catch {
    // offline fallback
  }
}
