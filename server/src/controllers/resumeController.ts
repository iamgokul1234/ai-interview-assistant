import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import {
  reviewResume,
  getResumeReviews,
  getResumeReviewById,
} from '../services/resumeService';

export const reviewResumeHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { resumeText, fileName } = req.body;

    if (!resumeText || typeof resumeText !== 'string' || !resumeText.trim()) {
      res.status(400).json({ message: 'Resume text is required' });
      return;
    }

    const review = await reviewResume(
      req.userId as string,
      resumeText,
      fileName
    );

    res.status(201).json(review);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to analyze resume';
    res.status(400).json({ message });
  }
};

export const getResumeReviewsHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const reviews = await getResumeReviews(req.userId as string);
    res.status(200).json(reviews);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch resume reviews';
    res.status(400).json({ message });
  }
};

export const getResumeReviewByIdHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const review = await getResumeReviewById(id as string, req.userId as string);
    res.status(200).json(review);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch resume review';
    res.status(400).json({ message });
  }
};
