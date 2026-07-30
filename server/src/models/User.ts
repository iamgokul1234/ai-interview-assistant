import mongoose, { Document, Schema } from 'mongoose';

export interface IUserSettings {
  targetRole?: string;
  experienceLevel?: string;
  targetCompanies?: string[];
  preferredModel?: string;
  voiceEnabled?: boolean;
  selectedVoice?: string;
  speechRate?: number;
  themePreference?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  settings?: IUserSettings;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    settings: {
      targetRole: { type: String, default: 'Full Stack Developer' },
      experienceLevel: { type: String, default: 'Mid-Level' },
      targetCompanies: { type: [String], default: [] },
      preferredModel: { type: String, default: 'qwen/qwen3.6-27b' },
      voiceEnabled: { type: Boolean, default: false },
      selectedVoice: { type: String, default: 'native' },
      speechRate: { type: Number, default: 1.0 },
      themePreference: { type: String, default: 'liquid-glass' },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', UserSchema);