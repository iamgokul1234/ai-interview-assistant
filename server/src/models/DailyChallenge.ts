import mongoose, { Document, Schema } from 'mongoose';

export type DailyQuestionType = 'mcq' | 'short-answer' | 'code-snippet';

export interface IDailyChallenge extends Document {
  date: string; // 'YYYY-MM-DD'
  type: DailyQuestionType;
  question: string;
  options?: string[]; // For MCQ
  correctOptionIndex?: number; // For MCQ
  starterCode?: string; // For code-snippet
  sampleSolution?: string;
  explanation: string;
  createdAt: Date;
  updatedAt: Date;
}

const DailyChallengeSchema: Schema = new Schema(
  {
    date: {
      type: String,
      required: true,
      unique: true, // One challenge per date globally
      index: true,
    },
    type: {
      type: String,
      enum: ['mcq', 'short-answer', 'code-snippet'],
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
    },
    correctOptionIndex: {
      type: Number,
    },
    starterCode: {
      type: String,
    },
    sampleSolution: {
      type: String,
    },
    explanation: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IDailyChallenge>(
  'DailyChallenge',
  DailyChallengeSchema
);
