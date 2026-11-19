'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Play, X, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSeasonDetails, getBackdropUrl, TMDBEpisode } from '@/lib/tmdb';

interface SeasonEpisodeDrawerProps {
  tmdbId: number;
  seasons: Array<{
    air_date: string;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    season_number: number;
    vote_average: number;
  }>;
  selectedSeason: number;
  selectedEpisode: number;
  onSelect: (season: number, episode: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function SeasonEpisodeDrawer({
  tmdbId,
  seasons,
  selectedSeason,
  selectedEpisode,
  onSelect,
  isOpen,
  onClose,
}: SeasonEpisodeDrawerProps) {
  const [episodes, setEpisodes] = useState<TMDBEpisode[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSeason, setActiveSeason] = useState<number>(selectedSeason);

  useEffect(() => {
    if (isOpen) setActiveSeason(selectedSeason);
  }, [isOpen, selectedSeason]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setEpisodes([]);
    getSeasonDetails(tmdbId, activeSeason)
      .then((data) => {
        if (!cancelled) setEpisodes(data.episodes || []);
      })
      .catch(() => {
        if (!cancelled) setEpisodes([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [tmdbId, activeSeason]);

  const activeSeasonMeta = seasons.find((s) => s.season_number === activeSeason);

  return (
    <>
      {isOpen && (
        <button
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md lg:hidden"
          aria-label="Close episode drawer"
        />
      )}

      <aside
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 flex max-h-[85vh] flex-col rounded-t-3xl border-t border-white/10 bg-[#0d0e17]/95 shadow-2xl backdrop-blur-2xl lg:relative lg:bottom-auto lg:left-auto lg:right-auto lg:h-full lg:max-h-none lg:rounded-none lg:border-l lg:border-t-0',
          'transition-transform duration-300 ease-out lg:translate-x-0',
          isOpen ? 'translate-y-0' : 'translate-y-full lg:translate-x-0'
        )}
        role="dialog"
        aria-label="Season and episode selection"
        aria-modal="true"
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4 lg:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600/15 text-[#e50914]">
              <Layers className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-[16px] font-bold text-white">Episodes</h3>
              {activeSeasonMeta && (
                <p className="text-[11px] text-slate-400">
                  {activeSeasonMeta.episode_count} episodes
                  {activeSeasonMeta.air_date ? ` · ${activeSeasonMeta.air_date.slice(0, 4)}` : ''}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="relative">
              <select
                value={activeSeason}
                onChange={(e) => setActiveSeason(Number(e.target.value))}
                aria-label="Select season"
                className="nf-focus appearance-none rounded-full border border-white/15 bg-white/[0.06] py-1.5 pl-3.5 pr-8 text-[12.5px] font-semibold text-white hover:bg-white/[0.1] cursor-pointer"
              >
                {seasons.map((season) => (
                  <option key={season.season_number} value={season.season_number} className="bg-[#12131e] text-white">
                    {season.name || `Season ${season.season_number}`}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            </div>

            <button
              onClick={onClose}
              className="nf-focus flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white lg:hidden cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto overscroll-contain p-2">
          {loading ? (
            <div className="divide-y divide-white/[0.04]">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex animate-pulse items-start gap-3 p-3">
                  <div className="w-[120px] shrink-0 rounded-xl bg-white/[0.05]" style={{ aspectRatio: '16 / 9' }} />
                  <div className="min-w-0 flex-1 space-y-2 pt-1">
                    <div className="h-4 w-2/3 rounded bg-white/[0.05]" />
                    <div className="h-3 w-full rounded bg-white/[0.05]" />
                  </div>
                </div>
              ))}
            </div>
          ) : episodes.length === 0 ? (
            <p className="px-4 py-12 text-center text-[13px] text-slate-400">No episodes found for this season.</p>
          ) : (
            <ul className="divide-y divide-white/[0.04]">
              {episodes.map((ep) => {
                const isCurrent = ep.episode_number === selectedEpisode && activeSeason === selectedSeason;
                const runtime = ep.runtime ? `${ep.runtime}m` : '';

                return (
                  <li key={ep.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(activeSeason, ep.episode_number)}
                      className={cn(
                        'nf-focus group/ep flex w-full items-start gap-3.5 rounded-xl p-3 text-left transition-all duration-200 cursor-pointer',
                        isCurrent
                          ? 'bg-red-600/15 border border-red-500/30'
                          : 'hover:bg-white/[0.05]'
                      )}
                    >
                      <div className={cn('relative w-[120px] shrink-0 overflow-hidden rounded-xl bg-[#141522] border border-white/10 shadow-md', isCurrent && 'ring-2 ring-red-500')} style={{ aspectRatio: '16 / 9' }}>
                        <img src={getBackdropUrl(ep.still_path, 'w342')} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover/ep:scale-105" loading="lazy" />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <span className="absolute left-2 top-1.5 text-xs font-black text-white drop-shadow">{ep.episode_number}</span>
                        {runtime && <span className="absolute bottom-1 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[9.5px] font-semibold text-slate-200">{runtime}</span>}
                        {isCurrent && <span className="absolute right-1.5 top-1.5 rounded-full bg-[#e50914] px-2 py-0.2 text-[8.5px] font-bold uppercase text-white shadow-sm">Playing</span>}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover/ep:opacity-100">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-lg"><Play className="ml-0.5 h-3.5 w-3.5 fill-current" /></span>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className={cn('truncate text-[13.5px] font-bold', isCurrent ? 'text-white' : 'text-slate-200 group-hover/ep:text-white')} title={ep.name}>
                          {ep.name}
                        </p>
                        <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-slate-400">
                          {ep.overview || 'Episode summary not provided.'}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
