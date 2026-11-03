import { NextRequest, NextResponse } from 'next/server';
import {
  getAllBlockedRecords,
  addOrUpdateBlockedRecord,
  toggleBlockedRecord,
  removeBlockedRecord,
} from '@/lib/server-blocklist';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

// GET /api/admin/block — list all records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const onlyBlocked = searchParams.get('active') === 'true';

    const records = await getAllBlockedRecords();
    const result = onlyBlocked ? records.filter((r) => r.is_blocked) : records;

    return NextResponse.json(
      {
        success: true,
        total: result.length,
        items: result,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('[API /api/admin/block GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blocked titles.' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// POST /api/admin/block — add or update title
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tmdbId = parseInt(body.tmdbId, 10);
    const type = body.type === 'tv' ? 'tv' : 'movie';
    const title = typeof body.title === 'string' ? body.title.trim() : '';

    if (!tmdbId || isNaN(tmdbId) || !title) {
      return NextResponse.json(
        { success: false, error: 'tmdbId and title are required.' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const isBlocked = body.is_blocked !== undefined ? Boolean(body.is_blocked) : true;
    const status = body.status === 'visible' ? 'visible' : 'hidden';

    const item = await addOrUpdateBlockedRecord({
      tmdbId,
      type,
      title,
      poster_path: body.poster_path || null,
      reason: body.reason || '',
      is_blocked: isBlocked,
      status,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Title successfully added to blocklist.',
        item,
      },
      { status: 201, headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('[API /api/admin/block POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add title to blocklist.' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// PATCH /api/admin/block — toggle status (block / unblock)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body.id;
    const tmdbId = body.tmdbId ? parseInt(body.tmdbId, 10) : undefined;
    const identifier = id || tmdbId;

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: 'id or tmdbId is required.' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    // Determine target blocked state
    let targetBlocked = true;
    if (typeof body.is_blocked === 'boolean') {
      targetBlocked = body.is_blocked;
    } else if (typeof body.active === 'boolean') {
      targetBlocked = body.active;
    } else if (body.status) {
      targetBlocked = body.status === 'hidden';
    }

    const updated = await toggleBlockedRecord(identifier, targetBlocked);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Title not found in blocklist.' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: targetBlocked ? 'Title blocked successfully.' : 'Title unblocked successfully.',
        item: updated,
      },
      { status: 200, headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('[API /api/admin/block PATCH] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update title status.' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// DELETE /api/admin/block — remove record
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryId = searchParams.get('id');
    const queryTmdbId = searchParams.get('tmdbId');

    let bodyId: string | undefined;
    let bodyTmdbId: number | undefined;
    try {
      const body = await request.json();
      bodyId = body?.id;
      bodyTmdbId = body?.tmdbId ? parseInt(body.tmdbId, 10) : undefined;
    } catch {
      // Body is optional if query params are present
    }

    const identifier = queryId || bodyId || queryTmdbId || bodyTmdbId;

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: 'id or tmdbId is required to delete.' },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }

    const removed = await removeBlockedRecord(identifier);

    return NextResponse.json(
      {
        success: true,
        message: removed ? 'Title removed from blocklist.' : 'Title was not in blocklist.',
      },
      { status: 200, headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('[API /api/admin/block DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove title from blocklist.' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}
