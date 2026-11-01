import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const BLOCKLIST_PATH = path.join(process.cwd(), 'blocked-movies.json');

export async function GET() {
  try {
    const data = await fs.readFile(BLOCKLIST_PATH, 'utf-8');
    const ids = JSON.parse(data);
    return NextResponse.json({ blocked: Array.isArray(ids) ? ids : [] });
  } catch {
    return NextResponse.json({ blocked: [] });
  }
}
