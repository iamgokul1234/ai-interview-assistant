import axios from 'axios';
import type { DashboardStats } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getDashboardStatsAPI = async (token: string): Promise<DashboardStats> => {
  const response = await axios.get<DashboardStats>(`${API_URL}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
