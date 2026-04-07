import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runEarthquakeSync } from './_lib/syncEarthquake';

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
    console.log('[Sync-Earthquake] Starting earthquake data sync...');
    const result = await runEarthquakeSync();

    return res.status(200).json({
      message: 'Earthquake sync completed',
      ...result,
    });
  } catch (error) {
    console.error('[Sync-Earthquake] Sync failed:', error);

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
}
