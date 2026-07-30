import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CodingState, CodingChallenge } from '../../types';

const initialState: CodingState = {
  challenges: [],
  currentChallenge: null,
  loading: false,
  error: null,
};

const codingSlice = createSlice({
  name: 'coding',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setChallenges(state, action: PayloadAction<CodingChallenge[]>) {
      state.challenges = action.payload;
    },
    setCurrentChallenge(state, action: PayloadAction<CodingChallenge | null>) {
      state.currentChallenge = action.payload;
    },
    addChallenge(state, action: PayloadAction<CodingChallenge>) {
      state.challenges.unshift(action.payload);
      state.currentChallenge = action.payload;
    },
    updateChallenge(state, action: PayloadAction<CodingChallenge>) {
      const idx = state.challenges.findIndex((c) => c._id === action.payload._id);
      if (idx !== -1) {
        state.challenges[idx] = action.payload;
      }
      if (state.currentChallenge?._id === action.payload._id) {
        state.currentChallenge = action.payload;
      }
    },
    resetCoding(state) {
      state.currentChallenge = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  setLoading,
  setError,
  setChallenges,
  setCurrentChallenge,
  addChallenge,
  updateChallenge,
  resetCoding,
} = codingSlice.actions;

export default codingSlice.reducer;
