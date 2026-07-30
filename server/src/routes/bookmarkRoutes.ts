import { Router } from 'express';
import {
  createBookmarkHandler,
  getBookmarksHandler,
  updateBookmarkHandler,
  deleteBookmarkHandler,
} from '../controllers/bookmarkController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.post('/', createBookmarkHandler);
router.get('/', getBookmarksHandler);
router.patch('/:id', updateBookmarkHandler);
router.delete('/:id', deleteBookmarkHandler);

export default router;
