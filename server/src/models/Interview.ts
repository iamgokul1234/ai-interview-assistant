import mongoose, { Document, Schema } from 'mongoose';

export type InterviewTopic =
  | 'React'
  | 'JavaScript'
  | 'TypeScript'
  | 'Node.js'
  | 'Express'
  | 'MongoDB'
  | 'MERN'
  | 'DSA'
  | 'System Design'
  | 'SQL'
  | 'HR Interview';

export type InterviewDifficulty = 'Easy' | 'Medium' | 'Hard';
export type InterviewDuration = 15 | 30 | 60;
export type InterviewStatus = 'in-progress' | 'completed';

export interface IInterview extends Document {
  userId: mongoose.Types.ObjectId;
  topic: InterviewTopic;
  difficulty: InterviewDifficulty;
  duration: InterviewDuration;
  status: InterviewStatus;
  startedAt: Date;
  completedAt?: Date;
  score?: number;
  feedback?: string;
  strongAreas?: string[];
  weakAreas?: string[];
  suggestions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topic: {
      type: String,
      enum: [
        'React',
        'JavaScript',
        'TypeScript',
        'Node.js',
        'Express',
        'MongoDB',
        'MERN',
        'DSA',
        'System Design',
        'SQL',
        'HR Interview',
      ],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
    },
    duration: {
      type: Number,
      enum: [15, 30, 60],
      required: true,
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed'],
      default: 'in-progress',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    feedback: {
      type: String,
    },
    strongAreas: {
      type: [String],
    },
    weakAreas: {
      type: [String],
    },
    suggestions: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IInterview>('Interview', InterviewSchema);