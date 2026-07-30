import { Router } from 'express';
import {
  generateCareerPlanHandler,
  getCareerPlansHandler,
  getCareerPlanByIdHandler,
} from '../controllers/careerController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.post('/generate', generateCareerPlanHandler);
router.get('/', getCareerPlansHandler);
router.get('/:id', getCareerPlanByIdHandler);

export default router;
