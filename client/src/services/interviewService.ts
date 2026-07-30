import axios from 'axios';
import type { InterviewTopic, InterviewDifficulty, InterviewDuration } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const startInterviewAPI = async (
  token: string,
  topic: InterviewTopic,
  difficulty: InterviewDifficulty,
  duration: InterviewDuration
) => {
  const response = await axios.post(
    `${API_URL}/interviews/start`,
    { topic, difficulty, duration },
    getHeaders(token)
  );
  return response.data;
};

export const submitAnswerAPI = async (
  token: string,
  interviewId: string,
  answer: string
) => {
  const response = await axios.post(
    `${API_URL}/interviews/${interviewId}/answer`,
    { answer },
    getHeaders(token)
  );
  return response.data;
};

export const completeInterviewAPI = async (
  token: string,
  interviewId: string
) => {
  const response = await axios.post(
    `${API_URL}/interviews/${interviewId}/complete`,
    {},
    getHeaders(token)
  );
  return response.data;
};

export const getInterviewsAPI = async (token: string) => {
  const response = await axios.get(
    `${API_URL}/interviews`,
    getHeaders(token)
  );
  return response.data;
};

export const getInterviewAPI = async (token: string, interviewId: string) => {
  const response = await axios.get(
    `${API_URL}/interviews/${interviewId}`,
    getHeaders(token)
  );
  return response.data;
};