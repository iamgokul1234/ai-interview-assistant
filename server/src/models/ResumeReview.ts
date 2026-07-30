import mongoose, { Document, Schema } from 'mongoose';

export interface IResumeReview extends Document {
  userId: mongoose.Types.ObjectId;
  resumeText: string;
  fileName?: string;
  atsScore: number;
  grammarFeedback: string;
  missingSkills: string[];
  improvedSummary: string;
  projectSuggestions: string[];
  overallFeedback: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeReviewSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resumeText: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
    },
    atsScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    grammarFeedback: {
      type: String,
      required: true,
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    improvedSummary: {
      type: String,
      required: true,
    },
    projectSuggestions: {
      type: [String],
      default: [],
    },
    overallFeedback: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IResumeReview>('ResumeReview', ResumeReviewSchema);
