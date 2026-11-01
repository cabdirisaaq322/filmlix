'use client';

import { useState, useCallback } from 'react';
import { Trash2, Plus, List, AlertTriangle, ShieldAlert } from 'lucide-react';
import {
  getBlockedMovies,
  addBlockedMovie,
  removeBlockedMovie,
  type BlockedMovie,
} from '@/lib/blocklist';

export function AdminPanel() {
  const [movies, setMovies] = useState<BlockedMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTmdbId, setNewTmdbId] = useState('');
  const [newType, setNewType] = useState<'movie' | 'tv'>('movie');
  const [newTitle, setNewTitle] = useState('');
  const [newReason, setNewReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadMovies = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await getBlockedMovies();
      setMovies(list);
    } catch {
      setError('Failed to load blocked titles.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const tmdbId = parseInt(newTmdbId, 10);
    if (!tmdbId || !newTitle.trim()) {
      setError('Please enter a valid TMDB ID and title.');
      return;
    }
    try {
      await addBlockedMovie({
        tmdbId,
        type: newType,
        title: newTitle.trim(),
        poster_path: null,
        reason: newReason.trim(),
      });
      setSuccess('Title added to blocklist.');
      setNewTmdbId('');
      setNewTitle('');
      setNewReason('');
      await loadMovies();
    } catch {
      setError('Failed to add title.');
    }
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm('Remove this title from the blocklist?')) return;
    try {
      await removeBlockedMovie(id);
      await loadMovies();
      setSuccess('Title removed from blocklist.');
    } catch {
      setError('Failed to remove title.');
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tighter">Admin Panel</h1>
            <p className="text-sm text-slate-400">Manage blocked titles</p>
          </div>
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
                  <input
                    type="number"
                    value={newTmdbId}
                    onChange={(e) => setNewTmdbId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. 550"
                  />
                </div>
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
                        <th className="pb-3">TMDB ID</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Title</th>
                        <th className="pb-3">Reason</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movies.map((m) => (
                        <tr key={m.id} className="border-b border-slate-800/50 hover:bg-white/5 transition-colors">
                          <td className="py-3 text-sm font-mono text-slate-400">{m.tmdbId}</td>
                          <td className="py-3 text-xs text-slate-400 capitalize">{m.type}</td>
                          <td className="py-3 text-sm font-medium text-white">{m.title}</td>
                          <td className="py-3 text-sm text-slate-400 truncate max-w-xs">{m.reason || '—'}</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleRemove(m.id)}
                              className="text-xs text-red-400 hover:text-red-300 underline hover:decoration-red-400/30"
                            >
                              Remove <Trash2 className="inline h-3 w-3 ml-1" />
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
        </div>
      </div>
    </div>
  );
}
