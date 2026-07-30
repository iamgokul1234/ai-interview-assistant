import mongoose, { Document, Schema } from 'mongoose';

export interface IInterviewQuestion extends Document {
  interviewId: mongoose.Types.ObjectId;
  questionNumber: number;
  question: string;
  answer?: string;
  evaluation?: string;
  score?: number;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewQuestionSchema: Schema = new Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
    },
    questionNumber: {
      type: Number,
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      trim: true,
    },
    evaluation: {
      type: String,
      trim: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 10,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IInterviewQuestion>(
  'InterviewQuestion',
  InterviewQuestionSchema
);