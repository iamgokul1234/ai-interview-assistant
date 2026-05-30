import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
  deleteConversation,
} from '../services/conversationService';

export const createConversationHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title } = req.body;
    const conversation = await createConversation(
      req.userId as string,
      title || 'New Conversation'
    );
    res.status(201).json(conversation);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllConversations = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const conversations = await getConversations(req.userId as string);
    res.status(200).json(conversations);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getMessagesHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const messages = await getMessages(id, req.userId as string);
    res.status(200).json(messages);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const addMessage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { content } = req.body;

    if (!content) {
      res.status(400).json({ message: 'Content is required' });
      return;
    }

    const messages = await sendMessage(id, req.userId as string, content);
    res.status(201).json(messages);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteConversationHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;
    await deleteConversation(id, req.userId as string);
    res.status(200).json({ message: 'Conversation deleted' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};