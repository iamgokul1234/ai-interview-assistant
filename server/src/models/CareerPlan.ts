import mongoose, { Document, Schema } from 'mongoose';

export type ExperienceLevel = 'fresher' | '1-2 years' | '3-5 years' | '5+ years';
export type TargetRole =
  | 'Frontend'
  | 'Backend'
  | 'Fullstack'
  | 'DevOps'
  | 'Data Engineer'
  | 'ML Engineer';

export interface MonthlyMilestone {
  month: number;
  title: string;
  focus: string;
  keyDeliverables: string[];
}

export interface WeeklyPlanItem {
  week: number;
  topic: string;
  tasks: string[];
}

export interface ICareerPlan extends Document {
  userId: mongoose.Types.ObjectId;
  experience: ExperienceLevel;
  currentSkills: string[];
  targetRole: TargetRole;
  targetCompany?: string;
  targetSalary?: string;
  roadmap6Month: MonthlyMilestone[];
  weeklyLearningPlan: WeeklyPlanItem[];
  recommendedProjects: string[];
  recommendedCertifications: string[];
  skillGapAnalysis: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MonthlyMilestoneSchema = new Schema(
  {
    month: { type: Number, required: true },
    title: { type: String, required: true },
    focus: { type: String, required: true },
    keyDeliverables: { type: [String], default: [] },
  },
  { _id: false }
);

const WeeklyPlanItemSchema = new Schema(
  {
    week: { type: Number, required: true },
    topic: { type: String, required: true },
    tasks: { type: [String], default: [] },
  },
  { _id: false }
);

const CareerPlanSchema: Schema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    experience: {
      type: String,
      enum: ['fresher', '1-2 years', '3-5 years', '5+ years'],
      required: true,
    },
    currentSkills: {
      type: [String],
      required: true,
    },
    targetRole: {
      type: String,
      enum: [
        'Frontend',
        'Backend',
        'Fullstack',
        'DevOps',
        'Data Engineer',
        'ML Engineer',
      ],
      required: true,
    },
    targetCompany: {
      type: String,
    },
    targetSalary: {
      type: String,
    },
    roadmap6Month: {
      type: [MonthlyMilestoneSchema],
      default: [],
    },
    weeklyLearningPlan: {
      type: [WeeklyPlanItemSchema],
      default: [],
    },
    recommendedProjects: {
      type: [String],
      default: [],
    },
    recommendedCertifications: {
      type: [String],
      default: [],
    },
    skillGapAnalysis: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICareerPlan>('CareerPlan', CareerPlanSchema);
