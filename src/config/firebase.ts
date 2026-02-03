import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Validate environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
] as const;

const missingVars = requiredEnvVars.filter(
  varName => !import.meta.env[varName]
);

// Check if all required environment variables are present
const hasAllEnvVars = missingVars.length === 0;

if (!hasAllEnvVars) {
  console.error(
    '❌ Missing Firebase environment variables:',
    missingVars.join(', '),
    '\n\nPlease set these variables in Vercel Dashboard:',
    '\nSettings → Environment Variables'
  );
}

// Use dummy values if environment variables are missing (for build compatibility)
// This allows the app to build and show error messages to users
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef'
};

// Initialize Firebase
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);

  if (hasAllEnvVars) {
    console.log('✅ Firebase initialized successfully');
  } else {
    console.warn('⚠️ Firebase initialized with dummy values - features will not work until environment variables are set');
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  throw error;
}

// Export flag to check if Firebase is properly configured
export const isFirebaseConfigured = hasAllEnvVars;
export { db, auth };
export default app;

