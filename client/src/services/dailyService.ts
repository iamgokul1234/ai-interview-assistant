import axios from 'axios';
import type {
  DailyChallenge,
  DailyStreak,
  DailySubmissionResult,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getTodayChallengeAPI = async (
  token: string
): Promise<{ challenge: DailyChallenge; streak: DailyStreak }> => {
  const response = await axios.get<{
    challenge: DailyChallenge;
    streak: DailyStreak;
  }>(`${API_URL}/daily/today`, getHeaders(token));
  return response.data;
};

export const submitDailyAttemptAPI = async (
  token: string,
  answer: string | number
): Promise<DailySubmissionResult> => {
  const response = await axios.post<DailySubmissionResult>(
    `${API_URL}/daily/submit`,
    { answer },
    getHeaders(token)
  );
  return response.data;
};

export const getUserStreakAPI = async (
  token: string
): Promise<DailyStreak> => {
  const response = await axios.get<DailyStreak>(
    `${API_URL}/daily/streak`,
    getHeaders(token)
  );
  return response.data;
};
