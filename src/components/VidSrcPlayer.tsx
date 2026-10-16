'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Loader2, X, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Provider {
  id: string;
  name: string;
  badge?: string;
  buildUrl: (params: {
    type: 'movie' | 'tv';
    tmdbId: number;
    imdbId?: string | null;
    season: number;
    episode: number;
    domain?: string;
  }) => string;
}

export const VIDSRC_DOMAINS = [
  'vidsrc.me',
  'vidsrc.to',
  'vidsrc.net',
  'vidsrc.cc',
  'vidsrc.xyz',
] as const;

export const STREAM_PROVIDERS: Provider[] = [
  {
    id: 'vidsrc',
    name: 'VidSrc',
    badge: 'Multi-Mirror',
    buildUrl: ({ type, tmdbId, imdbId, season, episode, domain = 'vidsrc.to' }) => {
      const identifier = type === 'tv' && imdbId ? imdbId : String(tmdbId);
      const base = `https://${domain}/embed/${type}/${identifier}`;
      if (type === 'tv') {
        return `${base}/${season}/${episode}`;
      }
      return base;
    },
  },
  {
    id: '2embed',
    name: '2Embed',
    badge: 'Fastest',
    buildUrl: ({ type, tmdbId, season, episode }) => {
      if (type === 'tv') {
        return `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`;
      }
      return `https://www.2embed.cc/embed/${tmdbId}`;
    },
  },
  {
    id: 'multiembed',
    name: 'MultiEmbed',
    badge: 'Fast',
    buildUrl: ({ type, tmdbId, season, episode }) => {
      const base = `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
      if (type === 'tv') {
        return `${base}&s=${season}&e=${episode}`;
      }
      return base;
    },
  },
  {
    id: 'vidlink',
    name: 'VidLink',
    badge: 'HD',
    buildUrl: ({ type, tmdbId, season, episode }) => {
      if (type === 'tv') {
        return `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`;
      }
      return `https://vidlink.pro/movie/${tmdbId}`;
    },
  },
];

interface VidSrcPlayerProps {
  type: 'movie' | 'tv';
  tmdbId: number;
  imdbId?: string | null;
  season?: number;
  episode?: number;
  autoPlay?: boolean;
  title?: string;
}

export function VidSrcPlayer({
  type,
  tmdbId,
  imdbId,
  season = 1,
  episode = 1,
  autoPlay = false,
  title,
}: VidSrcPlayerProps) {
  const [selectedProviderId, setSelectedProviderId] = useState<string>(STREAM_PROVIDERS[0].id);
  const [activeDomainIndex, setActiveDomainIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  const currentProvider =
    STREAM_PROVIDERS.find((p) => p.id === selectedProviderId) || STREAM_PROVIDERS[0];
  const activeVidSrcDomain = VIDSRC_DOMAINS[activeDomainIndex];

  // Reset loading state whenever the streamed title/episode changes
  useEffect(() => {
    loadedRef.current = false;
  }, [type, tmdbId, imdbId, season, episode]);

  // Drop the loading badge quickly if the iframe silently finishes (some embeds suppress onLoad)
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [selectedProviderId, activeVidSrcDomain, type, tmdbId, imdbId, season, episode, reloadNonce]);

  const handleReload = useCallback(() => {
    loadedRef.current = false;
    setIsLoading(true);
    setError(null);
    setReloadNonce((n) => n + 1);
  }, []);

  const buildSrc = useCallback(() => {
    const url = new URL(currentProvider.buildUrl({
      type,
      tmdbId,
      imdbId,
      season,
      episode,
      domain: activeVidSrcDomain,
    }));
    if (autoPlay) url.searchParams.set('autoplay', '1');
    return url.toString();
  }, [currentProvider, type, tmdbId, imdbId, season, episode, activeVidSrcDomain, autoPlay]);

  const handleIframeLoad = () => {
    loadedRef.current = true;
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    loadedRef.current = true;
    setIsLoading(false);
    setError(`Failed to load stream from ${currentProvider.name}. Try switching provider.`);
  };

  const switchProvider = useCallback((direction: 'next' | 'prev' | string) => {
    if (direction === 'next' || direction === 'prev') {
      const currentIndex = STREAM_PROVIDERS.findIndex((p) => p.id === selectedProviderId);
      const nextIndex =
        direction === 'next'
          ? (currentIndex + 1) % STREAM_PROVIDERS.length
          : (currentIndex - 1 + STREAM_PROVIDERS.length) % STREAM_PROVIDERS.length;
      setSelectedProviderId(STREAM_PROVIDERS[nextIndex].id);
    } else {
      setSelectedProviderId(direction);
    }
    loadedRef.current = false;
    setIsLoading(true);
    setError(null);
  }, [selectedProviderId]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const src = buildSrc();

  return (
    <div id="video-player" className="w-full min-w-0 scroll-mt-36 space-y-3 md:scroll-mt-24">
      {/* Provider Selector & Top Utilities (cleanly outside video frame) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            <span>Server:</span>
          </div>
          {STREAM_PROVIDERS.map((provider) => {
            const isActive = provider.id === selectedProviderId;
            return (
              <button
                key={provider.id}
                onClick={() => switchProvider(provider.id)}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800 border border-slate-800'
                )}
              >
                <span>{provider.name}</span>
                {provider.badge && (
                  <span
                    className={cn(
                      'px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase',
                      isActive ? 'bg-indigo-700/80 text-white' : 'bg-slate-800 text-slate-400'
                    )}
                  >
                    {provider.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Server Actions outside video player: Mirror select + Reload */}
        <div className="flex items-center gap-2 shrink-0">
          {selectedProviderId === 'vidsrc' && (
            <select
              value={activeDomainIndex}
              onChange={(e) => {
                setActiveDomainIndex(Number(e.target.value));
                setIsLoading(true);
              }}
              className="bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              aria-label="Select VidSrc mirror"
            >
              {VIDSRC_DOMAINS.map((domain, i) => (
                <option key={domain} value={i}>
                  {domain}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={handleReload}
            className="p-1.5 bg-slate-900/80 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors border border-slate-800 cursor-pointer"
            aria-label="Reload stream"
            title="Reload stream"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Video Frame — Clean 100% unobstructed native player */}
      <div
        ref={playerContainerRef}
        className={cn(
          'relative bg-black rounded-xl overflow-hidden',
          'aspect-video w-full shadow-2xl border border-slate-800',
          isFullscreen && 'fixed inset-0 z-[100] rounded-none aspect-auto h-screen w-screen border-0'
        )}
        role="region"
        aria-label={`${title || 'Video'} player`}
      >
        {/* Error overlay blocks; loading badge is non-blocking so the stream can paint immediately */}
        {isLoading && !error && (
          <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-white shadow-lg">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
            <span className="text-xs font-medium text-slate-200">{currentProvider.name}</span>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 text-white p-6 text-center max-w-sm">
              <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center">
                <X className="w-7 h-7 text-red-400" />
              </div>
              <p className="text-sm text-slate-200">{error}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => switchProvider('next')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Try Next Server
                </button>
                <button
                  onClick={handleReload}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold transition-colors border border-slate-700 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 inline mr-1" /> Reload
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Embedded Video Iframe - zero blocking overlays on top */}
        <iframe
          key={`${selectedProviderId}-${activeVidSrcDomain}-${reloadNonce}`}
          ref={iframeRef}
          src={src}
          title={`${title || 'Stream'} - ${type === 'movie' ? 'Movie' : `S${season}E${episode}`}`}
          className="w-full h-full border-0 relative z-0"
          loading="eager"
          referrerPolicy="origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      </div>
    </div>
  );
}