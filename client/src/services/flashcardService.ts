import axios from 'axios';
import type { FlashcardDeck } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const generateDeckAPI = async (
  token: string,
  topic: string
): Promise<FlashcardDeck> => {
  const response = await axios.post<FlashcardDeck>(
    `${API_URL}/flashcards/generate`,
    { topic },
    getHeaders(token)
  );
  return response.data;
};

export const toggleCardMasteryAPI = async (
  token: string,
  deckId: string,
  cardId: string,
  mastered: boolean
): Promise<FlashcardDeck> => {
  const response = await axios.patch<FlashcardDeck>(
    `${API_URL}/flashcards/${deckId}/card`,
    { cardId, mastered },
    getHeaders(token)
  );
  return response.data;
};

export const getDecksAPI = async (
  token: string
): Promise<FlashcardDeck[]> => {
  const response = await axios.get<FlashcardDeck[]>(
    `${API_URL}/flashcards`,
    getHeaders(token)
  );
  return response.data;
};

export const getDeckByIdAPI = async (
  token: string,
  id: string
): Promise<FlashcardDeck> => {
  const response = await axios.get<FlashcardDeck>(
    `${API_URL}/flashcards/${id}`,
    getHeaders(token)
  );
  return response.data;
};
