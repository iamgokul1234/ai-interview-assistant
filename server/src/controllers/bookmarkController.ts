import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import {
  createBookmark,
  getBookmarks,
  updateBookmark,
  deleteBookmark,
} from '../services/bookmarkService';

export const createBookmarkHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { question, answer, category, starRating, customNotes, source } =
      req.body;

    if (!question || !answer) {
      res.status(400).json({ message: 'Question and answer are required' });
      return;
    }

    const bookmark = await createBookmark(req.userId as string, {
      question,
      answer,
      category,
      starRating,
      customNotes,
      source,
    });

    res.status(201).json(bookmark);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to create bookmark';
    res.status(400).json({ message });
  }
};

export const getBookmarksHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { category, search, minRating } = req.query;

    const bookmarks = await getBookmarks(
      req.userId as string,
      category as string | undefined,
      search as string | undefined,
      minRating ? Number(minRating) : undefined
    );

    res.status(200).json(bookmarks);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch bookmarks';
    res.status(400).json({ message });
  }
};

export const updateBookmarkHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { customNotes, starRating, category } = req.body;

    const bookmark = await updateBookmark(id as string, req.userId as string, {
      customNotes,
      starRating,
      category,
    });

    res.status(200).json(bookmark);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to update bookmark';
    res.status(400).json({ message });
  }
};

export const deleteBookmarkHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    await deleteBookmark(id as string, req.userId as string);
    res.status(200).json({ message: 'Bookmark deleted successfully' });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to delete bookmark';
    res.status(400).json({ message });
  }
};
