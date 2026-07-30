import axios from 'axios';
import type { CareerPlan, ExperienceLevel, TargetRole } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export interface GenerateCareerPlanPayload {
  experience: ExperienceLevel;
  currentSkills: string[];
  targetRole: TargetRole;
  targetCompany?: string;
  targetSalary?: string;
}

export const generateCareerPlanAPI = async (
  token: string,
  payload: GenerateCareerPlanPayload
): Promise<CareerPlan> => {
  const response = await axios.post<CareerPlan>(
    `${API_URL}/career/generate`,
    payload,
    getHeaders(token)
  );
  return response.data;
};

export const getCareerPlansAPI = async (
  token: string
): Promise<CareerPlan[]> => {
  const response = await axios.get<CareerPlan[]>(
    `${API_URL}/career`,
    getHeaders(token)
  );
  return response.data;
};

export const getCareerPlanByIdAPI = async (
  token: string,
  id: string
): Promise<CareerPlan> => {
  const response = await axios.get<CareerPlan>(
    `${API_URL}/career/${id}`,
    getHeaders(token)
  );
  return response.data;
};
