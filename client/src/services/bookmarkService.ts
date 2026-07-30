import axios from 'axios';
import type { Bookmark, BookmarkCategory, BookmarkSource } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export interface CreateBookmarkPayload {
  question: string;
  answer: string;
  category?: BookmarkCategory;
  starRating?: number;
  customNotes?: string;
  source?: BookmarkSource;
}

export interface UpdateBookmarkPayload {
  customNotes?: string;
  starRating?: number;
  category?: BookmarkCategory;
}

export interface FetchBookmarksParams {
  category?: string;
  search?: string;
  minRating?: number;
}

export const createBookmarkAPI = async (
  token: string,
  payload: CreateBookmarkPayload
): Promise<Bookmark> => {
  const response = await axios.post<Bookmark>(
    `${API_URL}/bookmarks`,
    payload,
    getHeaders(token)
  );
  return response.data;
};

export const getBookmarksAPI = async (
  token: string,
  params?: FetchBookmarksParams
): Promise<Bookmark[]> => {
  const response = await axios.get<Bookmark[]>(`${API_URL}/bookmarks`, {
    ...getHeaders(token),
    params,
  });
  return response.data;
};

export const updateBookmarkAPI = async (
  token: string,
  id: string,
  payload: UpdateBookmarkPayload
): Promise<Bookmark> => {
  const response = await axios.patch<Bookmark>(
    `${API_URL}/bookmarks/${id}`,
    payload,
    getHeaders(token)
  );
  return response.data;
};

export const deleteBookmarkAPI = async (
  token: string,
  id: string
): Promise<void> => {
  await axios.delete(`${API_URL}/bookmarks/${id}`, getHeaders(token));
};
