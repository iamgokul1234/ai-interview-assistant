import Interview from '../models/Interview';
import type { InterviewTopic, InterviewDifficulty } from '../models/Interview';

export interface WeeklyScorePoint {
  date: string;       // 'Mon', 'Tue', etc.
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

export const getAnalyticsData = async (userId: string): Promise<AnalyticsData> => {
  const allInterviews = await Interview.find({ userId }).sort({ createdAt: 1 }).lean();

  const completed = allInterviews.filter(
    (iv) => iv.status === 'completed' && typeof iv.score === 'number'
  );

  // ── 1. Weekly Scores (last 7 calendar days) ──────────────────────────────
  const weeklyScores = buildWeeklyScores(completed as CompletedInterview[]);

  // ── 2. Topic Performance ─────────────────────────────────────────────────
  const topicMap = new Map<InterviewTopic, { scores: number[]; count: number }>();
  for (const iv of completed) {
    const existing = topicMap.get(iv.topic) ?? { scores: [], count: 0 };
    existing.scores.push(iv.score as number);
    existing.count += 1;
    topicMap.set(iv.topic, existing);
  }

  const topicPerformance: TopicPerformancePoint[] = Array.from(topicMap.entries())
    .map(([topic, data]) => ({
      topic,
      averageScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
      count: data.count,
    }))
    .sort((a, b) => b.averageScore - a.averageScore);

  // ── 3. Difficulty Distribution ────────────────────────────────────────────
  const total = allInterviews.length;
  const diffMap = new Map<InterviewDifficulty, number>();
  for (const iv of allInterviews) {
    diffMap.set(iv.difficulty, (diffMap.get(iv.difficulty) ?? 0) + 1);
  }

  const difficultyDistribution: DifficultyDistributionPoint[] = Array.from(
    diffMap.entries()
  ).map(([difficulty, count]) => ({
    difficulty,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
  }));

  // ── 4. Score Trend (all completed in chronological order) ─────────────────
  const scoreTrend: ScoreTrendPoint[] = completed.map((iv, idx) => ({
    index: idx + 1,
    score: iv.score as number,
    topic: iv.topic,
    date: new Date(iv.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    }),
  }));

  return {
    weeklyScores,
    topicPerformance,
    difficultyDistribution,
    scoreTrend,
  };
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface CompletedInterview {
  score: number | null;
  createdAt: Date;
  topic: InterviewTopic;
}

const buildWeeklyScores = (interviews: CompletedInterview[]): WeeklyScorePoint[] => {
  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result: WeeklyScorePoint[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    const dayInterviews = interviews.filter((iv) => {
      const ivDate = new Date(iv.createdAt).toISOString().split('T')[0];
      return ivDate === dateStr;
    });

    const scores = dayInterviews
      .map((iv) => iv.score)
      .filter((s): s is number => typeof s === 'number');

    result.push({
      date: DAY_LABELS[d.getDay()],
      averageScore:
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : null,
      count: scores.length,
    });
  }

  return result;
};
