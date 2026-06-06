import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ChatState, Conversation, Message } from '../../types';

const initialState: ChatState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setConversations(state, action: PayloadAction<Conversation[]>) {
      state.conversations = action.payload;
    },
    addConversation(state, action: PayloadAction<Conversation>) {
      state.conversations.unshift(action.payload);
    },
    setCurrentConversation(state, action: PayloadAction<Conversation | null>) {
      state.currentConversation = action.payload;
    },
    setMessages(state, action: PayloadAction<Message[]>) {
      state.messages = action.payload;
    },
    addMessage(state, action: PayloadAction<Message>) {
      state.messages.push(action.payload);
    },
    deleteConversationFromStore(state, action: PayloadAction<string>) {
      state.conversations = state.conversations.filter(
        (c) => c._id !== action.payload
      );
      if (state.currentConversation?._id === action.payload) {
        state.currentConversation = null;
        state.messages = [];
      }
    },
    clearChat(state) {
      state.currentConversation = null;
      state.messages = [];
    },
  },
});

export const {
  setLoading,
  setError,
  setConversations,
  addConversation,
  setCurrentConversation,
  setMessages,
  addMessage,
  deleteConversationFromStore,
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;