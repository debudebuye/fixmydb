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
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[history] getHistory failed:', err);
    return [];
  }
}

/** Save an analysis result to the backend history. Returns false if the backend is unreachable. */
export async function addToHistory(entry: Omit<HistoryEntry, 'id' | 'timestamp'> & { fullResult?: AnalysisResult }): Promise<boolean> {
  try {
    await api.post('/history', entry);
    return true;
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[history] addToHistory failed:', err);
    return false;
  }
}

/** Delete all saved history entries from the backend. Returns 'success', 'forbidden' (production), or 'error'. */
export async function clearHistory(): Promise<'success' | 'forbidden' | 'error'> {
  try {
    await api.delete('/history');
    return 'success';
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 403) return 'forbidden';
    if (import.meta.env.DEV) console.warn('[history] clearHistory failed:', err);
    return 'error';
  }
}
