import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const createConversationAPI = async (token: string, title: string) => {
  const response = await axios.post(
    `${API_URL}/conversations`,
    { title },
    getHeaders(token)
  );
  return response.data;
};

export const getConversationsAPI = async (token: string) => {
  const response = await axios.get(
    `${API_URL}/conversations`,
    getHeaders(token)
  );
  return response.data;
};

export const getMessagesAPI = async (token: string, conversationId: string) => {
  const response = await axios.get(
    `${API_URL}/conversations/${conversationId}/messages`,
    getHeaders(token)
  );
  return response.data;
};

export const sendMessageAPI = async (
  token: string,
  conversationId: string,
  content: string
) => {
  const response = await axios.post(
    `${API_URL}/conversations/${conversationId}/messages`,
    { content },
    getHeaders(token)
  );
  return response.data;
};

export const deleteConversationAPI = async (
  token: string,
  conversationId: string
) => {
  const response = await axios.delete(
    `${API_URL}/conversations/${conversationId}`,
    getHeaders(token)
  );
  return response.data;
};