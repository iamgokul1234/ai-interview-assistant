import { Router } from 'express';
import { getDashboardHandler } from '../controllers/dashboardController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', getDashboardHandler);

export default router;
