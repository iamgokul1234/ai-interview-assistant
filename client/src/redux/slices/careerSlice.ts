import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CareerState, CareerPlan } from '../../types';

const initialState: CareerState = {
  plans: [],
  currentPlan: null,
  loading: false,
  error: null,
};

const careerSlice = createSlice({
  name: 'career',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setPlans(state, action: PayloadAction<CareerPlan[]>) {
      state.plans = action.payload;
    },
    setCurrentPlan(state, action: PayloadAction<CareerPlan | null>) {
      state.currentPlan = action.payload;
    },
    addPlan(state, action: PayloadAction<CareerPlan>) {
      state.plans.unshift(action.payload);
      state.currentPlan = action.payload;
    },
    resetCareer(state) {
      state.currentPlan = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  setLoading,
  setError,
  setPlans,
  setCurrentPlan,
  addPlan,
  resetCareer,
} = careerSlice.actions;

export default careerSlice.reducer;
