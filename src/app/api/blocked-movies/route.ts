import { NextRequest, NextResponse } from 'next/server';
import { getActiveBlockedIds, getAllBlockedRecords } from '@/lib/server-blocklist';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const full = searchParams.get('full') === 'true';

    if (full) {
      const records = await getAllBlockedRecords();
      return NextResponse.json(
        { success: true, items: records },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        }
      );
    }

    const ids = await getActiveBlockedIds();
    return NextResponse.json(
      { success: true, blocked: ids },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('[API /api/blocked-movies] Error:', error);
    return NextResponse.json(
      { success: false, blocked: [] },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}
