import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBPJ_8Zu_1_yl2UQTro_NYTLhYr6ttRG-M",
  authDomain: "filmflix-78ee2.firebaseapp.com",
  databaseURL: "https://filmflix-78ee2-default-rtdb.firebaseio.com",
  projectId: "filmflix-78ee2",
  storageBucket: "filmflix-78ee2.firebasestorage.app",
  messagingSenderId: "400366584320",
  appId: "1:400366584320:web:3ee7d6e936b206164f4ee5",
  measurementId: "G-6Y332KX9TP",
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function initFirebase(): { app: FirebaseApp; auth: Auth; db: Firestore } {
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
