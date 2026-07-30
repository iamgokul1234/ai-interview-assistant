import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import interviewReducer from './slices/interviewSlice';
import dashboardReducer from './slices/dashboardSlice';
import analyticsReducer from './slices/analyticsSlice';
import resumeReducer from './slices/resumeSlice';
import careerReducer from './slices/careerSlice';
import codingReducer from './slices/codingSlice';
import dailyReducer from './slices/dailySlice';
import flashcardReducer from './slices/flashcardSlice';
import bookmarkReducer from './slices/bookmarkSlice';
import settingsReducer from './slices/settingsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    interview: interviewReducer,
    dashboard: dashboardReducer,
    analytics: analyticsReducer,
    resume: resumeReducer,
    career: careerReducer,
    coding: codingReducer,
    daily: dailyReducer,
    flashcard: flashcardReducer,
    bookmark: bookmarkReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;