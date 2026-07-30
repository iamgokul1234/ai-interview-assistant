import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { DashboardState, DashboardStats } from '../../types';

const initialState: DashboardState = {
  stats: null,
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setStats(state, action: PayloadAction<DashboardStats>) {
      state.stats = action.payload;
    },
    resetDashboard(state) {
      state.stats = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const { setLoading, setError, setStats, resetDashboard } =
  dashboardSlice.actions;

export default dashboardSlice.reducer;
