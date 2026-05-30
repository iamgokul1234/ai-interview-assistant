import { Router } from 'express';
import {
  createConversationHandler,
  getAllConversations,
  getMessagesHandler,
  addMessage,
  deleteConversationHandler,
} from '../controllers/conversationController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.post('/', createConversationHandler);
router.get('/', getAllConversations);
router.get('/:id/messages', getMessagesHandler);
router.post('/:id/messages', addMessage);
router.delete('/:id', deleteConversationHandler);

export default router;