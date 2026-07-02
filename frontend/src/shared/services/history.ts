const STORAGE_KEY = 'fixmydb_history';
const MAX_ENTRIES = 10;

export interface HistoryEntry {
  id: string;
  timestamp: string;
  healthScore: number;
  tablesFound: number;
  issuesCount: number;
  recommendationsCount: number;
  sqlPreview: string;
  dialect: string;
}

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToHistory(entry: Omit<HistoryEntry, 'id' | 'timestamp'>): void {
  const history = getHistory();
  history.unshift({
    ...entry,
    id: Date.now().toString(36),
    timestamp: new Date().toISOString(),
  });
  if (history.length > MAX_ENTRIES) history.length = MAX_ENTRIES;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // storage full or unavailable
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
