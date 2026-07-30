import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { FlashcardState, FlashcardDeck } from '../../types';

const initialState: FlashcardState = {
  decks: [],
  currentDeck: null,
  loading: false,
  error: null,
};

const flashcardSlice = createSlice({
  name: 'flashcard',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setDecks(state, action: PayloadAction<FlashcardDeck[]>) {
      state.decks = action.payload;
    },
    setCurrentDeck(state, action: PayloadAction<FlashcardDeck | null>) {
      state.currentDeck = action.payload;
    },
    addDeck(state, action: PayloadAction<FlashcardDeck>) {
      state.decks.unshift(action.payload);
      state.currentDeck = action.payload;
    },
    updateDeck(state, action: PayloadAction<FlashcardDeck>) {
      const idx = state.decks.findIndex((d) => d._id === action.payload._id);
      if (idx !== -1) {
        state.decks[idx] = action.payload;
      }
      if (state.currentDeck?._id === action.payload._id) {
        state.currentDeck = action.payload;
      }
    },
    resetFlashcards(state) {
      state.currentDeck = null;
      state.error = null;
      state.loading = false;
    },
  },
});

export const {
  setLoading,
  setError,
  setDecks,
  setCurrentDeck,
  addDeck,
  updateDeck,
  resetFlashcards,
} = flashcardSlice.actions;

export default flashcardSlice.reducer;
