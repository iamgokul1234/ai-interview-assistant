import DailyChallenge, {
  IDailyChallenge,
  DailyQuestionType,
} from '../models/DailyChallenge';
import DailyStreak, { IDailyStreak } from '../models/DailyStreak';
import { getAIResponse } from './aiService';

const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

const getYesterdayDateString = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

const buildDailyPrompt = (type: DailyQuestionType, dateStr: string): string => {
  return `You are a Senior Technical Examiner creating the Daily Tech Challenge for ${dateStr}.

Generate a fresh, engaging ${type.toUpperCase()} question.

Respond ONLY with a valid JSON object in this EXACT structure with no extra text or markdown formatting:

${
  type === 'mcq'
    ? `{
  "type": "mcq",
  "question": "<Clear technical multiple choice question>",
  "options": ["<Option A>", "<Option B>", "<Option C>", "<Option D>"],
  "correctOptionIndex": <0, 1, 2, or 3>,
  "explanation": "<Clear detailed explanation of why the correct option is right>"
}`
    : type === 'short-answer'
    ? `{
  "type": "short-answer",
  "question": "<Conceptual technical question requiring a concise answer>",
  "sampleSolution": "<Key concepts that must be present in a correct candidate answer>",
  "explanation": "<Detailed explanation and model answer>"
}`
    : `{
  "type": "code-snippet",
  "question": "<Short coding logic/debugging problem>",
  "starterCode": "<Starter code function>",
  "sampleSolution": "<Correct code solution>",
  "explanation": "<Detailed code walkthrough and explanation>"
}`
}`;
};

export const getOrGenerateTodayChallenge = async (): Promise<IDailyChallenge> => {
  const todayStr = getTodayDateString();

  let challenge = await DailyChallenge.findOne({ date: todayStr });
  if (challenge) {
    return challenge;
  }

  // Alternate question types based on day of month
  const dayOfMonth = new Date().getDate();
  const types: DailyQuestionType[] = ['mcq', 'short-answer', 'code-snippet'];
  const type = types[dayOfMonth % 3];

  const prompt = buildDailyPrompt(type, todayStr);
  const aiResponse = await getAIResponse(prompt, []);

  let parsed: {
    type: DailyQuestionType;
    question: string;
    options?: string[];
    correctOptionIndex?: number;
    starterCode?: string;
    sampleSolution?: string;
    explanation: string;
  };

  try {
    const clean = aiResponse.replace(/```json|```/g, '').trim();
    parsed = JSON.parse(clean);
  } catch {
    throw new Error('Failed to parse AI daily challenge. Please try again.');
  }

  challenge = await DailyChallenge.create({
    date: todayStr,
    type: parsed.type || type,
    question: parsed.question,
    options: parsed.options,
    correctOptionIndex: parsed.correctOptionIndex,
    starterCode: parsed.starterCode,
    sampleSolution: parsed.sampleSolution,
    explanation: parsed.explanation,
  });

  return challenge;
};

export interface DailySubmissionResult {
  correct: boolean;
  explanation: string;
  userAnswer: string | number;
  streak: {
    currentStreak: number;
    longestStreak: number;
    totalSolved: number;
    isSolvedToday: boolean;
  };
}

export const submitDailyAttempt = async (
  userId: string,
  userAnswer: string | number
): Promise<DailySubmissionResult> => {
  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString();

  const challenge = await getOrGenerateTodayChallenge();

  let streak = await DailyStreak.findOne({ userId });
  if (!streak) {
    streak = await DailyStreak.create({ userId, currentStreak: 0, longestStreak: 0 });
  }

  const alreadySolvedToday = streak.solvedDates.includes(todayStr);

  let correct = false;
  let explanation = challenge.explanation;

  if (challenge.type === 'mcq') {
    const selectedIdx = Number(userAnswer);
    correct = selectedIdx === challenge.correctOptionIndex;
  } else {
    // For short-answer and code-snippet, use AI to judge candidate's answer
    const evalPrompt = `Evaluate the candidate's answer to the following daily challenge question:

Question: ${challenge.question}
Sample Model Solution: ${challenge.sampleSolution || 'N/A'}

Candidate's Answer: "${userAnswer}"

Respond ONLY with a valid JSON object in this EXACT structure:
{
  "correct": <true if candidate demonstrated correct understanding or valid code, false otherwise>,
  "explanation": "<Constructive feedback explaining what was right or missing in 2-3 sentences>"
}`;

    const evalResponse = await getAIResponse(evalPrompt, []);
    try {
      const clean = evalResponse.replace(/```json|```/g, '').trim();
      const parsedEval = JSON.parse(clean);
      correct = Boolean(parsedEval.correct);
      explanation = parsedEval.explanation || challenge.explanation;
    } catch {
      correct = false;
      explanation = 'Failed to evaluate answer. Please try again.';
    }
  }

  // Update streak logic if not already solved today
  if (!alreadySolvedToday) {
    if (correct) {
      if (streak.lastAttemptDate === yesterdayStr) {
        streak.currentStreak += 1;
      } else {
        streak.currentStreak = 1;
      }
      streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
      streak.totalSolved += 1;
      streak.solvedDates.push(todayStr);
      streak.lastAttemptDate = todayStr;
    } else {
      // Wrong attempt does not reset if they already have streak today, but resets if missed yesterday
      if (streak.lastAttemptDate !== yesterdayStr && streak.lastAttemptDate !== todayStr) {
        streak.currentStreak = 0;
      }
    }
    await streak.save();
  }

  return {
    correct,
    explanation,
    userAnswer,
    streak: {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      totalSolved: streak.totalSolved,
      isSolvedToday: streak.solvedDates.includes(todayStr),
    },
  };
};

export const getUserStreak = async (
  userId: string
): Promise<{
  currentStreak: number;
  longestStreak: number;
  totalSolved: number;
  isSolvedToday: boolean;
}> => {
  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString();

  let streak = await DailyStreak.findOne({ userId });
  if (!streak) {
    streak = await DailyStreak.create({ userId, currentStreak: 0, longestStreak: 0 });
  }

  // Check if streak was broken (missed yesterday)
  if (
    streak.lastAttemptDate &&
    streak.lastAttemptDate !== todayStr &&
    streak.lastAttemptDate !== yesterdayStr
  ) {
    streak.currentStreak = 0;
    await streak.save();
  }

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    totalSolved: streak.totalSolved,
    isSolvedToday: streak.solvedDates.includes(todayStr),
  };
};
