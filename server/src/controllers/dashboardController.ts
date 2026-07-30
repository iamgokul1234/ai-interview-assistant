import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { getDashboardStats } from '../services/dashboardService';

export const getDashboardHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const stats = await getDashboardStats(req.userId as string);
    res.status(200).json(stats);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch dashboard stats';
    res.status(500).json({ message });
  }
};
