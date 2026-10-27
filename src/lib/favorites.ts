export interface FavoriteItem {
  type: 'movie' | 'tv';
  id: number;
  title: string;
  poster_path: string | null;
}

const STORAGE_KEY = 'sf:favorites';

const listeners = new Set<() => void>();
let cache: FavoriteItem[] | null = null;

function readRaw(): FavoriteItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FavoriteItem[]) : [];
  } catch {
    return [];
  }
}

function invalidate(): void {
  cache = null;
  listeners.forEach((listener) => listener());
}

export function subscribeFavorites(listener: () => void): () => void {
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

export function getFavoritesSnapshot(): FavoriteItem[] {
  if (cache === null) cache = readRaw();
  return cache;
}

export function getFavorites(): FavoriteItem[] {
  return readRaw();
}

export function isFavorite(type: 'movie' | 'tv', id: number): boolean {
  return readRaw().some((f) => f.type === type && f.id === id);
}

export function toggleFavorite(item: FavoriteItem): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const current = readRaw();
    const exists = current.some((f) => f.type === item.type && f.id === item.id);
    const next = exists
      ? current.filter((f) => !(f.type === item.type && f.id === item.id))
      : [item, ...current];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    invalidate();
    return !exists;
  } catch {
    return false;
  }
}

export function removeFavorite(type: 'movie' | 'tv', id: number): void {
  if (typeof window === 'undefined') return;
  try {
    const next = readRaw().filter((f) => !(f.type === type && f.id === id));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    invalidate();
  } catch {
    // ignore
  }
}
