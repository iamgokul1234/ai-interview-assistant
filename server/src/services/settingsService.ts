import bcrypt from 'bcryptjs';
import User, { IUser, IUserSettings } from '../models/User';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import Interview from '../models/Interview';
import ResumeReview from '../models/ResumeReview';
import CareerPlan from '../models/CareerPlan';
import CodingChallenge from '../models/CodingChallenge';
import DailyStreak from '../models/DailyStreak';
import FlashcardDeck from '../models/FlashcardDeck';
import Bookmark from '../models/Bookmark';

export interface UpdateProfileDTO {
  name?: string;
  targetRole?: string;
  experienceLevel?: string;
  targetCompanies?: string[];
  preferredModel?: string;
  voiceEnabled?: boolean;
  selectedVoice?: string;
  speechRate?: number;
  themePreference?: string;
}

export const getUserSettings = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

export const updateUserProfile = async (
  userId: string,
  data: UpdateProfileDTO
): Promise<IUser> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (data.name && data.name.trim()) {
    user.name = data.name.trim();
  }

  user.settings = {
    targetRole: data.targetRole !== undefined ? data.targetRole : user.settings?.targetRole,
    experienceLevel: data.experienceLevel !== undefined ? data.experienceLevel : user.settings?.experienceLevel,
    targetCompanies: data.targetCompanies !== undefined ? data.targetCompanies : user.settings?.targetCompanies,
    preferredModel: data.preferredModel !== undefined ? data.preferredModel : user.settings?.preferredModel,
    voiceEnabled: data.voiceEnabled !== undefined ? data.voiceEnabled : user.settings?.voiceEnabled,
    selectedVoice: data.selectedVoice !== undefined ? data.selectedVoice : user.settings?.selectedVoice,
    speechRate: data.speechRate !== undefined ? data.speechRate : user.settings?.speechRate,
    themePreference: data.themePreference !== undefined ? data.themePreference : user.settings?.themePreference,
  };

  await user.save();
  const updated = await User.findById(userId).select('-password');
  return updated as IUser;
};

export const changePassword = async (
  userId: string,
  currentPass: string,
  newPass: string
): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(currentPass, user.password);
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }

  if (newPass.length < 6) {
    throw new Error('New password must be at least 6 characters long');
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPass, salt);
  await user.save();
};

export const exportUserData = async (userId: string): Promise<Record<string, unknown>> => {
  const user = await User.findById(userId).select('-password');
  const conversations = await Conversation.find({ userId });
  const conversationIds = conversations.map((c) => c._id);
  const messages = await Message.find({ conversationId: { $in: conversationIds } });
  const interviews = await Interview.find({ userId });
  const resumeReviews = await ResumeReview.find({ userId });
  const careerPlans = await CareerPlan.find({ userId });
  const codingChallenges = await CodingChallenge.find({ userId });
  const dailyStreak = await DailyStreak.findOne({ userId });
  const flashcardDecks = await FlashcardDeck.find({ userId });
  const bookmarks = await Bookmark.find({ userId });

  return {
    exportDate: new Date().toISOString(),
    userProfile: user,
    conversations,
    messages,
    interviews,
    resumeReviews,
    careerPlans,
    codingChallenges,
    dailyStreak,
    flashcardDecks,
    bookmarks,
  };
};

export const deleteUserAccount = async (
  userId: string,
  passwordConfirm: string
): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(passwordConfirm, user.password);
  if (!isMatch) {
    throw new Error('Incorrect password confirmation. Account deletion aborted.');
  }

  // Cascading delete across all collections
  const conversations = await Conversation.find({ userId });
  const conversationIds = conversations.map((c) => c._id);

  await Message.deleteMany({ conversationId: { $in: conversationIds } });
  await Conversation.deleteMany({ userId });
  await Interview.deleteMany({ userId });
  await ResumeReview.deleteMany({ userId });
  await CareerPlan.deleteMany({ userId });
  await CodingChallenge.deleteMany({ userId });
  await DailyStreak.deleteMany({ userId });
  await FlashcardDeck.deleteMany({ userId });
  await Bookmark.deleteMany({ userId });
  await User.deleteOne({ _id: userId });
};
