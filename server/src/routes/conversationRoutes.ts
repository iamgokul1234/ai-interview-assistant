import { Router } from 'express';
import {
  createConversationHandler,
  getAllConversations,
  getMessagesHandler,
  addMessage,
  deleteConversationHandler,
  deleteMessagesFromHandler,
} from '../controllers/conversationController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.post('/', createConversationHandler);
router.get('/', getAllConversations);
router.get('/:id/messages', getMessagesHandler);
router.post('/:id/messages', addMessage);
router.delete('/:id', deleteConversationHandler);
router.post('/:id/messages/delete-from', deleteMessagesFromHandler);

export default router;