'use client';

import { Hand, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Ctx {
  id: number;
  type: string;
  season: number;
  episode: number;
  trailerKey?: string | null;
  archiveId?: string | null;
}

interface ServerDef {
  name: string;
  getUrl: (ctx: Ctx) => string | null;
}

const DEFAULT_SERVERS: ServerDef[] = [
  {
    name: 'MoviesAPI',
    getUrl: (ctx) =>
      ctx.type === 'movie'
        ? `https://moviesapi.to/movie/${ctx.id}`
        : `https://moviesapi.to/tv/${ctx.id}/${ctx.season || 1}/${ctx.episode || 1}`,
  },
  {
    name: 'VidSrc.pm',
    getUrl: (ctx) =>
      ctx.type === 'movie'
        ? `https://vidsrc.pm/embed/movie/${ctx.id}`
        : `https://vidsrc.pm/embed/tv/${ctx.id}/${ctx.season || 1}/${ctx.episode || 1}`,
  },
  {
    name: 'VidCore',
    getUrl: (ctx) =>
      ctx.type === 'movie'
        ? `https://vidcore.org/embed/movie/${ctx.id}`
        : `https://vidcore.org/embed/tv/${ctx.id}/${ctx.season || 1}/${ctx.episode || 1}`,
  },
  {
    name: 'VidSrc',
    getUrl: (ctx) =>
      ctx.type === 'movie'
        ? `https://vidsrc.party/embed/movie/${ctx.id}`
        : `https://vidsrc.party/embed/tv/${ctx.id}/${ctx.season || 1}/${ctx.episode || 1}`,
  },
  {
    name: 'SmashyStream',
    getUrl: (ctx) =>
      ctx.type === 'movie'
        ? `https://embed.smashystream.com/playere.php?tmdb=${ctx.id}`
        : `https://embed.smashystream.com/playere.php?tmdb=${ctx.id}&s=${ctx.season || 1}&e=${ctx.episode || 1}`,
  },
  {
    name: 'Trailer',
    getUrl: (ctx) => (ctx.trailerKey ? `https://www.youtube-nocookie.com/embed/${ctx.trailerKey}` : null),
  },
  {
    name: 'Archive',
    getUrl: (ctx) => (ctx.archiveId ? `https://archive.org/embed/${ctx.archiveId}` : null),
  },
];

interface ServerSelectorProps {
  type: 'movie' | 'tv';
  tmdbId: number;
  season?: number;
  episode?: number;
  trailerKey?: string | null;
  archiveId?: string | null;
  /** Name of the server currently playing — highlighted. */
  activeName?: string;
  onSelect?: (url: string, name: string) => void;
}

export function ServerSelector({ type, tmdbId, season = 1, episode = 1, trailerKey, archiveId, activeName, onSelect }: ServerSelectorProps) {
  const ctx: Ctx = { id: tmdbId, type, season, episode, trailerKey, archiveId };
  const servers = DEFAULT_SERVERS.map((s, idx) => ({ ...s, idx })).filter((s) => s.getUrl(ctx));

  const selectServer = (idx: number) => {
    const server = servers.find((s) => s.idx === idx);
    if (!server) return;
    const url = server.getUrl(ctx);
    if (!url) return;
    onSelect?.(url, server.name);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Change Server
        </span>
      </div>

      {/* Server buttons */}
      <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
        {servers.map((server) => {
          const isTrailer = server.name === 'Trailer';
          const isActive = activeName?.toLowerCase() === server.name.toLowerCase();
          return (
            <button
              key={server.name}
              onClick={() => selectServer(server.idx)}
              title={`Play on ${server.name}`}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all sm:px-4 sm:py-1.5 sm:text-xs',
                isActive
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
              )}
            >
              {isTrailer ? <Play className="h-3.5 w-3.5" /> : <Hand className="h-3.5 w-3.5" />}
              <span className="truncate">{server.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
