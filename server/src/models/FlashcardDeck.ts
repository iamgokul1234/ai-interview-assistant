import mongoose, { Document, Schema } from 'mongoose';
import type { InterviewDifficulty } from './Interview';

export interface IFlashcard {
  cardId: string;
  front: string; // Question / Concept
  back: string; // Answer / Explanation
  difficulty: InterviewDifficulty;
  category: string;
  mastered: boolean;
}

export interface IFlashcardDeck extends Document {
  userId: mongoose.Types.ObjectId;
  topic: string;
  title: string;
  cards: IFlashcard[];
  masteredCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const FlashcardSchema = new Schema(
  {
    cardId: { type: String, required: true },
    front: { type: String, required: true },
    back: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    category: { type: String, required: true },
    mastered: { type: Boolean, default: false },
  },
  { _id: false }
);

const FlashcardDeckSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    cards: {
      type: [FlashcardSchema],
      default: [],
    },
    masteredCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IFlashcardDeck>(
  'FlashcardDeck',
  FlashcardDeckSchema
);
