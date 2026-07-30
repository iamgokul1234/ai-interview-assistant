import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import interviewReducer from './slices/interviewSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    interview: interviewReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;