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
  Volume2,
  Tv,
  Film,
  Calendar,
  Clock,
  ThumbsUp,
  Info
} from 'lucide-react';
import Link from 'next/link';
import { toggleFavorite, isFavorite } from '@/lib/favorites';
import { VidSrcPlayer } from '@/components/VidSrcPlayer';
import { saveContinueWatching } from '@/lib/history';
import {
  TMDBDetails,
  TMDBEpisode,
  BLOCKLISTED_MOVIE_IDS,
  getSeasonDetails,
  getBackdropUrl,
  getPosterUrl
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
  const requestedMode = searchParams.get('mode');

  // Active view mode: 'watch' (Stream Player) vs 'info' (Netflix Detail Overview)
  const [activeTab, setActiveTab] = useState<'watch' | 'info'>(
    requestedMode === 'info' ? 'info' : 'watch'
  );

  const [selectedSeason, setSelectedSeason] = useState(initialSeason);
  const [selectedEpisode, setSelectedEpisode] = useState(initialEpisode);
  const [seasonEpisodes, setSeasonEpisodes] = useState<TMDBEpisode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const blockedIds = useBlockedMovieIds();
  const isTitleBlocked = BLOCKLISTED_MOVIE_IDS.includes(tmdbId) || blockedIds.includes(tmdbId);

  const playerSectionRef = useRef<HTMLDivElement>(null);

  // Sync favorites
  useEffect(() => {
    if (isTitleBlocked) return;
    setIsFav(isFavorite(type, tmdbId));
  }, [type, tmdbId, isTitleBlocked]);

  // Save continue watching
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

  // Load episodes for active season
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

  const handleEpisodeSelect = useCallback((seasonNum: number, episodeNum: number) => {
    setSelectedSeason(seasonNum);
    setSelectedEpisode(episodeNum);
    setActiveTab('watch');
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

  const handleShare = useCallback(() => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

// Helper to copy text to clipboard and show feedback
  const copyToClipboard = useCallback((text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, []);

  if (isTitleBlocked) {
    return (
      <div className="min-h-screen bg-[#08080c] pb-12 pt-[68px]">
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

  const title = details.title || details.name || 'Unknown Title';
  const year = details.release_date?.slice(0, 4) || details.first_air_date?.slice(0, 4) || '';
  const genres = details.genres || [];
  const runtime = details.runtime || details.episode_run_time?.[0] || 0;
  const formatRuntime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };
  const seasons = details.seasons?.filter((s) => s.season_number > 0) || [];
  const cast = details.credits?.cast?.slice(0, 10) || [];
  const backdropUrl = getBackdropUrl(details.backdrop_path, 'original');
  const recommended = (details.similar?.results || details.recommendations?.results || [])
    .map((item) => ({
      ...item,
      media_type: (item.media_type === 'tv' ? 'tv' : 'movie') as 'movie' | 'tv',
    }))
    .slice(0, 12);

  // Netflix-style match percentage calculation
  const matchPercentage = details.vote_average > 0
    ? Math.min(99, Math.max(75, Math.round(details.vote_average * 10 + 3)))
    : 95;

  return (
    <div className="min-h-screen bg-[#08080c] text-white pb-24">
      {/* 1. TOP SUB-HEADER TAB SWITCHER: STREAM VS OVERVIEW */}
      <div className="sticky top-0 left-0 right-0 z-40 border-b border-white/[0.08] bg-[#08080c]/90 px-4 py-2 md:px-6 sm:px-4 max-w-full">
        <div className="nf-row-pad flex items-center justify-between gap-4">
          <Link
            href="/"
            className="nf-focus inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Browse</span>
          </Link>

          {/* NETFLIX MODE TABS */}
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1 backdrop-blur-md">
            <button
              onClick={() => setActiveTab('watch')}
              className={cn(
                'nf-focus flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer',
                activeTab === 'watch'
                  ? 'bg-gradient-to-r from-[#e50914] to-[#ff2d3b] text-white shadow-[0_2px_10px_rgba(229,9,20,0.5)]'
                  : 'text-slate-300 hover:text-white'
              )}
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Watch Stream</span>
            </button>

            <button
              onClick={() => setActiveTab('info')}
              className={cn(
                'nf-focus flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer',
                activeTab === 'info'
                  ? 'bg-white text-black shadow-md'
                  : 'text-slate-300 hover:text-white'
              )}
            >
              <Info className="h-3.5 w-3.5" />
              <span>Overview & Episodes</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleFavorite}
              className="nf-focus flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/25 hover:text-white transition-all cursor-pointer"
              title={isFav ? 'Remove from My List' : 'Add to My List'}
            >
              {isFav ? <Check className="h-4 w-4 text-emerald-400" /> : <Plus className="h-4 w-4" />}
            </button>

            <button
              onClick={() => copyToClipboard(window.location.href)}
              className="nf-focus flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/25 hover:text-white transition-all cursor-pointer"
              title="Share Title"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. WATCH STREAM MODE */}
      {activeTab === 'watch' && (
        <div ref={playerSectionRef} className="nf-row-pad pt-6 space-y-8 animate-fade-up max-w-full md:max-w-2xl lg:max-w-3xl">
          {/* Main Cinema Player */}
          <VidSrcPlayer
            type={type}
            tmdbId={tmdbId}
            imdbId={details.external_ids?.imdb_id ?? null}
            season={selectedSeason}
            episode={selectedEpisode}
            title={title}
            onNextEpisode={type === 'tv' ? handleNextEpisode : undefined}
            hasNextEpisode={type === 'tv' && seasonEpisodes.length > selectedEpisode}
          />

          {/* Quick Info bar directly below the player */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-white">{title}</h1>
              <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400">
                <span className="font-bold text-[#46d369]">{matchPercentage}% Match</span>
                {year && <span>{year}</span>}
                <span className="rounded border border-white/20 px-1.5 py-0.2 text-[10px] font-bold text-slate-300">TV-MA</span>
                <span className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.2 text-[10px] font-semibold text-slate-300">Ultra HD 4K</span>
                {type === 'tv' && (
                  <span className="text-slate-300 font-medium">
                    Season {selectedSeason} · Episode {selectedEpisode}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setActiveTab('info')}
              className="nf-focus inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-white/[0.1] hover:text-white transition-all cursor-pointer"
            >
              <Info className="h-3.5 w-3.5" />
              <span>Full Details & Episode List</span>
            </button>
          </div>

          {/* If TV Show: Quick Horizontal Episode Carousel */}
          {type === 'tv' && seasonEpisodes.length > 0 && (
            <section className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#e50914]" />
                  <span>Season {selectedSeason} Episodes</span>
                </h3>
                <span className="text-xs text-slate-400">{seasonEpisodes.length} Episodes available</span>
              </div>

              <div className="no-scrollbar flex gap-3.5 overflow-x-auto pb-3">
                {seasonEpisodes.map((ep) => {
                  const isCurrent = ep.episode_number === selectedEpisode;
                  return (
                    <button
                      key={ep.id}
                      onClick={() => handleEpisodeSelect(selectedSeason, ep.episode_number)}
                      className={cn(
                        'group/ep relative w-56 shrink-0 rounded-xl border p-2.5 text-left transition-all duration-200 cursor-pointer',
                        isCurrent
                          ? 'border-red-500/50 bg-red-600/15 shadow-lg'
                          : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.06]'
                      )}
                    >
                      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-[#141522] mb-2">
                        <img
                          src={getBackdropUrl(ep.still_path, 'w342')}
                          alt=""
                          className="h-full w-full object-cover transition-transform group-hover/ep:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <span className="absolute bottom-1 right-1.5 rounded bg-black/70 px-1.5 py-0.2 text-[9.5px] font-semibold text-slate-300">
                          {ep.runtime ? `${ep.runtime}m` : '45m'}
                        </span>
                        {isCurrent ? (
                          <span className="absolute left-1.5 top-1.5 rounded-full bg-[#e50914] px-2 py-0.2 text-[9px] font-bold text-white uppercase">
                            Now Playing
                          </span>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/ep:opacity-100 transition-opacity">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-lg">
                              <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="truncate text-xs font-bold text-white">
                        {ep.episode_number}. {ep.name}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* More like this shelf */}
          {recommended.length > 0 && (
            <div className="pt-6">
              <h2 className="text-lg font-bold text-white mb-4">More Like This</h2>
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {recommended.slice(0, 6).map((item) => (
                  <MediaCard key={`${item.media_type}-${item.id}`} {...item} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. OVERVIEW & EPISODES MODE (AUTHENTIC NETFLIX DETAIL VIEW) */}
      {activeTab === 'info' && (
        <div className="space-y-12 animate-fade-up">
          {/* BILLBOARD BACKDROP HEADER */}
          <div className="relative h-[55vh] min-h-[420px] max-h-[640px] w-full overflow-hidden bg-black">
            <img
              src={backdropUrl}
              alt=""
              className="h-full w-full object-cover object-top opacity-70"
            />
            {/* Scrims */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#08080c] via-[#08080c]/50 to-transparent" />
            <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-[#08080c] via-[#08080c]/70 to-transparent" />

            {/* Billboard Content */}
            <div className="absolute inset-0 flex items-end pb-12">
              <div className="nf-row-pad w-full space-y-4">
                <div className="max-w-2xl space-y-3">
                  <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-2xl">
                    {title}
                  </h1>

                  {/* Netflix Badges */}
                  <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-slate-200">
                    <span className="font-extrabold text-[#46d369]">{matchPercentage}% Match</span>
                    {year && <span>{year}</span>}
                    <span className="rounded border border-white/30 px-1.5 py-0.2 text-[10px] font-bold text-slate-200">
                      TV-MA
                    </span>
                    <span className="rounded border border-white/20 bg-black/40 px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider text-slate-200">
                      Ultra HD 4K
                    </span>
                    <span className="rounded border border-white/20 bg-black/40 px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider text-slate-200">
                      5.1 Audio
                    </span>
                    {type === 'tv' ? (
                      <span>{details.number_of_seasons || seasons.length || 1} Seasons</span>
                    ) : (
                      runtime > 0 && <span>{formatRuntime(runtime)}</span>
                    )}
                  </div>

                  {/* Netflix Action Row */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setActiveTab('watch');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="nf-focus flex items-center gap-2.5 rounded-lg bg-white px-7 py-3 text-sm font-extrabold text-black shadow-2xl transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Play className="h-5 w-5 fill-current" />
                      <span>Play</span>
                    </button>

                    <button
                      onClick={handleToggleFavorite}
                      className="nf-focus flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur-md transition-all hover:border-white/60 hover:bg-black/80 hover:scale-105 cursor-pointer"
                      title={isFav ? 'Remove from My List' : 'Add to My List'}
                    >
                      {isFav ? <Check className="h-5 w-5 text-emerald-400" /> : <Plus className="h-5 w-5" />}
                    </button>

                    <button
                      onClick={() => setLiked((prev) => !prev)}
                      className={cn(
                        'nf-focus flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-md transition-all hover:scale-105 cursor-pointer',
                        liked
                          ? 'border-red-500/50 bg-red-600/30 text-red-400'
                          : 'border-white/30 bg-black/50 text-white hover:border-white/60 hover:bg-black/80'
                      )}
                      title="Rate Title"
                    >
                      <ThumbsUp className="h-4 w-4" />
                    </button>

                    <button
                      onClick={handleShare}
                      className="nf-focus flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur-md transition-all hover:border-white/60 hover:bg-black/80 hover:scale-105 cursor-pointer"
                      title="Share"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="nf-row-pad space-y-12">
            {/* SYNOPSIS & CAST TWO-COLUMN LAYOUT (NETFLIX STYLE) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-sm">
              <div className="lg:col-span-8 space-y-4">
                <p className="text-base sm:text-lg leading-relaxed text-slate-200 font-normal">
                  {details.overview || 'Stream this title in stunning high definition on FilmFlix.'}
                </p>
              </div>

              <div className="lg:col-span-4 space-y-3 text-xs leading-relaxed border-t border-white/[0.08] lg:border-t-0 pt-4 lg:pt-0">
                {cast.length > 0 && (
                  <div>
                    <span className="text-slate-500">Cast: </span>
                    <span className="text-slate-300">
                      {cast.slice(0, 5).map((a) => a.name).join(', ')}
                    </span>
                  </div>
                )}

                {genres.length > 0 && (
                  <div>
                    <span className="text-slate-500">Genres: </span>
                    <span className="text-slate-300">
                      {genres.map((g) => g.name).join(', ')}
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-slate-500">This title is: </span>
                  <span className="text-slate-300">
                    Gripping, Suspenseful, Visual Masterpiece
                  </span>
                </div>

                <div>
                  <span className="text-slate-500">Audio: </span>
                  <span className="text-slate-300">
                    Original [Dolby 5.1], English [Original]
                  </span>
                </div>
              </div>
            </div>

            {/* NETFLIX EPISODES LIST (FOR TV SHOWS) */}
            {type === 'tv' && seasons.length > 0 && (
              <section className="space-y-6 pt-4 border-t border-white/[0.08]">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-2xl font-black text-white">Episodes</h2>

                  {/* Season Dropdown */}
                  <div className="relative">
                    <select
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(Number(e.target.value))}
                      className="nf-focus appearance-none rounded-xl border border-white/20 bg-[#161725] py-2 pl-4 pr-10 text-sm font-bold text-white hover:border-white/40 cursor-pointer shadow-lg"
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

                {/* Episodes Rows */}
                {loadingEpisodes ? (
                  <div className="divide-y divide-white/[0.06]">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex gap-4 py-5 animate-pulse">
                        <div className="w-12 h-6 bg-white/[0.05] rounded" />
                        <div className="w-36 h-20 bg-white/[0.05] rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <div className="w-1/3 h-5 bg-white/[0.05] rounded" />
                          <div className="w-full h-4 bg-white/[0.05] rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : seasonEpisodes.length === 0 ? (
                  <p className="text-sm text-slate-400 py-6">No episodes found for Season {selectedSeason}.</p>
                ) : (
                  <div className="divide-y divide-white/[0.06]">
                    {seasonEpisodes.map((ep) => {
                      const isCurrent = ep.episode_number === selectedEpisode;
                      return (
                        <div
                          key={ep.id}
                          onClick={() => handleEpisodeSelect(selectedSeason, ep.episode_number)}
                          className={cn(
                            'group/ep flex flex-col sm:flex-row sm:items-center gap-4 py-6 px-3 rounded-2xl transition-all cursor-pointer',
                            isCurrent
                              ? 'bg-red-600/10 border border-red-500/25'
                              : 'hover:bg-white/[0.03]'
                          )}
                        >
                          {/* Large Number */}
                          <span className="w-8 shrink-0 text-xl font-bold text-slate-400 group-hover/ep:text-white">
                            {ep.episode_number}
                          </span>

                          {/* 16:9 Thumbnail with duration */}
                          <div className="relative w-40 sm:w-48 shrink-0 aspect-[16/9] overflow-hidden rounded-xl bg-[#141522] border border-white/10 shadow-md">
                            <img
                              src={getBackdropUrl(ep.still_path, 'w342')}
                              alt=""
                              className="h-full w-full object-cover transition-transform duration-300 group-hover/ep:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/ep:opacity-100 transition-opacity">
                              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-xl">
                                <Play className="ml-0.5 h-4 w-4 fill-current" />
                              </span>
                            </div>
                            <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-200">
                              {ep.runtime ? `${ep.runtime}m` : '45m'}
                            </span>
                          </div>

                          {/* Episode Title & Description */}
                          <div className="flex-1 space-y-1.5 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="text-base font-bold text-white group-hover/ep:text-red-400 transition-colors">
                                {ep.name}
                              </h3>
                              <span className="text-xs font-semibold text-slate-400 shrink-0">
                                {ep.runtime ? `${ep.runtime}m` : ''}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm leading-relaxed text-slate-400 line-clamp-3">
                              {ep.overview || 'Episode description unavailable.'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}

            {/* MORE LIKE THIS (NETFLIX GRID) */}
            {recommended.length > 0 && (
              <section className="space-y-6 pt-6 border-t border-white/[0.08]">
                <h2 className="text-2xl font-black text-white">More Like This</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {recommended.map((item) => (
                    <MediaCard key={`${item.media_type}-${item.id}`} {...item} />
                  ))}
                </div>
              </section>
            )}

            {/* ABOUT TITLE SECTION */}
            <section className="space-y-4 pt-6 border-t border-white/[0.08] text-xs text-slate-400">
              <h2 className="text-xl font-bold text-white">About {title}</h2>
              <div className="space-y-2">
                <p>
                  <strong className="text-slate-300">Release Year:</strong> {year || 'N/A'}
                </p>
                <p>
                  <strong className="text-slate-300">Format:</strong> High Definition 1080p, Dolby Digital 5.1
                </p>
                <p>
                  <strong className="text-slate-300">Content Advisory:</strong> Recommended for general entertainment. Third-party content disclaimer applies.
                </p>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
