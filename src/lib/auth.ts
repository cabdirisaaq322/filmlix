'use client';

import { initFirebase, getFirebase } from './firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';

export const ADMIN_EMAIL = 'rookiname@gmail.com';

let authListenerUnsubscribe: (() => void) | null = null;

const provider = new GoogleAuthProvider();

export function signIn(): Promise<User> {
  const { auth } = initFirebase();
  return signInWithPopup(auth, provider).then((cred) => cred.user);
}

export function signOut(): Promise<void> {
  const firebase = getFirebase();
  if (!firebase) return Promise.resolve();
  return firebaseSignOut(firebase.auth);
}

export function isAdmin(user: User | null): boolean {
  return !!user && user.email === ADMIN_EMAIL;
}

export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  const { auth } = initFirebase();
  const unsubscribe = onAuthStateChanged(auth, callback);
  authListenerUnsubscribe = unsubscribe;
  return () => {
    unsubscribe();
    if (authListenerUnsubscribe === unsubscribe) authListenerUnsubscribe = null;
  };
}

export function getCurrentUser(): User | null {
  const firebase = getFirebase();
  return firebase ? firebase.auth.currentUser : null;
}
