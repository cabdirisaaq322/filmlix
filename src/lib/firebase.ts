import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "filmflix-78ee2.firebaseapp.com",
  databaseURL: "https://filmflix-78ee2-default-rtdb.firebaseio.com",
  projectId: "filmflix-78ee2",
  storageBucket: "filmflix-78ee2.appspot.com",
  messagingSenderId: "400366584320",
  appId: "YOUR_WEB_APP_ID",
  measurementId: "G-XXXXXXXXXX",
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function initFirebase(): { app: FirebaseApp; auth: Auth; db: Firestore } {
  if (typeof window === 'undefined') {
    throw new Error('Firebase is client-only');
  }
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  }
  return { app, auth: auth!, db: db! };
}

export function getFirebase(): { app: FirebaseApp; auth: Auth; db: Firestore } | null {
  if (!app) return null;
  return { app, auth: auth!, db: db! };
}
