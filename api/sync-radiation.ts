import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runRadiationSync } from './_lib/syncRadiation';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST requests are supported',
    });
  }

  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing authorization header',
    });
  }

  try {
    console.log('[Sync-Radiation] Starting radiation data sync...');
    const result = await runRadiationSync();

    return res.status(200).json({
      message: 'Radiation sync completed',
      ...result,
    });
  } catch (error) {
    console.error('[Sync-Radiation] Sync failed:', error);

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
}
