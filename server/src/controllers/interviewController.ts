import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterviews,
  getInterview,
} from '../services/interviewService';
import type {
  InterviewTopic,
  InterviewDifficulty,
  InterviewDuration,
} from '../models/Interview';

export const startInterviewHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { topic, difficulty, duration } = req.body;

    if (!topic || !difficulty || !duration) {
      res.status(400).json({ message: 'Topic, difficulty and duration are required' });
      return;
    }

    const result = await startInterview(
      req.userId as string,
      topic as InterviewTopic,
      difficulty as InterviewDifficulty,
      duration as InterviewDuration
    );

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const submitAnswerHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { answer } = req.body;

    if (!answer) {
      res.status(400).json({ message: 'Answer is required' });
      return;
    }

    const result = await submitAnswer(id, req.userId as string, answer);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const completeInterviewHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const result = await completeInterview(id, req.userId as string);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getInterviewsHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const interviews = await getInterviews(req.userId as string);
    res.status(200).json(interviews);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getInterviewHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const result = await getInterview(id, req.userId as string);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};