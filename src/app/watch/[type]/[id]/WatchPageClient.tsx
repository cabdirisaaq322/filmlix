'use client';

import { useState, useCallback, useEffect } from 'react';
import { ChevronDown, Download, Share2, Star, Clock, Calendar, Film, Tv, ExternalLink, Info, Play, Heart } from 'lucide-react';
import { toggleFavorite, isFavorite } from '@/lib/favorites';
import { VidSrcPlayer } from '@/components/VidSrcPlayer';
import { SeasonEpisodeDrawer } from '@/components/SeasonEpisodeDrawer';
import { BackButton } from '@/components/BackButton';
import { MediaGrid } from '@/components/MediaGrid';
import { saveContinueWatching } from '@/lib/history';
import { getBackdropUrl, toMediaItems, TMDBDetails } from '@/lib/tmdb';

interface WatchPageClientProps {
  type: 'movie' | 'tv';
  tmdbId: number;
  details: TMDBDetails;
  initialSeason: number;
  initialEpisode: number;
}

export function WatchPageClient({ type, tmdbId, details, initialSeason, initialEpisode }: WatchPageClientProps) {
  const [selectedSeason, setSelectedSeason] = useState(initialSeason);
  const [selectedEpisode, setSelectedEpisode] = useState(initialEpisode);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [isFav, setIsFav] = useState(false);
  useEffect(() => { setIsFav(isFavorite(type, tmdbId)); }, [type, tmdbId]);

  const title = details.title || details.name || 'Unknown';
  const year = details.release_date?.slice(0, 4) || details.first_air_date?.slice(0, 4) || '—';
  const genres = details.genres?.slice(0, 3).map((g) => g.name) || [];
  const backdropUrl = getBackdropUrl(details.backdrop_path, 'w1280');
  const runtime = details.runtime || details.episode_run_time?.[0] || 0;
  const cast = details.credits?.cast?.slice(0, 10) || [];
  const seasons = details.seasons?.filter((s) => s.season_number > 0) || [];
  const recommendationSource = details.recommendations?.results?.length
    ? details.recommendations.results
    : details.similar?.results || [];
  const recommended = toMediaItems(recommendationSource, type)
    .filter((item) => item.id !== tmdbId)
    .slice(0, 12);

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

  // "Watch Now" starts playback immediately in the on-page player (no external sites)
  const handleWatchNow = useCallback(() => {
    setPlaying(true);
    setTimeout(() => {
      document.getElementById('video-player')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
  }, []);

  const formatRuntime = (minutes: number) => {
    if (!minutes) return '—';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="-mt-36 min-h-screen bg-[#080808] pb-8 md:-mt-24">
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-36 sm:px-6 md:pb-14 md:pt-28 lg:px-8">
        <BackButton label="Back to browsing" className="mb-8" />
        <div className="grid items-center gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-12">
          <div className="min-w-0 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/65">
              {genres.length > 0 ? genres.join('  •  ') : type === 'movie' ? 'Movie' : 'Series'}
            </p>
            <h1 className="text-4xl font-black leading-[1.05] text-white sm:text-5xl md:text-6xl">
              {title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-white/75">
              <span>{year}</span>
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-current text-yellow-400" />
                {details.vote_average?.toFixed(1) || '—'}
              </span>
              {runtime > 0 && <span>{formatRuntime(runtime)}</span>}
              {type === 'tv' && details.number_of_seasons && <span>{details.number_of_seasons} Seasons</span>}
            </div>
            <p className="max-w-xl text-sm leading-6 text-white/75 sm:text-base sm:leading-7 line-clamp-4">
              {details.overview || 'No description available.'}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleWatchNow}
                className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-white/85 cursor-pointer"
              >
                <Play className="h-4 w-4 fill-current" />
                Watch Now
              </button>
              {type === 'tv' && seasons.length > 0 ? (
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="flex items-center gap-2 rounded-full bg-white/12 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/20"
                >
                  <ChevronDown className="h-5 w-5" />
                  Episodes
                </button>
              ) : (
                <button
                  onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-2 rounded-full bg-white/12 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/20"
                >
                  <Info className="h-4 w-4" />
                  More Info
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const next = toggleFavorite({ type, id: tmdbId, title, poster_path: details.poster_path });
                  setIsFav(next);
                }}
                className="flex items-center gap-2 rounded-full bg-white/12 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/20"
              >
                <Heart className={`h-4 w-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                {isFav ? 'Added' : 'My List'}
              </button>
            </div>
          </div>
          <div className="min-w-0">
            {playing ? (
              <VidSrcPlayer
                type={type}
                tmdbId={tmdbId}
                imdbId={details.external_ids?.imdb_id}
                season={selectedSeason}
                episode={selectedEpisode}
                autoPlay
                title={title}
              />
            ) : (
              <button
                type="button"
                onClick={handleWatchNow}
                aria-label={`Play ${title}`}
                className="group relative aspect-video w-full overflow-hidden rounded-xl bg-neutral-900 cursor-pointer block"
              >
                <img src={backdropUrl} alt={`${title} backdrop`} className="h-full w-full object-cover" />
                <span className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/10" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-black shadow-2xl transition-transform group-hover:scale-110">
                    <Play className="h-7 w-7 fill-current ml-1" />
                  </span>
                </span>
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-8 pt-8 sm:px-6 lg:px-8">
        <div className="min-w-0 space-y-6">
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

            <div id="about" className="mt-8 grid min-w-0 grid-cols-1 scroll-mt-36 gap-6 md:scroll-mt-24 md:grid-cols-3">
              <div className="min-w-0 space-y-4 md:col-span-2">
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

              <aside className="min-w-0 space-y-6">
                <div className="w-full min-w-0 bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-4">
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
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors">
                      <Download className="w-5 h-5" />
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

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
  );
}