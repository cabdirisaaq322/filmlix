'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Play, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSeasonDetails, TMDBEpisode } from '@/lib/tmdb';

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
  const [loadingSeason, setLoadingSeason] = useState<number | null>(null);
  const [expandedSeason, setExpandedSeason] = useState<number | null>(selectedSeason);

  useEffect(() => {
    if (isOpen && seasons.length > 0) {
      setExpandedSeason(selectedSeason);
    }
  }, [isOpen, seasons, selectedSeason]);

  useEffect(() => {
    if (expandedSeason && !episodes.length) {
      loadEpisodes(expandedSeason);
    }
  }, [expandedSeason, tmdbId]);

  const loadEpisodes = async (seasonNumber: number) => {
    setLoadingSeason(seasonNumber);
    try {
      const data = await getSeasonDetails(tmdbId, seasonNumber);
      setEpisodes(data.episodes || []);
    } catch (error) {
      console.error('Failed to load episodes:', error);
      setEpisodes([]);
    } finally {
      setLoadingSeason(null);
    }
  };

  const handleSeasonClick = (seasonNumber: number) => {
    if (seasonNumber === expandedSeason) {
      setExpandedSeason(null);
      setEpisodes([]);
    } else {
      setExpandedSeason(seasonNumber);
    }
  };

  const currentSeason = seasons.find((s) => s.season_number === expandedSeason);

  return (
    <>
      <button
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        aria-label="Close episode drawer"
      />

      <aside
        className={cn(
          'fixed bottom-0 left-0 right-0 lg:relative lg:bottom-auto lg:left-auto lg:right-auto lg:w-80 lg:h-full',
          'bg-slate-950 border-t border-slate-800 lg:border-t-0 lg:border-l lg:rounded-l-xl',
          'z-50 flex flex-col transition-transform duration-300 ease-out',
          'lg:translate-x-0',
          isOpen ? 'translate-y-0' : 'translate-y-full lg:translate-x-0'
        )}
        role="dialog"
        aria-label="Season and episode selection"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-800 lg:sticky lg:top-0 lg:bg-slate-950/95 lg:backdrop-blur">
          <h3 className="font-semibold text-white">Seasons & Episodes</h3>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
            aria-label="Close"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {seasons.map((season) => {
            const isSelected = season.season_number === selectedSeason;
            const isExpanded = season.season_number === expandedSeason;
            const isLoading = loadingSeason === season.season_number;

            return (
              <div
                key={season.season_number}
                className={cn(
                  'bg-slate-900/50 rounded-lg border border-slate-800 overflow-hidden',
                  isSelected && 'border-indigo-500/50 bg-indigo-500/10'
                )}
              >
                <button
                  onClick={() => handleSeasonClick(season.season_number)}
                  className="w-full flex items-center justify-between p-3 hover:bg-slate-800/50 transition-colors text-left"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold',
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                    )}>
                      {season.season_number === 0 ? 'S' : season.season_number}
                    </div>
                    <div>
                      <p className="font-medium text-white">{season.name || `Season ${season.season_number}`}</p>
                      <p className="text-xs text-slate-400">
                        {season.episode_count} episodes • {season.air_date?.slice(0, 4) || '—'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    className={cn(
                      'w-5 h-5 text-slate-400 transition-transform',
                      isExpanded && 'rotate-90'
                    )}
                  />
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-800 p-3 space-y-2 animate-slide-down">
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                          <div className="w-8 h-8 bg-slate-800 rounded" />
                          <div className="flex-1 h-4 bg-slate-800 rounded w-3/4" />
                        </div>
                      ))
                    ) : episodes.length === 0 ? (
                      <p className="text-slate-500 text-sm text-center py-4">No episodes found</p>
                    ) : (
                      episodes.map((ep) => {
                        const isCurrentEp = ep.episode_number === selectedEpisode && season.season_number === selectedSeason;
                        return (
                          <button
                            key={ep.id}
                            onClick={() => onSelect(season.season_number, ep.episode_number)}
                            className={cn(
                              'w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left',
                              isCurrentEp
                                ? 'bg-indigo-500/20 border border-indigo-500/50'
                                : 'hover:bg-slate-800/50'
                            )}
                            aria-current={isCurrentEp ? 'true' : 'false'}
                          >
                            <div className={cn(
                              'w-8 h-8 rounded flex items-center justify-center text-xs font-bold flex-shrink-0',
                              isCurrentEp ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                            )}>
                              {isCurrentEp ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <Play className="w-4 h-4 ml-0.5" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                'text-sm truncate',
                                isCurrentEp ? 'text-white font-medium' : 'text-slate-300'
                              )}>
                                E{ep.episode_number}: {ep.name}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {ep.overview || 'No description'}
                              </p>
                            </div>
                            {ep.vote_average > 0 && (
                              <span className="text-xs text-yellow-400 flex items-center gap-1">
                                {ep.vote_average.toFixed(1)}
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      <style jsx>{`
        @keyframes slide-down {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 500px; }
        }
        .animate-slide-down { animation: slide-down 0.3s ease-out forwards; }
      `}</style>
    </>
  );
}