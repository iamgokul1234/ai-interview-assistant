import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  DailyState,
  DailyChallenge,
  DailyStreak,
  DailySubmissionResult,
} from '../../types';

const initialState: DailyState = {
  challenge: null,
  streak: null,
  lastResult: null,
  loading: false,
  error: null,
};

const dailySlice = createSlice({
  name: 'daily',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setDailyData(
      state,
      action: PayloadAction<{ challenge: DailyChallenge; streak: DailyStreak }>
    ) {
      state.challenge = action.payload.challenge;
      state.streak = action.payload.streak;
    },
    setStreak(state, action: PayloadAction<DailyStreak>) {
      state.streak = action.payload;
    },
    setSubmissionResult(state, action: PayloadAction<DailySubmissionResult>) {
      state.lastResult = action.payload;
      state.streak = action.payload.streak;
      if (state.challenge) {
        state.challenge.isSolvedToday = action.payload.streak.isSolvedToday;
      }
    },
    resetDaily(state) {
      state.lastResult = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  setLoading,
  setError,
  setDailyData,
  setStreak,
  setSubmissionResult,
  resetDaily,
} = dailySlice.actions;

export default dailySlice.reducer;
