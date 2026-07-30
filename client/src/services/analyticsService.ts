import axios from 'axios';
import type { AnalyticsData } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getAnalyticsDataAPI = async (token: string): Promise<AnalyticsData> => {
  const response = await axios.get<AnalyticsData>(`${API_URL}/analytics`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
