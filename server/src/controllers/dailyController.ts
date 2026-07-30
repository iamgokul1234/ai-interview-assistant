import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import {
  getOrGenerateTodayChallenge,
  submitDailyAttempt,
  getUserStreak,
} from '../services/dailyService';

export const getTodayChallengeHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const challenge = await getOrGenerateTodayChallenge();
    const streak = await getUserStreak(req.userId as string);

    // Sanitize challenge object for initial fetch so correct answer isn't exposed in network payload before solving
    const sanitized = {
      _id: challenge._id,
      date: challenge.date,
      type: challenge.type,
      question: challenge.question,
      options: challenge.options,
      starterCode: challenge.starterCode,
      isSolvedToday: streak.isSolvedToday,
    };

    res.status(200).json({ challenge: sanitized, streak });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to fetch today\'s challenge';
    res.status(400).json({ message });
  }
};

export const submitDailyAttemptHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { answer } = req.body;

    if (answer === undefined || answer === null || answer === '') {
      res.status(400).json({ message: 'Answer is required' });
      return;
    }

    const result = await submitDailyAttempt(req.userId as string, answer);
    res.status(200).json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to submit daily challenge attempt';
    res.status(400).json({ message });
  }
};

export const getUserStreakHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const streak = await getUserStreak(req.userId as string);
    res.status(200).json(streak);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch user streak';
    res.status(400).json({ message });
  }
};
