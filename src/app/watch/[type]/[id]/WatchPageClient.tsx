'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Play,
  Plus,
  Check,
  Share2,
  Star,
  ChevronDown,
  Layers,
  Sparkles,
  ArrowLeft,
  Download,
  Film,
  Tv,
  Calendar,
  Clock,
  ThumbsUp,
  Info,
  Maximize,
} from 'lucide-react';
import Link from 'next/link';
import { toggleFavorite, isFavorite } from '@/lib/favorites';
import { VidSrcPlayer } from '@/components/VidSrcPlayer';
import { saveContinueWatching } from '@/lib/history';
import {
  TMDBDetails,
  TMDBEpisode,
  TMDBVideo,
  BLOCKLISTED_MOVIE_IDS,
  getSeasonDetails,
  getBackdropUrl,
  getPosterUrl,
} from '@/lib/tmdb';
import { useBlockedMovieIds } from '@/lib/blocklist-client';
import { MediaCard } from '@/components/MediaCard';
import { cn } from '@/lib/utils';

interface WatchPageClientProps {
  type: 'movie' | 'tv';
  tmdbId: number;
  details: TMDBDetails;
  initialSeason: number;
  initialEpisode: number;
}

export function WatchPageClient({
  type,
  tmdbId,
  details,
  initialSeason,
  initialEpisode,
}: WatchPageClientProps) {
  const searchParams = useSearchParams();

  const title = details.title || details.name || 'Unknown Title';
  const year = details.release_date?.slice(0, 4) || details.first_air_date?.slice(0, 4) || '';
  const genres = details.genres || [];
  const seasons = details.seasons?.filter((s) => s.season_number > 0) || [];
  const hasEpisodes = type === 'tv' && seasons.length > 0;

  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'episodes' | 'more' | 'trailers'>(
    hasEpisodes ? 'episodes' : 'more'
  );
  const [selectedSeason, setSelectedSeason] = useState(initialSeason);
  const [selectedEpisode, setSelectedEpisode] = useState(initialEpisode);
  const [seasonEpisodes, setSeasonEpisodes] = useState<TMDBEpisode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const playerSectionRef = useRef<HTMLDivElement>(null);

  const blockedIds = useBlockedMovieIds();
  const isTitleBlocked = BLOCKLISTED_MOVIE_IDS.includes(tmdbId) || blockedIds.includes(tmdbId);

  useEffect(() => {
    if (isTitleBlocked) return;
    setIsFav(isFavorite(type, tmdbId));
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

  useEffect(() => {
    if (type !== 'tv') return;
    let cancelled = false;
    setLoadingEpisodes(true);
    getSeasonDetails(tmdbId, selectedSeason)
      .then((data) => {
        if (!cancelled) setSeasonEpisodes(data.episodes || []);
      })
      .catch(() => {
        if (!cancelled) setSeasonEpisodes([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingEpisodes(false);
      });
    return () => { cancelled = true; };
  }, [type, tmdbId, selectedSeason]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    playerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleEpisodeSelect = useCallback((seasonNum: number, episodeNum: number) => {
    setSelectedSeason(seasonNum);
    setSelectedEpisode(episodeNum);
    setIsPlaying(true);
    const url = `/watch/${type}/${tmdbId}?season=${seasonNum}&episode=${episodeNum}&mode=watch`;
    window.history.pushState({}, '', url);
    playerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [type, tmdbId]);

  const handleNextEpisode = useCallback(() => {
    const nextEp = selectedEpisode + 1;
    handleEpisodeSelect(selectedSeason, nextEp);
  }, [selectedEpisode, selectedSeason, handleEpisodeSelect]);

  const handleToggleFavorite = useCallback(() => {
    setIsFav((prev) =>
      toggleFavorite({
        type,
        id: tmdbId,
        title: details.title || details.name || 'Unknown',
        poster_path: details.poster_path,
      })
    );
  }, [type, tmdbId, details.poster_path, details.title, details.name]);

  const handleShare = useCallback(async () => {
    const shareData = {
      title,
      text: `${title} ${year}`.trim(),
      url: window.location.href,
    };

    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User canceled or share failed — fall through to clipboard
      }
    }

    // Fallback: copy link to clipboard
    if (typeof window !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [title, year]);

  const runtime = details.runtime || details.episode_run_time?.[0] || 0;
  const formatRuntime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };
  const cast = details.credits?.cast?.slice(0, 8) || [];
  const backdropUrl = getBackdropUrl(details.backdrop_path, 'original');
  const recommended = (details.similar?.results || details.recommendations?.results || [])
    .map((item) => ({
      ...item,
      media_type: (item.media_type === 'tv' ? 'tv' : 'movie') as 'movie' | 'tv',
    }))
    .slice(0, 12);

  const matchPercentage = details.vote_average > 0
    ? Math.min(99, Math.max(75, Math.round(details.vote_average * 10 + 3)))
    : 95;

  const trailers = (details.videos?.results || [])
    .filter((v: TMDBVideo) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'))
    .slice(0, 6);

  if (isTitleBlocked) {
    return (
      <div className="min-h-screen bg-[#000000] text-white pb-24 pt-[68px]">
        <div className="nf-row-pad text-center pt-24">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-600/15 text-3xl ring-1 ring-red-600/30">
            🚫
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white">This title is currently not available</h2>
          <p className="mb-6 text-slate-400">This title has been restricted per content availability guidelines.</p>
          <Link href="/" className="nf-btn nf-btn-red">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white overflow-y-auto pb-32 pt-14 md:pt-16 lg:pt-16">
      {/* STICKY SUB-HEADER */}
      <div className="border-b border-white/[0.08] bg-[#000000]/90 backdrop-blur-md">
        <div className="nf-row-pad flex items-center justify-between gap-3 px-4 sm:px-6 py-2">
          <Link
            href="/"
            className="nf-focus inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Browse</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleFavorite}
              className="nf-focus flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white backdrop-blur-md transition-all hover:border-white/60 hover:bg-black/80 hover:scale-105 cursor-pointer"
              title={isFav ? 'Remove from My List' : 'Add to My List'}
            >
              {isFav ? <Check className="h-5 w-5 text-emerald-400" /> : <Plus className="h-5 w-5" />}
            </button>
            <button
              onClick={handleShare}
              className="nf-focus flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white backdrop-blur-md transition-all hover:border-white/60 hover:bg-black/80 hover:scale-105 cursor-pointer"
              title="Share Title"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* PLAYER / HERO CONTAINER */}
      <div ref={playerSectionRef} className={cn('nf-row-pad pt-2', 'md:max-w-6xl md:mx-auto')}>
        <VidSrcPlayer
          type={type}
          tmdbId={tmdbId}
          imdbId={details.external_ids?.imdb_id ?? null}
          season={selectedSeason}
          episode={selectedEpisode}
          title={title}
          backdropUrl={backdropUrl}
          isPlaying={isPlaying}
          onPlay={handlePlay}
          onNextEpisode={type === 'tv' ? handleNextEpisode : undefined}
          hasNextEpisode={type === 'tv' && seasonEpisodes.length > selectedEpisode}
        />
      </div>

      {/* METADATA & ACTION CONTROLS */}
      <div className="nf-row-pad">
        <div className={cn('md:max-w-6xl md:mx-auto', 'overflow-hidden rounded-xl md:rounded-2xl bg-black border border-white/[0.08]')}>
          {/* Brand + Title */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#e50914]">
                {type === 'tv' ? 'FILMFLIX SERIES' : 'FILMFLIX ORIGINAL'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">{title}</h1>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 px-4 sm:px-6 pb-2">
            <span className="font-extrabold text-[#46d369]">{matchPercentage}% Match</span>
            {year && <span className="text-slate-300">{year}</span>}
            <span className="rounded border border-[#e50914] px-2 py-0.5 text-[10px] font-bold text-[#e50914]">
              TV-MA
            </span>
            <span className="rounded border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
              Ultra HD 4K
            </span>
            <span className="text-slate-300">
              {type === 'tv'
                ? `${seasons.length || 1} Seasons`
                : runtime > 0
                  ? formatRuntime(runtime)
                  : ''}
            </span>
          </div>

          {/* Tagline */}
          <p className="px-4 sm:px-6 pb-4 text-slate-400 leading-relaxed">
            {details.overview || 'Stream this title in stunning high definition on FilmFlix.'}
          </p>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 pb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePlay}
                className="nf-focus flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-extrabold text-black shadow-2xl transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Play className="h-5 w-5 fill-current" />
                <span>Play</span>
              </button>
              <button
                className="nf-focus flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-white/[0.1] hover:text-white transition-all cursor-pointer"
              >
                <Film className="h-4 w-4" />
                <span>Trailer</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleFavorite}
                className="nf-focus flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white backdrop-blur-md transition-all hover:border-white/60 hover:bg-black/80 hover:scale-105 cursor-pointer"
                title={isFav ? 'Remove from My List' : 'Add to My List'}
              >
                {isFav ? <Check className="h-5 w-5 text-emerald-400" /> : <Plus className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setLiked((p) => !p)}
                className={cn(
                  'nf-focus flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition-all hover:scale-105 cursor-pointer',
                  liked
                    ? 'border-red-500/50 bg-red-600/30 text-red-400'
                    : 'border-white/30 bg-black/50 text-white hover:border-white/60 hover:bg-black/80'
                )}
                title="Rate Title"
              >
                <ThumbsUp className="h-5 w-5" />
              </button>
              <button
                onClick={handleShare}
                className="nf-focus flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white backdrop-blur-md transition-all hover:border-white/60 hover:bg-black/80 hover:scale-105 cursor-pointer"
                title="Share"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                className="nf-focus flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white backdrop-blur-md transition-all hover:border-white/60 hover:bg-black/80 hover:scale-105 cursor-pointer"
                title="Download"
              >
                <Download className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="nf-row-pad border-b border-white/[0.08]">
        <div className={cn('md:max-w-6xl md:mx-auto', 'flex overflow-x-auto gap-1 no-scrollbar pb-2 sm:pb-0')}>
          {hasEpisodes && (
            <button
              onClick={() => setActiveTab('episodes')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all whitespace-nowrap border-b-2',
                activeTab === 'episodes'
                  ? 'border-[#e50914] text-white pb-[2px]'
                  : 'border-transparent text-slate-400 hover:text-white hover:border-white/20'
              )}
            >
              <Layers className="h-4 w-4" /> Episodes
            </button>
          )}
          <button
            onClick={() => setActiveTab('more')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all whitespace-nowrap border-b-2',
              activeTab === 'more'
                ? 'border-[#e50914] text-white pb-[2px]'
                : 'border-transparent text-slate-400 hover:text-white hover:border-white/20'
            )}
          >
            <Sparkles className="h-4 w-4" /> More Like This
          </button>
          <button
            onClick={() => setActiveTab('trailers')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all whitespace-nowrap border-b-2',
              activeTab === 'trailers'
                ? 'border-[#e50914] text-white pb-[2px]'
                : 'border-transparent text-slate-400 hover:text-white hover:border-white/20'
            )}
          >
            <Film className="h-4 w-4" /> Trailers &amp; More
          </button>
        </div>
      </div>

      {/* SEASON SELECTOR (TV) */}
      {type === 'tv' && seasons.length > 0 && (
        <div className="nf-row-pad">
          <div className="md:max-w-6xl md:mx-auto">
            <div className="relative">
              <select
                value={selectedSeason}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSelectedSeason(val);
                  setSelectedEpisode(1);
                  setIsPlaying(false);
                }}
                className="nf-focus appearance-none rounded-xl border border-white/20 bg-[#161725] py-2.5 pl-4 pr-10 text-sm font-bold text-white hover:border-white/40 cursor-pointer shadow-lg w-full sm:w-auto"
              >
                {seasons.map((s) => (
                  <option key={s.season_number} value={s.season_number} className="bg-[#12131e] text-white">
                    Season {s.season_number} ({s.episode_count} Episodes)
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT */}
      <div className={cn('md:max-w-6xl md:mx-auto', 'nf-row-pad pb-20')}>
        {activeTab === 'episodes' && type === 'tv' && (
          <section className="space-y-6">
            {type === 'tv' && seasons.length === 0 && (
              <p className="text-sm text-slate-400 py-6">No seasons available.</p>
            )}
            {loadingEpisodes && (
              <div className="divide-y divide-white/[0.06]">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-4 py-5 animate-pulse">
                    <div className="w-10 h-6 bg-white/[0.05] rounded" />
                    <div className="w-40 h-24 bg-white/[0.05] rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="w-1/3 h-5 bg-white/[0.05] rounded" />
                      <div className="w-full h-4 bg-white/[0.05] rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!loadingEpisodes && seasonEpisodes.length === 0 && (
              <p className="text-sm text-slate-400 py-6">No episodes found for Season {selectedSeason}.</p>
            )}
            {!loadingEpisodes && seasonEpisodes.length > 0 && (
              <div
                className={cn(
                  'flex flex-col gap-4 sm:grid sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-3',
                  type === 'tv' ? '' : ''
                )}
              >
                {seasonEpisodes.map((ep) => {
                  const isCurrent = ep.episode_number === selectedEpisode;
                  const epUrl = getBackdropUrl(ep.still_path, 'w342');
                  return (
                    <button
                      key={ep.id}
                      onClick={() => handleEpisodeSelect(selectedSeason, ep.episode_number)}
                      className={cn(
                        'group relative overflow-hidden rounded-xl bg-[#141522] border transition-all duration-200 cursor-pointer',
                        isCurrent
                          ? 'border-red-500/50 bg-red-600/10 shadow-[0_0_20px_rgba(229,9,20,0.15)]'
                          : 'border-white/[0.08] hover:border-white/20 hover:bg-white/[0.03] hover:-translate-y-1'
                      )}
                    >
                      <div className="relative aspect-[16/9] w-full overflow-hidden">
                        <img
                          src={epUrl}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-200">
                          {ep.runtime ? `${ep.runtime}m` : '45m'}
                        </span>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-xl">
                            <Play className="ml-0.5 h-5 w-5 fill-current" />
                          </span>
                        </div>
                        {isCurrent && (
                          <span className="absolute left-1.5 top-1.5 rounded-full bg-[#e50914] px-2 py-0.5 text-[9px] font-bold text-white uppercase">
                            Now Playing
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="w-6 shrink-0 text-xs font-bold text-slate-400 group-hover/ep:text-white">
                            {ep.episode_number}
                          </span>
                          <span className="text-xs font-semibold text-slate-400 shrink-0">
                            {ep.runtime ? `${ep.runtime}m` : ''}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white group-hover/ep:text-red-400 transition-colors leading-tight">
                          {ep.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 line-clamp-3 mt-1">
                          {ep.overview || 'Episode description unavailable.'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}
        {activeTab === 'more' && (
          <section>
            {recommended.length === 0 ? (
              <p className="text-sm text-slate-400 py-6">No similar titles available.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {recommended.map((item) => (
                  <MediaCard key={`${item.media_type}-${item.id}`} {...item} />
                ))}
              </div>
            )}
          </section>
        )}
        {activeTab === 'trailers' && (
          <section>
            {trailers.length === 0 ? (
              <p className="text-sm text-slate-400 py-6">No trailers available for this title.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {trailers.map((video) => (
                  <div
                    key={video.id}
                    className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-[#141522] border border-white/[0.08] cursor-pointer hover:border-white/20 transition-colors"
                    onClick={() => {
                      window.open(`https://www.youtube.com/watch?v=${video.key}`, '_blank');
                    }}
                  >
                    <img
                      src={`https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`}
                      alt={video.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-sm font-bold text-white line-clamp-2">{video.name}</h3>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-xl">
                        <Play className="ml-0.5 h-6 w-6 fill-current" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
