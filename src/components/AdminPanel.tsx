'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, List, AlertTriangle, ShieldAlert, LogOut, Eye, EyeOff, RefreshCw, Loader2 } from 'lucide-react';
import { signOut, isAdmin, onAuthStateChange, getCurrentUser } from '@/lib/auth';
import {
  getBlockedMovies,
  addBlockedMovie,
  toggleBlockedMovie,
  removeBlockedMovie,
  type BlockedMovie,
} from '@/lib/blocklist';
import { getMovieDetails, getTVDetails, getPosterUrl } from '@/lib/tmdb';

export function AdminPanel() {
  const router = useRouter();
  const [user, setUser] = useState(getCurrentUser());
  const [movies, setMovies] = useState<BlockedMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [newTmdbId, setNewTmdbId] = useState('');
  const [newType, setNewType] = useState<'movie' | 'tv'>('movie');
  const [newTitle, setNewTitle] = useState('');
  const [newPoster, setNewPoster] = useState<string | null>(null);
  const [newReason, setNewReason] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadMovies = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await getBlockedMovies();
      setMovies(list);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load blocked titles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChange((u) => {
      setUser(u);
      if (!u || !isAdmin(u)) {
        setMovies([]);
        setLoading(false);
        return;
      }
      void loadMovies();
    });
    return () => unsub();
  }, [loadMovies]);

  useEffect(() => {
    const id = parseInt(newTmdbId, 10);
    if (!id || isNaN(id)) {
      setTimeout(() => { setNewTitle(''); setNewPoster(null); }, 0);
      return;
    }
    let cancelled = false;
    setTimeout(() => setLookupLoading(true), 0);
    const fetchDetails = async () => {
      try {
        const details = newType === 'movie' ? await getMovieDetails(id) : await getTVDetails(id);
        if (!cancelled) {
          setNewTitle(details.title || details.name || '');
          setNewPoster(details.poster_path || null);
        }
      } catch {
        if (!cancelled) setTimeout(() => { setNewTitle(''); setNewPoster(null); }, 0);
      } finally {
        if (!cancelled) setTimeout(() => setLookupLoading(false), 0);
      }
    };
    fetchDetails();
    return () => { cancelled = true; };
  }, [newTmdbId, newType]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const tmdbId = parseInt(newTmdbId, 10);
    if (!tmdbId || isNaN(tmdbId) || !newTitle.trim()) {
      setError('Please enter a valid TMDB ID and title.');
      return;
    }
    setLoading(true);
    try {
      await addBlockedMovie({ tmdbId, type: newType, title: newTitle.trim(), poster_path: newPoster, reason: newReason.trim(), is_blocked: true, active: true, status: 'hidden' });
      setSuccess('Title added to blocklist.');
      setNewTmdbId(''); setNewTitle(''); setNewPoster(null); setNewReason('');
      await loadMovies();
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add title.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    setError(''); setSuccess(''); setActionLoadingId(id);
    try {
      await toggleBlockedMovie(id, !currentActive);
      await loadMovies();
      router.refresh();
      setSuccess(currentActive ? 'Title unblocked.' : 'Title blocked.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update title.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm('Remove this title from the blocklist?')) return;
    setError(''); setSuccess(''); setActionLoadingId(id);
    try {
      await removeBlockedMovie(id);
      await loadMovies();
      router.refresh();
      setSuccess('Title removed.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to remove title.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!user || !isAdmin(user)) return null;

  return (
    <div className="min-h-screen bg-[var(--fx-bg)] pt-28 text-white">
      <div className="nf-row-pad w-full py-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="mb-1 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#e5e5e5]">Admin</p>
            <h1 className="text-3xl font-extrabold tracking-tight">Control Panel</h1>
            <p className="text-sm text-zinc-400">Manage blocked titles and availability.</p>
          </div>
          <button onClick={() => signOut()} className="nf-focus inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>

        {error && <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"><AlertTriangle className="h-4 w-4" /> {error}</div>}
        {success && <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"><ShieldAlert className="h-4 w-4" /> {success}</div>}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-400">Add Title</h3>
              <form onSubmit={handleAdd} className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-400">TMDB ID</label>
                  <div className="flex gap-2">
                    <input type="number" value={newTmdbId} onChange={(e) => setNewTmdbId(e.target.value)} className="nf-input h-10 flex-1 text-sm" placeholder="e.g. 550" />
                    <button type="button" onClick={() => { const id = parseInt(newTmdbId, 10); if (id && !isNaN(id)) setNewTmdbId(String(id)); }} disabled={lookupLoading || !newTmdbId} className="nf-focus rounded-lg border border-white/10 bg-white/5 px-3 text-zinc-300 hover:bg-white/10 disabled:opacity-50">
                      {lookupLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {newPoster && (
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2">
                    <img src={getPosterUrl(newPoster, 'w92')} alt={newTitle} className="h-16 w-11 rounded object-cover" />
                    <div><p className="text-sm font-medium text-white">{newTitle}</p><p className="text-xs text-zinc-400">{newType}</p></div>
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-400">Type</label>
                  <select value={newType} onChange={(e) => setNewType(e.target.value as 'movie' | 'tv')} className="nf-input h-10 w-full text-sm">
                    <option value="movie">Movie</option>
                    <option value="tv">TV Show</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-400">Title</label>
                  <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="nf-input h-10 w-full text-sm" placeholder="Title" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-400">Reason</label>
                  <input type="text" value={newReason} onChange={(e) => setNewReason(e.target.value)} className="nf-input h-10 w-full text-sm" placeholder="Reason" />
                </div>
                <button type="submit" disabled={loading} className="nf-focus fx-btn-primary w-full rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50">
                  <Plus className="h-4 w-4" /> Add to blocklist
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Blocked Titles ({movies.length})</h3>
                <button onClick={loadMovies} className="nf-focus inline-flex items-center gap-1.5 text-xs font-medium text-[#e50914] hover:text-[#e5e5e5]"><List className="h-3.5 w-3.5" /> Refresh</button>
              </div>

              {loading ? (
                <div className="flex h-48 items-center justify-center text-sm text-zinc-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…</div>
              ) : movies.length === 0 ? (
                <div className="flex h-48 items-center justify-center text-sm text-zinc-500">No blocked titles yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
                        <th className="pb-3 pr-3">Title</th>
                        <th className="pb-3 pr-3">Type</th>
                        <th className="pb-3 pr-3">Reason</th>
                        <th className="pb-3 pr-3 text-right">Status</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movies.map((m) => (
                        <tr key={m.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="py-3 pr-3">
                            <div className="flex items-center gap-3">
                              {m.poster_path ? <img src={getPosterUrl(m.poster_path, 'w92')} alt={m.title} className="h-12 w-8 rounded object-cover" /> : <div className="h-12 w-8 rounded bg-white/10" />}
                              <div>
                                <p className="text-sm font-medium text-white">{m.title}</p>
                                <p className="text-[11px] font-mono text-zinc-500">#{m.tmdbId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 pr-3 text-xs capitalize text-zinc-400">{m.type}</td>
                          <td className="max-w-[200px] truncate py-3 pr-3 text-sm text-zinc-400">{m.reason || '—'}</td>
                          <td className="py-3 pr-3 text-right">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${m.active ? 'border border-red-500/30 bg-red-500/10 text-red-300' : 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'}`}>
                              {m.active ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}{m.active ? 'Blocked' : 'Visible'}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button disabled={actionLoadingId === m.id} onClick={() => handleToggle(m.id, m.active)} className="nf-focus text-xs font-medium text-[#e50914] hover:text-[#e5e5e5] disabled:opacity-40">{actionLoadingId === m.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : (m.active ? 'Unblock' : 'Block')}</button>
                              <button disabled={actionLoadingId === m.id} onClick={() => handleRemove(m.id)} className="nf-focus text-xs font-medium text-red-400 hover:text-red-300 disabled:opacity-40">Remove</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
