'use client';

import { useState, useEffect, useCallback } from 'react';

export function useBlockedMovieIds(): number[] {
  const [ids, setIds] = useState<number[]>([]);

  const fetchBlockedIds = useCallback(() => {
    let cancelled = false;

    fetch(`/api/blocked-movies?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success && Array.isArray(data.blocked)) {
          setIds(data.blocked);
        }
      })
      .catch((err) => {
        console.error('[useBlockedMovieIds] Error fetching blocked IDs:', err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const cleanup = fetchBlockedIds();

    const handleUpdate = () => {
      fetchBlockedIds();
    };

    window.addEventListener('blocklist-updated', handleUpdate);
    return () => {
      cleanup?.();
      window.removeEventListener('blocklist-updated', handleUpdate);
    };
  }, [fetchBlockedIds]);

  return ids;
}
