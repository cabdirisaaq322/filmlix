'use client';

import { initFirebase } from './firebase';
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore';

export interface BlockedMovie {
  id: string;
  tmdbId: number;
  type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  reason: string;
  createdAt: number;
}

const COLLECTION = 'blockedMovies';

function toBlockedMovie(docRef: { id: string; data: () => DocumentData }): BlockedMovie {
  const d = docRef.data();
  return {
    id: docRef.id,
    tmdbId: d.tmdbId,
    type: d.type,
    title: d.title,
    poster_path: d.poster_path ?? null,
    reason: d.reason || '',
    createdAt: d.createdAt?.toMillis?.() || Date.now(),
  };
}

export async function getBlockedMovies(): Promise<BlockedMovie[]> {
  const { db } = initFirebase();
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(toBlockedMovie);
}

export async function addBlockedMovie(item: Omit<BlockedMovie, 'id' | 'createdAt'>): Promise<string> {
  const { db } = initFirebase();
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...item,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function removeBlockedMovie(id: string): Promise<void> {
  const { db } = initFirebase();
  await deleteDoc(doc(db, COLLECTION, id));
}

export function isBlocked(movies: BlockedMovie[], type: 'movie' | 'tv', tmdbId: number): boolean {
  return movies.some((m) => m.type === type && m.tmdbId === tmdbId);
}
