'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Play, Loader2, X } from 'lucide-react';
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

  // Follow the season currently playing whenever the panel opens.
  useEffect(() => {
    if (isOpen) setActiveSeason(selectedSeason);
  }, [isOpen, selectedSeason]);

  // Load the episode list for the selected season.
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
    return () => {
      cancelled = true;
    };
  }, [tmdbId, activeSeason]);

  const activeSeasonMeta = seasons.find((s) => s.season_number === activeSeason);

  return (
    <>
      {isOpen && (
        <button
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          aria-label="Close episode drawer"
        />
      )}

      <aside
        className={cn(
          'fixed bottom-0 left-0 right-0 lg:relative lg:bottom-auto lg:left-auto lg:right-auto lg:h-full lg:w-full',
          'z-50 flex max-h-[85vh] flex-col border-t border-white/10 bg-[#141414] lg:max-h-none lg:border-l lg:border-t-0',
          'transition-transform duration-300 ease-out lg:translate-x-0',
          isOpen ? 'translate-y-0' : 'translate-y-full lg:translate-x-0'
        )}
        role="dialog"
        aria-label="Season and episode selection"
        aria-modal="true"
      >
        {/* header: Episodes + season picker */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 lg:px-5">
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold leading-tight text-white md:text-[17px]">Episodes</h3>
            {activeSeasonMeta && (
              <p className="mt-0.5 text-[11px] text-[#8c8c8c]">
                {activeSeasonMeta.episode_count} episodes
                {activeSeasonMeta.air_date ? ` \u00b7 ${activeSeasonMeta.air_date.slice(0, 4)}` : ''}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <div className="relative">
              <select
                value={activeSeason}
                onChange={(e) => setActiveSeason(Number(e.target.value))}
                aria-label="Select season"
                className="nf-focus appearance-none rounded-[4px] border border-white/40 bg-[#232323] py-1.5 pl-3 pr-8 text-[12.5px] font-medium text-white transition-colors hover:border-white/70"
              >
                {seasons.map((season) => (
                  <option key={season.season_number} value={season.season_number} className="bg-[#141414]">
                    {season.name || `Season ${season.season_number}`} ({season.episode_count})
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70"
                aria-hidden="true"
              />
            </div>

            <button
              onClick={onClose}
              className="nf-focus flex h-9 w-9 items-center justify-center rounded-[4px] text-white transition-colors hover:bg-white/10 lg:hidden"
              aria-label="Close"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* episode list */}
        <div className="no-scrollbar flex-1 overflow-y-auto overscroll-contain">
          {loading ? (
            <div className="divide-y divide-white/[0.07]">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex animate-pulse items-start gap-3 px-3 py-3 md:gap-4 md:px-4">
                  <div
                    className="w-[112px] shrink-0 rounded-[4px] bg-[#232323] md:w-[150px]"
                    style={{ aspectRatio: '16 / 9' }}
                  />
                  <div className="min-w-0 flex-1 space-y-2 pt-1">
                    <div className="h-3.5 w-2/3 rounded-sm bg-[#232323]" />
                    <div className="h-3 w-full rounded-sm bg-[#232323]" />
                    <div className="h-3 w-4/5 rounded-sm bg-[#232323]" />
                  </div>
                </div>
              ))}
            </div>
          ) : episodes.length === 0 ? (
            <p className="px-4 py-10 text-center text-[13px] text-[#8c8c8c]">No episodes found for this season.</p>
          ) : (
            <ul className="divide-y divide-white/[0.07]">
              {episodes.map((ep) => {
                const isCurrent =
                  ep.episode_number === selectedEpisode && activeSeason === selectedSeason;
                const runtime = ep.runtime ? `${ep.runtime}m` : '';

                return (
                  <li key={ep.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(activeSeason, ep.episode_number)}
                      aria-current={isCurrent ? 'true' : 'false'}
                      className={cn(
                        'nf-focus group/ep flex w-full items-start gap-3 px-3 py-3 text-left transition-colors md:gap-4 md:px-4',
                        isCurrent ? 'bg-white/[0.08]' : 'hover:bg-white/[0.06]'
                      )}
                    >
                      {/* thumbnail with episode number, play affordance and runtime */}
                      <div
                        className={cn(
                          'relative w-[112px] shrink-0 overflow-hidden rounded-[4px] bg-[#232323] md:w-[150px]',
                          isCurrent && 'ring-2 ring-white/70'
                        )}
                        style={{ aspectRatio: '16 / 9' }}
                      >
                        <img
                          src={getBackdropUrl(ep.still_path, 'w342')}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                          aria-hidden="true"
                        />

                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                        <span className="absolute left-1.5 top-1 text-[15px] font-bold leading-none text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] md:text-[17px]">
                          {ep.episode_number}
                        </span>

                        {runtime && (
                          <span className="absolute bottom-1 right-1 rounded-[2px] bg-black/75 px-1 py-0.5 text-[10px] font-medium leading-none text-white">
                            {runtime}
                          </span>
                        )}

                        {isCurrent && (
                          <span className="absolute right-1 top-1 rounded-[2px] bg-[#e50914] px-1 py-0.5 text-[9px] font-bold uppercase leading-none tracking-wide text-white">
                            Now
                          </span>
                        )}

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover/ep:opacity-100">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-black/50 text-white">
                            <Play className="ml-0.5 h-4 w-4 fill-current" aria-hidden="true" />
                          </span>
                        </div>
                      </div>

                      {/* title + description */}
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex items-baseline justify-between gap-2">
                          <p
                            className={cn(
                              'truncate text-[13.5px] font-semibold leading-snug md:text-[14.5px]',
                              isCurrent ? 'text-white' : 'text-[#e5e5e5]'
                            )}
                            title={ep.name}
                          >
                            {ep.name}
                          </p>
                          {ep.vote_average > 0 && (
                            <span className="shrink-0 text-[11px] font-medium text-[#46d369]">
                              {ep.vote_average.toFixed(1)} ★
                            </span>
                          )}
                        </div>

                        <p className="mt-1 line-clamp-3 max-w-[75ch] text-[11.5px] leading-relaxed text-[#b3b3b3] md:text-[12.5px]">
                          {ep.overview || 'No description available.'}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 border-t border-white/10 py-2 text-[11px] text-[#8c8c8c]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            Loading episodes…
          </div>
        )}
      </aside>
    </>
  );
}
