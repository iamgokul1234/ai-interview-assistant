export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Conversation {
  _id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initializing: boolean;

}

export interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
}

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

export interface InterviewQuestion {
  _id: string;
  interviewId: string;
  questionNumber: number;
  question: string;
  answer?: string;
  evaluation?: string;
  score?: number;
  createdAt: string;
}

export interface Interview {
  _id: string;
  userId: string;
  topic: InterviewTopic;
  difficulty: InterviewDifficulty;
  duration: InterviewDuration;
  status: InterviewStatus;
  startedAt: string;
  completedAt?: string;
  score?: number;
  feedback?: string;
  strongAreas?: string[];
  weakAreas?: string[];
  suggestions?: string[];
  createdAt: string;
}

export interface InterviewState {
  interviews: Interview[];
  currentInterview: Interview | null;
  currentQuestion: InterviewQuestion | null;
  questions: InterviewQuestion[];
  loading: boolean;
  error: string | null;
}

// ─── Dashboard Types ──────────────────────────────────────────────────────────

export interface TopicBreakdown {
  topic: InterviewTopic;
  count: number;
  averageScore: number;
}

export interface DifficultyBreakdown {
  difficulty: InterviewDifficulty;
  count: number;
}

export interface RecentInterview {
  _id: string;
  topic: InterviewTopic;
  difficulty: InterviewDifficulty;
  score: number | null;
  status: string;
  completedAt: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number | null;
  bestScore: number | null;
  currentStreak: number;
  topicBreakdown: TopicBreakdown[];
  difficultyBreakdown: DifficultyBreakdown[];
  recentInterviews: RecentInterview[];
}

export interface DashboardState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
}

// ─── Analytics Types ──────────────────────────────────────────────────────────

export interface WeeklyScorePoint {
  date: string;
  averageScore: number | null;
  count: number;
}

export interface TopicPerformancePoint {
  topic: InterviewTopic;
  averageScore: number;
  count: number;
}

export interface DifficultyDistributionPoint {
  difficulty: InterviewDifficulty;
  count: number;
  percentage: number;
}

export interface ScoreTrendPoint {
  index: number;
  score: number;
  topic: InterviewTopic;
  date: string;
}

export interface AnalyticsData {
  weeklyScores: WeeklyScorePoint[];
  topicPerformance: TopicPerformancePoint[];
  difficultyDistribution: DifficultyDistributionPoint[];
  scoreTrend: ScoreTrendPoint[];
}

export interface AnalyticsState {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
}