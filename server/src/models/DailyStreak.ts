import mongoose, { Document, Schema } from 'mongoose';

export interface IDailyStreak extends Document {
  userId: mongoose.Types.ObjectId;
  currentStreak: number;
  longestStreak: number;
  lastAttemptDate?: string; // 'YYYY-MM-DD'
  totalSolved: number;
  solvedDates: string[]; // List of 'YYYY-MM-DD' dates solved
  createdAt: Date;
  updatedAt: Date;
}

const DailyStreakSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    lastAttemptDate: {
      type: String,
    },
    totalSolved: {
      type: Number,
      default: 0,
    },
    solvedDates: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IDailyStreak>('DailyStreak', DailyStreakSchema);
