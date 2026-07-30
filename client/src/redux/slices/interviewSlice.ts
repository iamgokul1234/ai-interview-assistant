import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  InterviewState,
  Interview,
  InterviewQuestion,
} from '../../types';

const initialState: InterviewState = {
  interviews: [],
  currentInterview: null,
  currentQuestion: null,
  questions: [],
  loading: false,
  error: null,
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setInterviews(state, action: PayloadAction<Interview[]>) {
      state.interviews = action.payload;
    },
    setCurrentInterview(state, action: PayloadAction<Interview | null>) {
      state.currentInterview = action.payload;
    },
    setCurrentQuestion(state, action: PayloadAction<InterviewQuestion | null>) {
      state.currentQuestion = action.payload;
    },
    setQuestions(state, action: PayloadAction<InterviewQuestion[]>) {
      state.questions = action.payload;
    },
    addQuestion(state, action: PayloadAction<InterviewQuestion>) {
      state.questions.push(action.payload);
    },
    updateCurrentInterview(state, action: PayloadAction<Partial<Interview>>) {
      if (state.currentInterview) {
        state.currentInterview = {
          ...state.currentInterview,
          ...action.payload,
        };
      }
    },
    resetInterview(state) {
      state.currentInterview = null;
      state.currentQuestion = null;
      state.questions = [];
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setInterviews,
  setCurrentInterview,
  setCurrentQuestion,
  setQuestions,
  addQuestion,
  updateCurrentInterview,
  resetInterview,
} = interviewSlice.actions;

export default interviewSlice.reducer;