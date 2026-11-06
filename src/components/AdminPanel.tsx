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
    } catch (err: any) {
      setError(err?.message || 'Failed to load blocked titles.');
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
      setTimeout(() => {
        setNewTitle('');
        setNewPoster(null);
      }, 0);
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
        if (!cancelled) {
          setTimeout(() => {
            setNewTitle('');
            setNewPoster(null);
          }, 0);
        }
      } finally {
        if (!cancelled) setTimeout(() => setLookupLoading(false), 0);
      }
    };
    fetchDetails();
    return () => { cancelled = true; };
  }, [newTmdbId, newType]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const tmdbId = parseInt(newTmdbId, 10);
    if (!tmdbId || isNaN(tmdbId) || !newTitle.trim()) {
      setError('Please enter a valid TMDB ID and title.');
      return;
    }
    setLoading(true);
    try {
      await addBlockedMovie({
        tmdbId,
        type: newType,
        title: newTitle.trim(),
        poster_path: newPoster,
        reason: newReason.trim(),
        is_blocked: true,
        active: true,
        status: 'hidden',
      });
      setSuccess('Title added to blocklist successfully.');
      setNewTmdbId('');
      setNewTitle('');
      setNewPoster(null);
      setNewReason('');
      await loadMovies();
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Failed to add title.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    setError('');
    setSuccess('');
    setActionLoadingId(id);
    try {
      await toggleBlockedMovie(id, !currentActive);
      await loadMovies();
      router.refresh();
      setSuccess(currentActive ? 'Title unblocked successfully.' : 'Title blocked successfully.');
    } catch (err: any) {
      setError(err?.message || 'Failed to update title.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm('Remove this title from the blocklist?')) return;
    setError('');
    setSuccess('');
    setActionLoadingId(id);
    try {
      await removeBlockedMovie(id);
      await loadMovies();
      router.refresh();
      setSuccess('Title removed from blocklist successfully.');
    } catch (err: any) {
      setError(err?.message || 'Failed to remove title.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!user || !isAdmin(user)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <div className="nf-row-pad w-full py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tighter">Admin Panel</h1>
            <p className="text-sm text-slate-400">Manage blocked titles</p>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign out ({user.email})
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400 border border-red-500/20 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 border border-emerald-500/20 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" /> {success}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-[#0a0a0a]/60 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">Add Title</h3>
              <form onSubmit={handleAdd} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">TMDB ID</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newTmdbId}
                      onChange={(e) => setNewTmdbId(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                      placeholder="e.g. 550"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const id = parseInt(newTmdbId, 10);
                        if (id && !isNaN(id)) {
                          setNewTmdbId(String(id));
                        }
                      }}
                      disabled={lookupLoading || !newTmdbId}
                      className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm hover:bg-slate-700 disabled:opacity-50"
                    >
                      {lookupLoading ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                {newPoster && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={getPosterUrl(newPoster, 'w92')}
                      alt={newTitle}
                      className="w-12 h-18 rounded object-cover border border-slate-700"
                    />
                    <div>
                      <p className="text-sm font-medium text-white">{newTitle}</p>
                      <p className="text-xs text-slate-400">{newType}</p>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as 'movie' | 'tv')}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="movie">Movie</option>
                    <option value="tv">TV Show</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="Fight Club"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Reason</label>
                  <input
                    type="text"
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="Copyright"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-[#0a0a0a]/60 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Blocked Titles ({movies.length})
                </h3>
                <button
                  onClick={loadMovies}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <List className="h-3 w-3" /> Refresh
                </button>
              </div>

              {loading ? (
                <div className="h-48 flex items-center justify-center text-slate-500 text-sm">Loading...</div>
              ) : movies.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-sm">
                  No blocked titles yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                        <th className="pb-3">Poster</th>
                        <th className="pb-3">TMDB ID</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Title</th>
                        <th className="pb-3">Reason</th>
                        <th className="pb-3 text-right">Status</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movies.map((m) => (
                        <tr key={m.id} className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                          <td className="py-3">
                            {m.poster_path ? (
                              <img
                                src={getPosterUrl(m.poster_path, 'w92')}
                                alt={m.title}
                                className="w-10 h-14 rounded object-cover border border-slate-700"
                              />
                            ) : (
                              <div className="w-10 h-14 rounded bg-slate-800 flex items-center justify-center text-[10px] text-slate-500">
                                —
                              </div>
                            )}
                          </td>
                          <td className="py-3 text-sm font-mono text-slate-400">{m.tmdbId}</td>
                          <td className="py-3 text-xs text-slate-400 capitalize">{m.type}</td>
                          <td className="py-3 text-sm font-medium text-white">{m.title}</td>
                          <td className="py-3 text-sm text-slate-400 truncate max-w-xs">{m.reason || '—'}</td>
                          <td className="py-3 text-right">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                                m.active
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              }`}
                            >
                              {m.active ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                              {m.active ? 'Blocked' : 'Visible'}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              disabled={actionLoadingId === m.id}
                              onClick={() => handleToggle(m.id, m.active)}
                              className="text-xs text-indigo-400 hover:text-indigo-300 underline hover:decoration-indigo-400/30 disabled:opacity-40 inline-flex items-center gap-1"
                            >
                              {actionLoadingId === m.id && <Loader2 className="h-3 w-3 animate-spin inline" />}
                              {m.active ? 'Unblock' : 'Block'}
                            </button>
                            <button
                              disabled={actionLoadingId === m.id}
                              onClick={() => handleRemove(m.id)}
                              className="ml-2 text-xs text-red-400 hover:text-red-300 underline hover:decoration-red-400/30 disabled:opacity-40 inline-flex items-center gap-1"
                            >
                              Remove <Trash2 className="inline h-3 w-3 ml-0.5" />
                            </button>
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

        <div className="mt-8 pt-6 border-t border-white/10 text-xs text-slate-500">
          Blocked titles are stored in Firestore under the <code className="text-indigo-400">blockedMovies</code> collection.
          Blocked titles are hidden from browsing, search, and playback across FilmFlix.
        </div>
      </div>
    </div>
  );
}
