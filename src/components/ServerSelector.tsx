'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Check, Hand, Loader2, RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SCANNER_SANDBOX = 'allow-scripts allow-same-origin allow-forms allow-presentation';
const SCAN_TIMEOUT = 8000;
const CACHE_MS = 10 * 60 * 1000;

type ScanState = 'wait' | 'scan' | 'ok' | 'fail';

interface ScanStatus {
  state: ScanState;
  ms?: number;
}

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
  /** Manual-only: excluded from auto-scan/fastest contest, always clickable. */
  manual?: boolean;
  getUrl: (ctx: Ctx) => string | null;
}

const DEFAULT_SERVERS: ServerDef[] = [
  {
    name: 'Naruto',
    manual: true,
    getUrl: (ctx) =>
      ctx.type === 'movie'
        ? `https://embed.smashystream.com/playere.php?tmdb=${ctx.id}`
        : `https://embed.smashystream.com/playere.php?tmdb=${ctx.id}&s=${ctx.season || 1}&e=${ctx.episode || 1}`,
  },
  {
    name: 'Boruto',
    getUrl: (ctx) =>
      ctx.type === 'movie'
        ? `https://vidcore.org/embed/movie/${ctx.id}`
        : `https://vidcore.org/embed/tv/${ctx.id}/${ctx.season || 1}/${ctx.episode || 1}`,
  },
  {
    name: 'Sasuke',
    getUrl: (ctx) =>
      ctx.type === 'movie'
        ? `https://vidsrc.party/embed/movie/${ctx.id}`
        : `https://vidsrc.party/embed/tv/${ctx.id}/${ctx.season || 1}/${ctx.episode || 1}`,
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
  /** Fires once when a scan (or cached scan) has fully settled. decided=true if a winner was picked. */
  onScanEnd?: (decided: boolean) => void;
}

/** Lowest-ms working server from a status map, or null if none. */
function fastestWinner(st: Record<number, ScanStatus>): number | null {
  let best: number | null = null;
  let bestMs = Infinity;
  for (const [k, v] of Object.entries(st)) {
    if (v.state === 'ok' && v.ms != null && v.ms < bestMs) {
      bestMs = v.ms;
      best = Number(k);
    }
  }
  return best;
}

export function ServerSelector({ type, tmdbId, season = 1, episode = 1, trailerKey, archiveId, onSelect, onScanEnd }: ServerSelectorProps) {
  const ctx: Ctx = { id: tmdbId, type, season, episode, trailerKey, archiveId };
  const [statuses, setStatuses] = useState<Record<number, ScanStatus>>({});
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const onScanEndRef = useRef(onScanEnd);
  onScanEndRef.current = onScanEnd;

  const framesRef = useRef<HTMLIFrameElement[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  // v5: VidsRcprime (Sarada) removed from the list — stale caches must not include it
  const cacheKey = `ss_cache_v5_${type}_${tmdbId}_${season}_${episode}`;

  const servers = DEFAULT_SERVERS.map((s, idx) => ({ ...s, idx })).filter((s) => s.getUrl(ctx));
  // Only non-manual servers take part in the auto-scan / fastest contest
  const scanTargets = servers.filter((s) => !s.manual);
  // Set once the user clicks a pill manually — scan must not override their choice
  const userPickedRef = useRef(false);

  const clearScanArtifacts = useCallback(() => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
    framesRef.current.forEach((f) => {
      if (f.parentNode) f.parentNode.removeChild(f);
    });
    framesRef.current = [];
  }, []);

  const pickAndPlay = useCallback(
    (st: Record<number, ScanStatus>) => {
      const winner = fastestWinner(st);
      if (winner == null) return null;
      setActiveIdx(winner);
      const server = DEFAULT_SERVERS[winner];
      const url = server.getUrl(ctx);
      if (url) onSelectRef.current?.(url, server.name);
      return winner;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [type, tmdbId, season, episode, trailerKey, archiveId]
  );

  const runScan = useCallback(
    (force = false) => {
      clearScanArtifacts();
      userPickedRef.current = false;

      // ---- Cached results: recompute the FASTEST from them, never trust a stored "first" ----
      if (!force) {
        try {
          const raw = sessionStorage.getItem(cacheKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Date.now() - parsed.timestamp < CACHE_MS && parsed.cachedStatuses) {
              const st: Record<number, ScanStatus> = parsed.cachedStatuses;
              const complete = scanTargets.every((s) => st[s.idx]);
              if (!complete) {
                // Cache from an older server list — fall through to a fresh scan
                sessionStorage.removeItem(cacheKey);
              } else {
                setStatuses(st);
                setIsScanning(false);
                const winner = pickAndPlay(st);
                onScanEndRef.current?.(winner != null);
                return;
              }
            }
          }
        } catch {
          // ignore invalid cache
        }
      }

      // ---- Fresh PARALLEL scan of the 3 auto servers only (Naruto is manual) ----
      const initStatuses: Record<number, ScanStatus> = {};
      scanTargets.forEach((s) => {
        initStatuses[s.idx] = { state: 'wait' };
      });
      const finalStatuses: Record<number, ScanStatus> = { ...initStatuses };
      setStatuses(finalStatuses);
      setActiveIdx(null);
      setIsScanning(true);

      let remaining = scanTargets.length;

      const onAllSettled = () => {
        setIsScanning(false);
        // Never stomp a manual pick made while the scan was running
        const winner = userPickedRef.current ? fastestWinner(finalStatuses) : pickAndPlay(finalStatuses);
        if (winner != null) {
          try {
            sessionStorage.setItem(
              cacheKey,
              JSON.stringify({ timestamp: Date.now(), cachedStatuses: { ...finalStatuses } })
            );
          } catch {
            // ignore quota errors
          }
        }
        onScanEndRef.current?.(winner != null);
      };

      if (remaining === 0) {
        onAllSettled();
        return;
      }

      scanTargets.forEach((server) => {
        const url = server.getUrl(ctx) as string;
        finalStatuses[server.idx] = { state: 'scan' };
        setStatuses({ ...finalStatuses });

        const startTime = Date.now();
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.setAttribute('sandbox', SCANNER_SANDBOX);
        iframe.src = url;
        framesRef.current.push(iframe);

        let settled = false;
        const settle = (state: ScanState) => {
          if (settled) return;
          settled = true;
          const idx = timeoutsRef.current.indexOf(timeoutId);
          if (idx !== -1) timeoutsRef.current.splice(idx, 1);
          clearTimeout(timeoutId);
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
          const fi = framesRef.current.indexOf(iframe);
          if (fi !== -1) framesRef.current.splice(fi, 1);

          const ms = Date.now() - startTime;
          finalStatuses[server.idx] = { state, ms: state === 'ok' ? ms : undefined };
          setStatuses({ ...finalStatuses });
          remaining--;
          if (remaining === 0) onAllSettled();
        };

        const timeoutId = setTimeout(() => settle('fail'), SCAN_TIMEOUT);
        timeoutsRef.current.push(timeoutId);
        iframe.onload = () => settle('ok');
        iframe.onerror = () => settle('fail');
        document.body.appendChild(iframe);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [type, tmdbId, season, episode, trailerKey, archiveId]
  );

  useEffect(() => {
    runScan();
    return clearScanArtifacts;
  }, [runScan, clearScanArtifacts]);

  const selectServer = (idx: number) => {
    const server = DEFAULT_SERVERS[idx];
    const url = server.getUrl(ctx);
    if (!url) return;
    userPickedRef.current = true;
    setActiveIdx(idx);
    onSelect?.(url, server.name);
  };

  const doneCount = Object.values(statuses).filter((s) => s.state === 'ok' || s.state === 'fail').length;
  const scanDone = scanTargets.length > 0 && doneCount >= scanTargets.length;
  const activeServer = activeIdx != null ? servers.find((s) => s.idx === activeIdx) : undefined;

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-slate-950/70 p-2.5 shadow-lg shadow-black/40 backdrop-blur-sm sm:px-3 sm:py-3">
      {/* Header: status + progress count */}
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <span className="flex shrink-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 sm:text-[11px]">
          <span className={cn('h-1.5 w-1.5 rounded-full', isScanning ? 'animate-pulse bg-yellow-400' : scanDone ? 'bg-emerald-400' : 'bg-slate-500')} />
          {isScanning ? 'Finding best…' : scanDone ? 'Fastest server' : 'Servers'}
        </span>
        <span className="shrink-0 text-[10px] tabular-nums text-slate-500">
          {doneCount}/{scanTargets.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-2.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            isScanning ? 'bg-yellow-400' : scanDone ? 'bg-emerald-400' : 'bg-white/30'
          )}
          style={{ width: `${scanTargets.length ? (doneCount / scanTargets.length) * 100 : 0}%` }}
        />
      </div>

      {/* Winner banner */}
      {activeServer && !isScanning && (
        <div className="mb-2.5 flex items-center justify-between gap-2 rounded-lg bg-emerald-500/15 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-300">
          <span className="flex min-w-0 items-center gap-1.5">
            <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">Playing on {activeServer.name}</span>
          </span>
          {statuses[activeServer.idx]?.ms != null && (
            <span className="shrink-0 tabular-nums opacity-70">{statuses[activeServer.idx]?.ms}ms</span>
          )}
        </div>
      )}

      {/* Server cards — 2-col grid on phones, inline pills on desktop */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-1.5">
          {servers.map((server) => {
            const manual = !!server.manual;
            const st = statuses[server.idx] || { state: 'wait' as ScanState };
            const isActive = activeIdx === server.idx;
            // Manual servers are never scanned — always clickable
            const disabled = manual ? false : st.state === 'wait' || st.state === 'scan' || st.state === 'fail';
            return (
              <button
                key={server.name}
                disabled={disabled}
                onClick={() => selectServer(server.idx)}
                title={
                  manual
                    ? `${server.name} — manual server, click to play (not scanned)`
                    : st.state === 'ok'
                      ? `${server.name} responded in ${st.ms}ms`
                      : st.state === 'fail'
                        ? `${server.name} not responding`
                        : 'Checking...'
                }
                className={cn(
                  'flex min-w-0 items-center gap-2 rounded-xl border px-2.5 py-2.5 text-left text-xs font-medium transition-all sm:shrink-0 sm:rounded-full sm:gap-1.5 sm:py-1 sm:text-[11px]',
                  manual &&
                    (isActive
                      ? 'border-violet-400 bg-violet-500/25 text-violet-200 shadow-[0_0_10px_-2px_rgba(167,139,250,0.6)]'
                      : 'border-violet-500/40 bg-violet-500/10 text-violet-300 hover:border-violet-400 hover:bg-violet-500/20'),
                  !manual && st.state === 'wait' && 'border-slate-800 bg-slate-900/60 text-slate-500',
                  !manual && st.state === 'scan' && 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400',
                  !manual && st.state === 'fail' && 'border-slate-800 bg-slate-900/60 text-slate-600 line-through',
                  !manual && st.state === 'ok' && !isActive && 'border-emerald-600/50 bg-emerald-500/10 text-emerald-400 hover:border-emerald-400',
                  !manual && st.state === 'ok' && isActive && 'border-emerald-400 bg-emerald-500/25 text-emerald-200 shadow-[0_0_10px_-2px_rgba(34,197,94,0.5)]'
                )}
              >
                <span className="flex shrink-0 items-center">
                  {manual && <Hand className="h-3.5 w-3.5 sm:h-3 sm:w-3" />}
                  {!manual && st.state === 'scan' && <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-3 sm:w-3" />}
                  {!manual && st.state === 'ok' && <Check className="h-3.5 w-3.5 sm:h-3 sm:w-3" />}
                  {!manual && st.state === 'fail' && <X className="h-3.5 w-3.5 sm:h-3 sm:w-3" />}
                  {!manual && st.state === 'wait' && <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />}
                </span>
                <span className="min-w-0 flex-1 truncate">{server.name}</span>
                {!manual && st.state === 'ok' && st.ms != null && (
                  <span className="shrink-0 text-[9px] tabular-nums opacity-70">{st.ms}ms</span>
                )}
              </button>
            );
          })}
      </div>

      {/* Rescan — full-width on phones, icon button on desktop */}
      <button
        onClick={() => runScan(true)}
        disabled={isScanning}
        aria-label="Rescan servers"
        title="Rescan servers"
        className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/60 py-2 text-[11px] font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-40 sm:mt-0 sm:w-auto sm:justify-start sm:border-0 sm:bg-transparent sm:p-0 sm:text-[11px] sm:hover:bg-transparent sm:hover:text-white"
      >
        <RefreshCw className={cn('h-3.5 w-3.5 sm:h-3 sm:w-3', isScanning && 'animate-spin')} />
        <span className="sm:hidden">{isScanning ? 'Searching…' : 'Rescan servers'}</span>
      </button>
    </div>
  );
}

