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
  onSelect?: (url: string, name: string) => void;
}

export function ServerSelector({ type, tmdbId, season = 1, episode = 1, trailerKey, archiveId, onSelect }: ServerSelectorProps) {
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
    <div className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2.5">
      {/* Header row */}
      <div className="flex items-center gap-2">
        <span className="flex min-w-0 flex-1 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
          <span className="truncate">Servers</span>
        </span>
      </div>

      {/* Server pills â€” wrap into neat rows on phones, single row on desktop */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {servers.map((server) => {
          const isTrailer = server.name === 'Trailer';
          return (
            <button
              key={server.name}
              onClick={() => selectServer(server.idx)}
              title={`${server.name} â€” click to play`}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition-all sm:px-2.5 sm:py-1 sm:text-[11px]',
                'border-slate-700 bg-slate-800/60 text-slate-200 hover:border-emerald-400 hover:bg-emerald-500/15 hover:text-emerald-200'
              )}
            >
              {isTrailer ? <Play className="h-3 w-3" /> : <Hand className="h-3 w-3" />}
              <span className="whitespace-nowrap">{server.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
