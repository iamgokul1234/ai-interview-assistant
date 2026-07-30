import axios from 'axios';
import type { CodingChallenge, CodingLanguage, InterviewDifficulty } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export interface GenerateChallengePayload {
  topic: string;
  difficulty: InterviewDifficulty;
  language?: CodingLanguage;
}

export const generateChallengeAPI = async (
  token: string,
  payload: GenerateChallengePayload
): Promise<CodingChallenge> => {
  const response = await axios.post<CodingChallenge>(
    `${API_URL}/coding/generate`,
    payload,
    getHeaders(token)
  );
  return response.data;
};

export const submitSolutionAPI = async (
  token: string,
  challengeId: string,
  userCode: string
): Promise<CodingChallenge> => {
  const response = await axios.post<CodingChallenge>(
    `${API_URL}/coding/${challengeId}/submit`,
    { userCode },
    getHeaders(token)
  );
  return response.data;
};

export const getChallengesAPI = async (
  token: string
): Promise<CodingChallenge[]> => {
  const response = await axios.get<CodingChallenge[]>(
    `${API_URL}/coding`,
    getHeaders(token)
  );
  return response.data;
};

export const getChallengeByIdAPI = async (
  token: string,
  id: string
): Promise<CodingChallenge> => {
  const response = await axios.get<CodingChallenge>(
    `${API_URL}/coding/${id}`,
    getHeaders(token)
  );
  return response.data;
};
