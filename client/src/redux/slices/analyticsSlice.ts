import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AnalyticsState, AnalyticsData } from '../../types';

const initialState: AnalyticsState = {
  data: null,
  loading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setData(state, action: PayloadAction<AnalyticsData>) {
      state.data = action.payload;
    },
    resetAnalytics(state) {
      state.data = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const { setLoading, setError, setData, resetAnalytics } =
  analyticsSlice.actions;

export default analyticsSlice.reducer;
