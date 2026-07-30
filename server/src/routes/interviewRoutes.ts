import { Router } from 'express';
import {
  startInterviewHandler,
  submitAnswerHandler,
  completeInterviewHandler,
  getInterviewsHandler,
  getInterviewHandler,
} from '../controllers/interviewController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.post('/start', startInterviewHandler);
router.post('/:id/answer', submitAnswerHandler);
router.post('/:id/complete', completeInterviewHandler);
router.get('/', getInterviewsHandler);
router.get('/:id', getInterviewHandler);

export default router;