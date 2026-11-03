import { NextRequest, NextResponse } from 'next/server';
import { searchMulti, BLOCKLISTED_MOVIE_IDS, TMDBMovie, TMDBTVShow } from '@/lib/tmdb';
import { getActiveBlockedIds } from '@/lib/server-blocklist';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  if (!q.trim()) {
    return NextResponse.json({
      success: true,
      query: '',
      total: 0,
      results: [],
    });
  }

  try {
    const [rawResults, dbBlockedIds] = await Promise.all([
      searchMulti(q).catch(() => [] as Array<TMDBMovie | TMDBTVShow>),
      getActiveBlockedIds().catch(() => [] as number[]),
    ]);

    const blockedSet = new Set<number>([
      ...BLOCKLISTED_MOVIE_IDS,
      ...dbBlockedIds,
    ]);

    // Backend query filter: completely excludes records where is_blocked = 1 or status = 'hidden'
    const filteredResults = (rawResults || []).filter((item) => {
      if (!item || typeof item.id !== 'number') return false;
      return !blockedSet.has(item.id);
    });

    return NextResponse.json(
      {
        success: true,
        query: q,
        total: filteredResults.length,
        results: filteredResults,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('[API /api/search] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to execute search.',
        results: [],
      },
      { status: 500 }
    );
  }
}
