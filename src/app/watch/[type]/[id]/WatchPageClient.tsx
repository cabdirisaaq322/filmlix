'use client';

import { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Play, Download, Share2, Star, Clock, Calendar, Film, Tv, Loader2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VidSrcPlayer } from '@/components/VidSrcPlayer';
import { SeasonEpisodeDrawer } from '@/components/SeasonEpisodeDrawer';
import { AdContainer } from '@/components/AdContainer';
import { BackButton } from '@/components/BackButton';
import { MediaGrid } from '@/components/MediaGrid';
import { saveContinueWatching } from '@/lib/history';
import { getBackdropUrl, getPosterUrl, toMediaItems, TMDBDetails } from '@/lib/tmdb';

interface WatchPageClientProps {
  type: 'movie' | 'tv';
  tmdbId: number;
  details: TMDBDetails;
  initialSeason: number;
  initialEpisode: number;
}

const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
  53: 'Thriller', 10752: 'War', 37: 'Western',
};

export function WatchPageClient({ type, tmdbId, details, initialSeason, initialEpisode }: WatchPageClientProps) {
  const [selectedSeason, setSelectedSeason] = useState(initialSeason);
  const [selectedEpisode, setSelectedEpisode] = useState(initialEpisode);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const title = details.title || details.name || 'Unknown';
  const year = details.release_date?.slice(0, 4) || details.first_air_date?.slice(0, 4) || '—';
  const genres = details.genres?.slice(0, 3).map((g) => g.name) || [];
  const backdropUrl = getBackdropUrl(details.backdrop_path, 'w1280');
  const posterUrl = getPosterUrl(details.poster_path, 'w342');
  const runtime = details.runtime || details.episode_run_time?.[0] || 0;
  const cast = details.credits?.cast?.slice(0, 10) || [];
  const seasons = details.seasons?.filter((s) => s.season_number > 0) || [];
  const recommendationSource = details.recommendations?.results?.length
    ? details.recommendations.results
    : details.similar?.results || [];
  const recommended = toMediaItems(recommendationSource, type).slice(0, 12);

  // Remember what the viewer is watching so the homepage can offer "Continue Watching"
  useEffect(() => {
    saveContinueWatching({
      type,
      id: tmdbId,
      title,
      poster_path: details.poster_path,
      season: selectedSeason,
      episode: selectedEpisode,
    });
  }, [type, tmdbId, title, details.poster_path, selectedSeason, selectedEpisode]);

  const handleEpisodeSelect = useCallback((season: number, episode: number) => {
    setSelectedSeason(season);
    setSelectedEpisode(episode);
    setDrawerOpen(false);
    const url = `/watch/${type}/${tmdbId}?season=${season}&episode=${episode}`;
    window.history.pushState({}, '', url);
  }, [type, tmdbId]);

  const formatRuntime = (minutes: number) => {
    if (!minutes) return '—';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="min-h-screen">
      <div className="relative h-64 md:h-80 lg:h-96">
        <img
          src={backdropUrl}
          alt=""
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 pb-16">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 min-w-0 space-y-6">
            <BackButton label="Back to browsing" />

            <AdContainer slot="player-top" className="mx-auto max-w-4xl" />

            <VidSrcPlayer
              type={type}
              tmdbId={tmdbId}
              imdbId={details.external_ids?.imdb_id}
              season={selectedSeason}
              episode={selectedEpisode}
              title={title}
            />

            <AdContainer slot="player-bottom" className="mx-auto max-w-4xl" />

            {type === 'tv' && seasons.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-white hover:bg-slate-800/50 transition-colors"
                >
                  <ChevronDown className="w-5 h-5" />
                  <span className="font-medium">
                    Season {selectedSeason} • Episode {selectedEpisode}
                  </span>
                </button>

                <SeasonEpisodeDrawer
                  tmdbId={tmdbId}
                  seasons={seasons}
                  selectedSeason={selectedSeason}
                  selectedEpisode={selectedEpisode}
                  onSelect={handleEpisodeSelect}
                  isOpen={drawerOpen}
                  onClose={() => setDrawerOpen(false)}
                />
              </div>
            )}

            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <h2 className="text-xl font-bold text-white">About</h2>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {details.overview || 'No description available.'}
                </p>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800">
                  {genres.map((genre) => (
                    <span key={genre} className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-sm font-medium rounded-full border border-indigo-500/30">
                      {genre}
                    </span>
                  ))}
                  <span className="px-3 py-1 bg-slate-800/50 text-slate-300 text-sm font-medium rounded-full border border-slate-700">
                    {year}
                  </span>
                  <span className="px-3 py-1 bg-slate-800/50 text-slate-300 text-sm font-medium rounded-full border border-slate-700">
                    {type === 'movie' ? 'Movie' : 'TV Series'}
                  </span>
                  {runtime > 0 && (
                    <span className="px-3 py-1 bg-slate-800/50 text-slate-300 text-sm font-medium rounded-full border border-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatRuntime(runtime)}
                    </span>
                  )}
                  {details.number_of_seasons && (
                    <span className="px-3 py-1 bg-slate-800/50 text-slate-300 text-sm font-medium rounded-full border border-slate-700 flex items-center gap-1">
                      <Tv className="w-3.5 h-3.5" />
                      {details.number_of_seasons} Seasons
                    </span>
                  )}
                </div>

                {cast.length > 0 && (
                  <div className="pt-6 border-t border-slate-800">
                    <h3 className="text-lg font-semibold text-white mb-4">Cast</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
                      {cast.map((actor) => (
                        <div key={actor.id} className="flex-shrink-0 w-32 text-center">
                          {actor.profile_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                              alt={actor.name}
                              className="w-32 h-32 rounded-full object-cover mx-auto mb-2"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-32 h-32 rounded-full bg-slate-800 mx-auto mb-2 flex items-center justify-center">
                              <Film className="w-8 h-8 text-slate-500" />
                            </div>
                          )}
                          <p className="text-sm font-medium text-white truncate">{actor.name}</p>
                          <p className="text-xs text-slate-500 truncate">{actor.character}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <aside className="space-y-6">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4">
                  {posterUrl && (
                    <img
                      src={posterUrl}
                      alt={`${title} poster`}
                      className="w-full aspect-[2/3] object-cover rounded-lg shadow-xl"
                    />
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="text-2xl font-bold text-white">{details.vote_average?.toFixed(1) || '—'}</span>
                      </span>
                      <span className="text-slate-400 text-sm">/{details.vote_count?.toLocaleString() || '0'} votes</span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-300">
                      <Calendar className="w-5 h-5 text-slate-500" />
                      <span>{details.release_date || details.first_air_date || '—'}</span>
                    </div>

                    {details.external_ids?.imdb_id && (
                      <a
                        href={`https://www.imdb.com/title/${details.external_ids.imdb_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View on IMDb
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-800">
                    <button
                      onClick={() => {
                        document.getElementById('video-player')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-black rounded-lg font-semibold hover:bg-indigo-400 transition-colors cursor-pointer"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      Play
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors">
                      <Download className="w-5 h-5" />
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <AdContainer slot="sidebar" className="mx-auto" />
              </aside>
            </div>

            {recommended.length > 0 && (
              <div className="pt-8 border-t border-slate-800">
                <MediaGrid title="More Like This" items={recommended} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}