'use client';

import { useState, useCallback, useEffect } from 'react';
import { ChevronDown, Share2, Star, Clock, Calendar, Film, Tv, ExternalLink, Info, Play, Heart } from 'lucide-react';
import Link from 'next/link';
import { toggleFavorite, isFavorite } from '@/lib/favorites';
import { VidSrcPlayer } from '@/components/VidSrcPlayer';
import { SeasonEpisodeDrawer } from '@/components/SeasonEpisodeDrawer';
import { BackButton } from '@/components/BackButton';
import { MediaGrid } from '@/components/MediaGrid';
import { saveContinueWatching } from '@/lib/history';
import { getBackdropUrl, toMediaItems, TMDBDetails, BLOCKLISTED_MOVIE_IDS } from '@/lib/tmdb';
import { useBlockedMovieIds } from '@/lib/blocklist-client';

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

  const blockedIds = useBlockedMovieIds();
  const isTitleBlocked = BLOCKLISTED_MOVIE_IDS.includes(tmdbId) || blockedIds.includes(tmdbId);

  useEffect(() => {
    if (isTitleBlocked) return;
    setTimeout(() => setIsFav(isFavorite(type, tmdbId)), 0);
  }, [type, tmdbId, isTitleBlocked]);

  useEffect(() => {
    if (isTitleBlocked) return;
    saveContinueWatching({
      type,
      id: tmdbId,
      title: details.title || details.name || 'Unknown',
      poster_path: details.poster_path,
      season: selectedSeason,
      episode: selectedEpisode,
    });
  }, [type, tmdbId, details.poster_path, details.title, details.name, selectedSeason, selectedEpisode, isTitleBlocked]);

  const handleEpisodeSelect = useCallback((season: number, episode: number) => {
    setSelectedSeason(season);
    setSelectedEpisode(episode);
    setDrawerOpen(false);
    const url = `/watch/${type}/${tmdbId}?season=${season}&episode=${episode}`;
    window.history.pushState({}, '', url);
  }, [type, tmdbId]);

  const handleWatchNow = useCallback(() => {
    setPlaying(true);
    setTimeout(() => {
      document.getElementById('video-player')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
  }, []);

  if (isTitleBlocked) {
    return (
      <div className="min-h-screen bg-[var(--fx-bg)] pb-12 pt-28">
        <div className="nf-row-pad text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/15 text-2xl">🚫</div>
          <h2 className="mb-2 text-2xl font-bold text-white">This title is not available</h2>
          <p className="mb-6 text-zinc-400">This title has been blocked.</p>
          <Link href="/" className="nf-focus inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black hover:bg-zinc-100">← Back to home</Link>
        </div>
      </div>
    );
  }

  const title = details.title || details.name || 'Unknown';
  const year = details.release_date?.slice(0, 4) || details.first_air_date?.slice(0, 4) || '—';
  const genres = details.genres?.slice(0, 3).map((g) => g.name) || [];
  const backdropUrl = getBackdropUrl(details.backdrop_path, 'w1280');
  const runtime = details.runtime || details.episode_run_time?.[0] || 0;
  const cast = details.credits?.cast?.slice(0, 10) || [];
  const seasons = details.seasons?.filter((s) => s.season_number > 0) || [];
  const recommendationSource = details.recommendations?.results?.length ? details.recommendations.results : details.similar?.results || [];
  const recommended = toMediaItems(recommendationSource, type).filter((item) => item.id !== tmdbId).slice(0, 12);

  const formatRuntime = (minutes: number) => {
    if (!minutes) return '—';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="min-h-screen bg-[var(--fx-bg)] pb-12">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <img src={backdropUrl} alt="" className="h-full w-full object-cover opacity-25 blur-sm scale-105" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--fx-bg)] via-[var(--fx-bg)]/80 to-[var(--fx-bg)]/40" />
        </div>
        <div className="nf-row-pad relative w-full pb-10 pt-28 md:pb-14 md:pt-32">
          <BackButton label="Back" className="mb-6 w-fit" />
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:items-center">
            <div className="min-w-0 space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-[12px] font-medium text-zinc-300">
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 uppercase tracking-wide">{type === 'movie' ? 'Movie' : 'Series'}</span>
                {genres.map((g) => <span key={g} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{g}</span>)}
              </div>
              <h1 className="text-balance text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl">{title}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-300">
                <span>{year}</span>
                <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{details.vote_average?.toFixed(1) || '—'}</span>
                {runtime > 0 && <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" />{formatRuntime(runtime)}</span>}
                {type === 'tv' && details.number_of_seasons && <span>{details.number_of_seasons} Seasons</span>}
              </div>
              <p className="max-w-2xl text-[14px] leading-relaxed text-zinc-300 sm:text-[15px] line-clamp-4">{details.overview || 'No description available.'}</p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button type="button" onClick={handleWatchNow} className="nf-focus fx-btn-primary nf-btn-hero">
                  <Play className="h-4 w-4 fill-current" /> Watch Now
                </button>
                {type === 'tv' && seasons.length > 0 && (
                  <button onClick={() => setDrawerOpen(true)} className="nf-focus fx-btn-secondary nf-btn-hero">
                    <ChevronDown className="h-4 w-4" /> Episodes
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setIsFav(toggleFavorite({ type, id: tmdbId, title, poster_path: details.poster_path })); }}
                  className="nf-focus fx-btn-secondary nf-btn-hero"
                >
                  <Heart className={`h-4 w-4 ${isFav ? 'fill-[#e50914] text-[#e50914]' : ''}`} /> {isFav ? 'Saved' : 'My List'}
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
                  title={title}
                />
              ) : (
                <button
                  type="button"
                  onClick={handleWatchNow}
                  aria-label={`Play ${title}`}
                  className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl"
                >
                  <img src={backdropUrl} alt={`${title} backdrop`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-black shadow-2xl transition-transform group-hover:scale-110">
                      <Play className="ml-1 h-7 w-7 fill-current" />
                    </span>
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="nf-row-pad w-full pb-8 pt-8">
        <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.7fr)]">
          <div className="min-w-0 space-y-8">
            {type === 'tv' && seasons.length > 0 && (
              <div>
                <button onClick={() => setDrawerOpen(true)} className="nf-focus inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-medium text-white hover:bg-white/10">
                  <ChevronDown className="h-4 w-4" /> Season {selectedSeason} · Episode {selectedEpisode}
                </button>
                <SeasonEpisodeDrawer tmdbId={tmdbId} seasons={seasons} selectedSeason={selectedSeason} selectedEpisode={selectedEpisode} onSelect={handleEpisodeSelect} isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
              </div>
            )}

            <section id="about" className="scroll-mt-36 space-y-4">
              <h2 className="text-xl font-bold text-white">About</h2>
              <p className="max-w-3xl leading-relaxed text-zinc-300">{details.overview || 'No description available.'}</p>
            </section>

            {cast.length > 0 && (
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Cast</h3>
                <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
                  {cast.map((actor) => (
                    <div key={actor.id} className="w-28 shrink-0 text-center">
                      {actor.profile_path ? (
                        <img src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} alt={actor.name} className="mx-auto mb-2 h-24 w-24 rounded-full object-cover ring-2 ring-white/10" loading="lazy" />
                      ) : (
                        <div className="mx-auto mb-2 flex h-24 w-24 items-center justify-center rounded-full bg-white/5 ring-2 ring-white/10"><Film className="h-7 w-7 text-zinc-500" /></div>
                      )}
                      <p className="truncate text-sm font-medium text-white">{actor.name}</p>
                      <p className="truncate text-xs text-zinc-500">{actor.character}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between"><span className="text-zinc-400">Rating</span><span className="inline-flex items-center gap-1 font-semibold text-white"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{details.vote_average?.toFixed(1) || '—'}</span></div>
                <div className="flex items-center justify-between"><span className="text-zinc-400">Release</span><span className="text-white">{details.release_date || details.first_air_date || '—'}</span></div>
                {runtime > 0 && <div className="flex items-center justify-between"><span className="text-zinc-400">Runtime</span><span className="text-white">{formatRuntime(runtime)}</span></div>}
                {type === 'tv' && details.number_of_seasons && <div className="flex items-center justify-between"><span className="text-zinc-400">Seasons</span><span className="text-white">{details.number_of_seasons}</span></div>}
              </div>
              {details.external_ids?.imdb_id && (
                <a href={`https://www.imdb.com/title/${details.external_ids.imdb_id}`} target="_blank" rel="noopener noreferrer" className="nf-focus inline-flex items-center gap-2 text-sm text-[#e50914] hover:text-[#e5e5e5]">
                  <ExternalLink className="h-4 w-4" /> View on IMDb
                </a>
              )}
            </div>
          </aside>
        </div>

        {recommended.length > 0 && (
          <div className="mt-10 border-t border-white/10 pt-8">
            <MediaGrid title="More Like This" items={recommended} />
          </div>
        )}
      </div>
    </div>
  );
}
