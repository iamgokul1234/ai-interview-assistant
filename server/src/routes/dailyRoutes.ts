import { Router } from 'express';
import {
  getTodayChallengeHandler,
  submitDailyAttemptHandler,
  getUserStreakHandler,
} from '../controllers/dailyController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.get('/today', getTodayChallengeHandler);
router.post('/submit', submitDailyAttemptHandler);
router.get('/streak', getUserStreakHandler);

export default router;
