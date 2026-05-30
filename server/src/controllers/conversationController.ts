import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import {
  createConversation,
  getConversations,
  getMessages,
  saveMessage,
  deleteConversation,
} from '../services/conversationService';

export const create = async (
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

export const getAll = async (
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

export const fetchMessages = async (
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
    const { role, content } = req.body;

    if (!role || !content) {
      res.status(400).json({ message: 'Role and content are required' });
      return;
    }

    if (role !== 'user' && role !== 'assistant') {
      res.status(400).json({ message: 'Role must be user or assistant' });
      return;
    }

    const message = await saveMessage(
      id,
      req.userId as string,
      role as 'user' | 'assistant',
      content
    );
    res.status(201).json(message);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const remove = async (
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