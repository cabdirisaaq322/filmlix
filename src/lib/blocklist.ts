import { BLOCKLISTED_MOVIE_IDS } from './tmdb';

export interface BlockedMovie {
  id: string;
  tmdbId: number;
  type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  reason: string;
  is_blocked: boolean;
  active: boolean; // alias for is_blocked
  status: 'hidden' | 'visible';
  createdAt: number;
  updatedAt?: number;
}

export async function getBlockedMovies(): Promise<BlockedMovie[]> {
  const res = await fetch(`/api/admin/block?t=${Date.now()}`, {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch blocked titles from server');
  }

  const data = await res.json();
  return (data.items || []).map((r: any) => ({
    id: r.id,
    tmdbId: Number(r.tmdbId),
    type: r.type,
    title: r.title,
    poster_path: r.poster_path ?? null,
    reason: r.reason || '',
    is_blocked: r.is_blocked !== undefined ? Boolean(r.is_blocked) : Boolean(r.active),
    active: r.active !== undefined ? Boolean(r.active) : Boolean(r.is_blocked),
    status: r.status || (r.is_blocked ? 'hidden' : 'visible'),
    createdAt: r.createdAt || Date.now(),
    updatedAt: r.updatedAt || Date.now(),
  }));
}

export async function addBlockedMovie(item: Omit<BlockedMovie, 'id' | 'createdAt'>): Promise<string> {
  const payload = {
    ...item,
    is_blocked: item.is_blocked !== undefined ? item.is_blocked : true,
    active: item.active !== undefined ? item.active : true,
    status: item.status || 'hidden',
  };

  const res = await fetch('/api/admin/block', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to add title to blocklist');
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('blocklist-updated'));
  }

  return data.item.id;
}

export async function toggleBlockedMovie(id: string, active: boolean): Promise<void> {
  const payload = {
    id,
    active,
    is_blocked: active,
    status: active ? 'hidden' : 'visible',
  };

  const res = await fetch('/api/admin/block', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to update title status');
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('blocklist-updated'));
  }
}

export async function removeBlockedMovie(id: string): Promise<void> {
  const res = await fetch(`/api/admin/block?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to remove title from blocklist');
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('blocklist-updated'));
  }
}

export function isBlocked(movies: BlockedMovie[], type: 'movie' | 'tv', tmdbId: number): boolean {
  if (BLOCKLISTED_MOVIE_IDS.includes(tmdbId)) return true;
  return movies.some(
    (m) => (m.active || m.is_blocked || m.status === 'hidden') && m.type === type && m.tmdbId === tmdbId
  );
}
