import axios from 'axios';
import type { UserProfile, UserSettings } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export interface UpdateProfilePayload extends UserSettings {
  name?: string;
}

export const getUserSettingsAPI = async (
  token: string
): Promise<UserProfile> => {
  const response = await axios.get<UserProfile>(
    `${API_URL}/settings`,
    getHeaders(token)
  );
  return response.data;
};

export const updateUserProfileAPI = async (
  token: string,
  payload: UpdateProfilePayload
): Promise<UserProfile> => {
  const response = await axios.put<UserProfile>(
    `${API_URL}/settings/profile`,
    payload,
    getHeaders(token)
  );
  return response.data;
};

export const changePasswordAPI = async (
  token: string,
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> => {
  const response = await axios.put<{ message: string }>(
    `${API_URL}/settings/password`,
    { currentPassword, newPassword },
    getHeaders(token)
  );
  return response.data;
};

export const exportUserDataAPI = async (token: string): Promise<void> => {
  const response = await axios.get(`${API_URL}/settings/export`, {
    ...getHeaders(token),
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute(
    'download',
    `ai-interview-assistant-data-${new Date().toISOString().split('T')[0]}.json`
  );
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const deleteUserAccountAPI = async (
  token: string,
  passwordConfirm: string
): Promise<{ message: string }> => {
  const response = await axios.delete<{ message: string }>(
    `${API_URL}/settings/account`,
    {
      ...getHeaders(token),
      data: { passwordConfirm },
    }
  );
  return response.data;
};
