import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import {
  generateChallenge,
  submitSolution,
  getChallenges,
  getChallengeById,
} from '../services/codingService';
import type { CodingLanguage } from '../models/CodingChallenge';
import type { InterviewDifficulty } from '../models/Interview';

export const generateChallengeHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { topic, difficulty, language } = req.body;

    if (!topic || !difficulty) {
      res.status(400).json({ message: 'Topic and difficulty are required' });
      return;
    }

    const challenge = await generateChallenge(
      req.userId as string,
      topic as string,
      difficulty as InterviewDifficulty,
      (language as CodingLanguage) || 'javascript'
    );

    res.status(201).json(challenge);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to generate coding challenge';
    res.status(400).json({ message });
  }
};

export const submitSolutionHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { userCode } = req.body;

    if (!userCode || typeof userCode !== 'string') {
      res.status(400).json({ message: 'User code submission is required' });
      return;
    }

    const challenge = await submitSolution(
      id as string,
      req.userId as string,
      userCode
    );

    res.status(200).json(challenge);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to evaluate code submission';
    res.status(400).json({ message });
  }
};

export const getChallengesHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const challenges = await getChallenges(req.userId as string);
    res.status(200).json(challenges);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to fetch coding challenges';
    res.status(400).json({ message });
  }
};

export const getChallengeByIdHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const challenge = await getChallengeById(id as string, req.userId as string);
    res.status(200).json(challenge);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to fetch coding challenge';
    res.status(400).json({ message });
  }
};
