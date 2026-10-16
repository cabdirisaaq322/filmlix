export interface ContinueWatchingItem {
  type: 'movie' | 'tv';
  id: number;
  title: string;
  poster_path: string | null;
  season?: number;
  episode?: number;
  updatedAt: number;
}

const STORAGE_KEY = 'sf:continue-watching';
const MAX_ITEMS = 12;

/** Stable empty snapshot for server rendering / hydration */
export const SERVER_CONTINUE_SNAPSHOT: ContinueWatchingItem[] = [];

const listeners = new Set<() => void>();
let cache: ContinueWatchingItem[] | null = null;

function readRaw(): ContinueWatchingItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ContinueWatchingItem[]) : [];
  } catch {
    return [];
  }
}

function invalidate(): void {
  cache = null;
  listeners.forEach((listener) => listener());
}

/** Subscribe to watch-history changes (cross-tab via `storage`, same-tab via `invalidate`) */
export function subscribeContinueWatching(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) invalidate();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function getContinueWatchingSnapshot(): ContinueWatchingItem[] {
  if (cache === null) cache = readRaw();
  return cache;
}

/** Plain read — no caching, no subscription */
export function getContinueWatching(): ContinueWatchingItem[] {
  return readRaw();
}

export function saveContinueWatching(item: Omit<ContinueWatchingItem, 'updatedAt'>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = readRaw().filter((c) => !(c.id === item.id && c.type === item.type));
    const next = [{ ...item, updatedAt: Date.now() }, ...current].slice(0, MAX_ITEMS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    invalidate();
  } catch {
    // localStorage unavailable (private mode / quota) — ignore
  }
}

export function clearContinueWatching(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Local storage may be unavailable in private browsing.
  }
  invalidate();
}