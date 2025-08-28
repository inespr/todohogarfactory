import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, initializeFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Robustez de red: forzar long-polling y desactivar fetch streams.
// Esto evita errores de WebChannel en redes filtradas/VPN/AdBlock.
let dbInstance: Firestore;
try {
  dbInstance = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    // Algunas redes requieren forzar el long-polling explícitamente
    experimentalForceLongPolling: true as unknown as boolean,
    useFetchStreams: false as unknown as boolean,
    ignoreUndefinedProperties: true,
  } as any);
} catch {
  dbInstance = getFirestore(app);
}

export const db = dbInstance;


