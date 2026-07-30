import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import {
  generateDeck,
  toggleCardMastery,
  getDecks,
  getDeckById,
} from '../services/flashcardService';

export const generateDeckHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { topic } = req.body;

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      res.status(400).json({ message: 'Flashcard topic is required' });
      return;
    }

    const deck = await generateDeck(req.userId as string, topic.trim());
    res.status(201).json(deck);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to generate flashcard deck';
    res.status(400).json({ message });
  }
};

export const toggleCardMasteryHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { cardId, mastered } = req.body;

    if (!cardId || typeof mastered !== 'boolean') {
      res.status(400).json({ message: 'cardId and mastered status are required' });
      return;
    }

    const deck = await toggleCardMastery(
      id as string,
      req.userId as string,
      cardId,
      mastered
    );

    res.status(200).json(deck);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to update card mastery status';
    res.status(400).json({ message });
  }
};

export const getDecksHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const decks = await getDecks(req.userId as string);
    res.status(200).json(decks);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to fetch flashcard decks';
    res.status(400).json({ message });
  }
};

export const getDeckByIdHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const deck = await getDeckById(id as string, req.userId as string);
    res.status(200).json(deck);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to fetch flashcard deck';
    res.status(400).json({ message });
  }
};
