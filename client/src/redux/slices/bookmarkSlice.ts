import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { BookmarkState, Bookmark } from '../../types';

const initialState: BookmarkState = {
  bookmarks: [],
  loading: false,
  error: null,
  activeCategory: 'All',
  searchQuery: '',
  minRating: 0,
};

const bookmarkSlice = createSlice({
  name: 'bookmark',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setBookmarks(state, action: PayloadAction<Bookmark[]>) {
      state.bookmarks = action.payload;
    },
    addBookmark(state, action: PayloadAction<Bookmark>) {
      state.bookmarks.unshift(action.payload);
    },
    updateBookmarkInState(state, action: PayloadAction<Bookmark>) {
      const idx = state.bookmarks.findIndex((b) => b._id === action.payload._id);
      if (idx !== -1) {
        state.bookmarks[idx] = action.payload;
      }
    },
    removeBookmark(state, action: PayloadAction<string>) {
      state.bookmarks = state.bookmarks.filter((b) => b._id !== action.payload);
    },
    setActiveCategory(state, action: PayloadAction<string>) {
      state.activeCategory = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setMinRating(state, action: PayloadAction<number>) {
      state.minRating = action.payload;
    },
    resetBookmarks(state) {
      state.bookmarks = [];
      state.activeCategory = 'All';
      state.searchQuery = '';
      state.minRating = 0;
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  setLoading,
  setError,
  setBookmarks,
  addBookmark,
  updateBookmarkInState,
  removeBookmark,
  setActiveCategory,
  setSearchQuery,
  setMinRating,
  resetBookmarks,
} = bookmarkSlice.actions;

export default bookmarkSlice.reducer;
