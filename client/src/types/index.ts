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

export type InterviewCompany =
  | 'Amazon'
  | 'Google'
  | 'Microsoft'
  | 'Meta'
  | 'Netflix'
  | 'Zoho'
  | 'Freshworks'
  | 'TCS'
  | 'Infosys'
  | 'Accenture'
  | 'Cognizant'
  | 'Wipro'
  | 'Capgemini';

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
  company?: InterviewCompany;
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

// ─── Resume Review Types ──────────────────────────────────────────────────────

export interface ResumeReview {
  _id: string;
  userId: string;
  resumeText: string;
  fileName?: string;
  atsScore: number;
  grammarFeedback: string;
  missingSkills: string[];
  improvedSummary: string;
  projectSuggestions: string[];
  overallFeedback: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeState {
  reviews: ResumeReview[];
  currentReview: ResumeReview | null;
  loading: boolean;
  error: string | null;
}

// ─── Career Coach Types ───────────────────────────────────────────────────────

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

export interface CareerPlan {
  _id: string;
  userId: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface CareerState {
  plans: CareerPlan[];
  currentPlan: CareerPlan | null;
  loading: boolean;
  error: string | null;
}

// ─── Coding Challenge Types ───────────────────────────────────────────────────

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

export interface CodingChallenge {
  _id: string;
  userId: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface CodingState {
  challenges: CodingChallenge[];
  currentChallenge: CodingChallenge | null;
  loading: boolean;
  error: string | null;
}

// ─── Daily Challenge Types ────────────────────────────────────────────────────

export type DailyQuestionType = 'mcq' | 'short-answer' | 'code-snippet';

export interface DailyChallenge {
  _id: string;
  date: string;
  type: DailyQuestionType;
  question: string;
  options?: string[];
  starterCode?: string;
  isSolvedToday?: boolean;
}

export interface DailyStreak {
  currentStreak: number;
  longestStreak: number;
  totalSolved: number;
  isSolvedToday: boolean;
}

export interface DailySubmissionResult {
  correct: boolean;
  explanation: string;
  userAnswer: string | number;
  streak: DailyStreak;
}

export interface DailyState {
  challenge: DailyChallenge | null;
  streak: DailyStreak | null;
  lastResult: DailySubmissionResult | null;
  loading: boolean;
  error: string | null;
}

// ─── Flash Cards Types ────────────────────────────────────────────────────────

export interface Flashcard {
  cardId: string;
  front: string;
  back: string;
  difficulty: InterviewDifficulty;
  category: string;
  mastered: boolean;
}

export interface FlashcardDeck {
  _id: string;
  userId: string;
  topic: string;
  title: string;
  cards: Flashcard[];
  masteredCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FlashcardState {
  decks: FlashcardDeck[];
  currentDeck: FlashcardDeck | null;
  loading: boolean;
  error: string | null;
}