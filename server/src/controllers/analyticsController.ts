import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { getAnalyticsData } from '../services/analyticsService';

export const getAnalyticsHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const data = await getAnalyticsData(req.userId as string);
    res.status(200).json(data);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch analytics data';
    res.status(500).json({ message });
  }
};
