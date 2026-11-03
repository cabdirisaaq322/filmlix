import { NextRequest, NextResponse } from 'next/server';
import { isTitleBlocked } from '@/lib/server-blocklist';
import { BLOCKLISTED_MOVIE_IDS } from '@/lib/tmdb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Server {
  id: string;
  name: string;
  build: (ctx: {
    type: 'movie' | 'tv';
    tmdbId: number;
    season: number;
    episode: number;
  }) => string;
}

const SERVERS: Server[] = [
  {
    id: 'nxsha',
    name: 'Naruto',
    build: ({ type, tmdbId, season, episode }) =>
      type === 'tv'
        ? `https://nxsha.space/embed/tv/${tmdbId}/${season}/${episode}?server=Citadel`
        : `https://nxsha.space/embed/movie/${tmdbId}?server=Citadel`,
  },
  {
    id: 'moviesapi',
    name: 'Boruto',
    build: ({ type, tmdbId, season, episode }) =>
      type === 'tv'
        ? `https://moviesapi.to/tv/${tmdbId}/${season}/${episode}`
        : `https://moviesapi.to/movie/${tmdbId}`,
  },
  {
    id: 'vidsrc-pm',
    name: 'Sasuke',
    build: ({ type, tmdbId, season, episode }) =>
      type === 'tv'
        ? `https://vidsrc.pm/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.pm/embed/movie/${tmdbId}`,
  },
  {
    id: 'vidcore',
    name: 'Hinata',
    build: ({ type, tmdbId, season, episode }) =>
      type === 'tv'
        ? `https://vidcore.org/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidcore.org/embed/movie/${tmdbId}`,
  },
  {
    id: 'vidsrc-party',
    name: 'Sarada',
    build: ({ type, tmdbId, season, episode }) =>
      type === 'tv'
        ? `https://vidsrc.party/embed/tv/${tmdbId}/${season}/${episode}`
        : `https://vidsrc.party/embed/movie/${tmdbId}`,
  },
  {
    id: 'smashystream',
    name: 'Sakura',
    build: ({ type, tmdbId, season, episode }) =>
      type === 'tv'
        ? `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}&s=${season}&e=${episode}`
        : `https://embed.smashystream.com/playere.php?tmdb=${tmdbId}`,
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const typeParam = searchParams.get('type') === 'tv' ? 'tv' : 'movie';
  const idParam = parseInt(searchParams.get('id') || '', 10);
  const serverParam = searchParams.get('server') || 'nxsha';
  const season = parseInt(searchParams.get('season') || '1', 10);
  const episode = parseInt(searchParams.get('episode') || '1', 10);

  if (!idParam || isNaN(idParam)) {
    return NextResponse.json(
      { success: false, error: 'Valid tmdb id is required.', iframeSrc: null },
      { status: 400 }
    );
  }

  // 1. Check static blocklist
  if (BLOCKLISTED_MOVIE_IDS.includes(idParam)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden: This title is blocked by the administrator.',
        iframeSrc: null,
        is_blocked: true,
        status: 'hidden',
      },
      {
        status: 403,
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
      }
    );
  }

  // 2. Check dynamic database blocklist
  const blockedInDb = await isTitleBlocked(idParam, typeParam);
  if (blockedInDb) {
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden: This title is blocked by the administrator.',
        iframeSrc: null,
        is_blocked: true,
        status: 'hidden',
      },
      {
        status: 403,
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
      }
    );
  }

  // 3. Resolve iframe embed source URL
  const selectedServer = SERVERS.find((s) => s.id === serverParam) || SERVERS[0];
  const iframeSrc = selectedServer.build({
    type: typeParam,
    tmdbId: idParam,
    season,
    episode,
  });

  return NextResponse.json(
    {
      success: true,
      tmdbId: idParam,
      type: typeParam,
      server: selectedServer.id,
      iframeSrc,
      is_blocked: false,
      status: 'visible',
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
