import { Router } from 'express';
import {
  reviewResumeHandler,
  getResumeReviewsHandler,
  getResumeReviewByIdHandler,
} from '../controllers/resumeController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.post('/review', reviewResumeHandler);
router.get('/', getResumeReviewsHandler);
router.get('/:id', getResumeReviewByIdHandler);

export default router;
