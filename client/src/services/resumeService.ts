import axios from 'axios';
import type { ResumeReview } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const reviewResumeAPI = async (
  token: string,
  resumeText: string,
  fileName?: string
): Promise<ResumeReview> => {
  const response = await axios.post<ResumeReview>(
    `${API_URL}/resume/review`,
    { resumeText, fileName },
    getHeaders(token)
  );
  return response.data;
};

export const getResumeReviewsAPI = async (
  token: string
): Promise<ResumeReview[]> => {
  const response = await axios.get<ResumeReview[]>(
    `${API_URL}/resume`,
    getHeaders(token)
  );
  return response.data;
};

export const getResumeReviewByIdAPI = async (
  token: string,
  id: string
): Promise<ResumeReview> => {
  const response = await axios.get<ResumeReview>(
    `${API_URL}/resume/${id}`,
    getHeaders(token)
  );
  return response.data;
};
