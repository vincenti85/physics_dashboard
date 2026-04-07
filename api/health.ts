import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow GET requests for health checks
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET requests are supported'
    });
  }

  try {
    // Check Firebase connection
    let firebaseStatus = 'disconnected';
    let admin: any;
    
    try {
      admin = require('firebase-admin');
      
      if (!admin.apps.length) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
        
        if (serviceAccount.project_id) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: process.env.FIREBASE_PROJECT_ID
          });
        }
      }
      
      if (admin.apps.length > 0) {
        firebaseStatus = 'connected';
      }
    } catch (error) {
      firebaseStatus = 'error';
    }

    // Check environment variables
    const requiredEnvVars = {
      FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
      FIREBASE_SERVICE_ACCOUNT_KEY: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
      OPENWEATHER_API_KEY: !!process.env.OPENWEATHER_API_KEY,
      CRON_SECRET: !!process.env.CRON_SECRET
    };

    const allEnvVarsPresent = Object.values(requiredEnvVars).every(v => v);

    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        firebase: firebaseStatus
      },
      environment: {
        allVariablesConfigured: allEnvVarsPresent,
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV
      },
      version: '1.0.0'
    });

  } catch (error) {
    return res.status(500).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
