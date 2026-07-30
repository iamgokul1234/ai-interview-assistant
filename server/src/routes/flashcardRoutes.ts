import { Router } from 'express';
import {
  generateDeckHandler,
  toggleCardMasteryHandler,
  getDecksHandler,
  getDeckByIdHandler,
} from '../controllers/flashcardController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.post('/generate', generateDeckHandler);
router.patch('/:id/card', toggleCardMasteryHandler);
router.get('/', getDecksHandler);
router.get('/:id', getDeckByIdHandler);

export default router;
