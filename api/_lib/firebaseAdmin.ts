// Shared Firebase Admin SDK initialization.
// Vercel bundles each function independently; this module-level block runs once
// per warm instance. The apps.length guard prevents duplicate initialisation.
/* eslint-disable @typescript-eslint/no-explicit-any */
let admin: any;

try {
  admin = require('firebase-admin');

  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
    );
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }
} catch (error) {
  console.error('Firebase Admin initialization failed:', error);
}

export const db: any = admin?.firestore();
export { admin };

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsSaved: number;
  recordsFailed: number;
  errors?: string[];
  duration: number;
  data?: unknown;
}
