import mongoose, { Document, Schema } from 'mongoose';
import type { InterviewDifficulty } from './Interview';

export type CodingLanguage = 'javascript' | 'typescript' | 'python';

export interface CodeExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface CodeEvaluation {
  passed: boolean;
  score: number;
  timeComplexity: string;
  spaceComplexity: string;
  detailedFeedback: string;
  optimalSolution: string;
}

export interface ICodingChallenge extends Document {
  userId: mongoose.Types.ObjectId;
  topic: string;
  difficulty: InterviewDifficulty;
  language: CodingLanguage;
  title: string;
  description: string;
  examples: CodeExample[];
  constraints: string[];
  starterCode: string;
  userCode?: string;
  status: 'unsolved' | 'submitted';
  evaluation?: CodeEvaluation;
  createdAt: Date;
  updatedAt: Date;
}

const CodeExampleSchema = new Schema(
  {
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: { type: String },
  },
  { _id: false }
);

const CodeEvaluationSchema = new Schema(
  {
    passed: { type: Boolean, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    timeComplexity: { type: String, required: true },
    spaceComplexity: { type: String, required: true },
    detailedFeedback: { type: String, required: true },
    optimalSolution: { type: String, required: true },
  },
  { _id: false }
);

const CodingChallengeSchema: Schema = new Schema(
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
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
    },
    language: {
      type: String,
      enum: ['javascript', 'typescript', 'python'],
      default: 'javascript',
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    examples: {
      type: [CodeExampleSchema],
      default: [],
    },
    constraints: {
      type: [String],
      default: [],
    },
    starterCode: {
      type: String,
      required: true,
    },
    userCode: {
      type: String,
    },
    status: {
      type: String,
      enum: ['unsolved', 'submitted'],
      default: 'unsolved',
    },
    evaluation: {
      type: CodeEvaluationSchema,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICodingChallenge>(
  'CodingChallenge',
  CodingChallengeSchema
);
