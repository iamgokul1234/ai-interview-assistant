import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ResumeState, ResumeReview } from '../../types';

const initialState: ResumeState = {
  reviews: [],
  currentReview: null,
  loading: false,
  error: null,
};

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setReviews(state, action: PayloadAction<ResumeReview[]>) {
      state.reviews = action.payload;
    },
    setCurrentReview(state, action: PayloadAction<ResumeReview | null>) {
      state.currentReview = action.payload;
    },
    addReview(state, action: PayloadAction<ResumeReview>) {
      state.reviews.unshift(action.payload);
      state.currentReview = action.payload;
    },
    resetResume(state) {
      state.currentReview = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  setLoading,
  setError,
  setReviews,
  setCurrentReview,
  addReview,
  resetResume,
} = resumeSlice.actions;

export default resumeSlice.reducer;
