import { NextRequest, NextResponse } from 'next/server';
import { getTop10Rankings, RankingPeriod, RankingMedia } from '@/lib/tmdb';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const periodParam = (searchParams.get('period') || 'today') as RankingPeriod;
  const mediaParam = (searchParams.get('media') || 'all') as RankingMedia;

  const validPeriods: RankingPeriod[] = ['today', 'week', 'month'];
  const validMedia: RankingMedia[] = ['all', 'movie', 'tv'];

  const period: RankingPeriod = validPeriods.includes(periodParam) ? periodParam : 'today';
  const media: RankingMedia = validMedia.includes(mediaParam) ? mediaParam : 'all';

  const items = await getTop10Rankings(period, media);

  return NextResponse.json(
    {
      period,
      media,
      total: items.length,
      items,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    }
  );
}
