import mongoose, { Document, Schema } from 'mongoose';

export type BookmarkCategory =
  | 'React'
  | 'Node.js'
  | 'System Design'
  | 'Behavioral'
  | 'SQL'
  | 'DSA'
  | 'General';

export type BookmarkSource =
  | 'chat'
  | 'interview'
  | 'coding'
  | 'daily'
  | 'flashcards'
  | 'custom';

export interface IBookmark extends Document {
  userId: mongoose.Types.ObjectId;
  question: string;
  answer: string;
  category: BookmarkCategory;
  starRating: number; // 1 to 5
  customNotes?: string;
  source: BookmarkSource;
  createdAt: Date;
  updatedAt: Date;
}

const BookmarkSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['React', 'Node.js', 'System Design', 'Behavioral', 'SQL', 'DSA', 'General'],
      default: 'General',
    },
    starRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    customNotes: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      enum: ['chat', 'interview', 'coding', 'daily', 'flashcards', 'custom'],
      default: 'chat',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBookmark>('Bookmark', BookmarkSchema);
