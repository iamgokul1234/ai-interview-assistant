import Interview from '../models/Interview';
import type { InterviewTopic, InterviewDifficulty } from '../models/Interview';

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
  completedAt: Date | null;
  createdAt: Date;
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

export const getDashboardStats = async (userId: string): Promise<DashboardStats> => {
  const allInterviews = await Interview.find({ userId }).sort({ createdAt: -1 }).lean();

  const totalInterviews = allInterviews.length;

  const completedInterviews = allInterviews.filter(
    (iv) => iv.status === 'completed' && typeof iv.score === 'number'
  );

  const completedCount = completedInterviews.length;

  const averageScore =
    completedCount > 0
      ? Math.round(
          completedInterviews.reduce((sum, iv) => sum + (iv.score as number), 0) / completedCount
        )
      : null;

  const bestScore =
    completedCount > 0
      ? Math.max(...completedInterviews.map((iv) => iv.score as number))
      : null;

  // Current streak: consecutive calendar days (most recent first) that have at least one interview
  const currentStreak = calculateStreak(allInterviews.map((iv) => iv.createdAt));

  // Topic breakdown
  const topicMap = new Map<InterviewTopic, { count: number; scores: number[] }>();
  for (const iv of allInterviews) {
    const existing = topicMap.get(iv.topic) ?? { count: 0, scores: [] };
    existing.count += 1;
    if (iv.status === 'completed' && typeof iv.score === 'number') {
      existing.scores.push(iv.score);
    }
    topicMap.set(iv.topic, existing);
  }

  const topicBreakdown: TopicBreakdown[] = Array.from(topicMap.entries()).map(
    ([topic, data]) => ({
      topic,
      count: data.count,
      averageScore:
        data.scores.length > 0
          ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
          : 0,
    })
  );

  // Difficulty breakdown
  const difficultyMap = new Map<InterviewDifficulty, number>();
  for (const iv of allInterviews) {
    difficultyMap.set(iv.difficulty, (difficultyMap.get(iv.difficulty) ?? 0) + 1);
  }

  const difficultyBreakdown: DifficultyBreakdown[] = Array.from(difficultyMap.entries()).map(
    ([difficulty, count]) => ({ difficulty, count })
  );

  // Recent 5 interviews (already sorted by createdAt desc)
  const recentInterviews: RecentInterview[] = allInterviews.slice(0, 5).map((iv) => ({
    _id: (iv._id as object).toString(),
    topic: iv.topic,
    difficulty: iv.difficulty,
    score: typeof iv.score === 'number' ? iv.score : null,
    status: iv.status,
    completedAt: iv.completedAt ?? null,
    createdAt: iv.createdAt,
  }));

  return {
    totalInterviews,
    completedInterviews: completedCount,
    averageScore,
    bestScore,
    currentStreak,
    topicBreakdown,
    difficultyBreakdown,
    recentInterviews,
  };
};

// Counts how many consecutive days ending today (or yesterday) have at least one interview
const calculateStreak = (dates: Date[]): number => {
  if (dates.length === 0) return 0;

  // Get unique calendar dates as YYYY-MM-DD strings
  const uniqueDays = new Set<string>(
    dates.map((d) => d.toISOString().split('T')[0])
  );

  const today = new Date();
  let streak = 0;
  let checking = new Date(today);

  // Start from today; if today has no interview, check yesterday as the start
  const todayStr = today.toISOString().split('T')[0];
  if (!uniqueDays.has(todayStr)) {
    checking.setDate(checking.getDate() - 1);
  }

  while (true) {
    const dayStr = checking.toISOString().split('T')[0];
    if (uniqueDays.has(dayStr)) {
      streak += 1;
      checking.setDate(checking.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};
