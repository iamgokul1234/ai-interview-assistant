import { Router } from 'express';
import { getAnalyticsHandler } from '../controllers/analyticsController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', getAnalyticsHandler);

export default router;
