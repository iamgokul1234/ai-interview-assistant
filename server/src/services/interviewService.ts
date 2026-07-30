import Interview, {
  IInterview,
  InterviewTopic,
  InterviewDifficulty,
  InterviewDuration,
} from "../models/Interview";
import InterviewQuestion, {
  IInterviewQuestion,
} from "../models/InterviewQuestion";
import { getAIResponse } from "./aiService";

const buildStartPrompt = (
  topic: InterviewTopic,
  difficulty: InterviewDifficulty,
  duration: InterviewDuration,
): string => {
  return `You are a strict but fair technical interviewer conducting a ${difficulty} level ${topic} interview that will last ${duration} minutes.

Your job:
- Ask ONE clear technical question at a time
- Wait for the candidate's answer before asking the next question
- Keep questions appropriate for ${difficulty} difficulty

Rules:
- Ask only ONE question now
- Do NOT answer the question yourself
- Do NOT provide hints
- Keep the question concise and clear
- Start directly with the question, no preamble

Ask the first ${difficulty} level ${topic} interview question now.`;
};

const buildEvaluationPrompt = (
  topic: InterviewTopic,
  difficulty: InterviewDifficulty,
  question: string,
  answer: string,
  questionNumber: number,
  previousQuestions: string[],
): string => {
  const asked = previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n");

  return `You are evaluating a candidate's answer in a ${difficulty} level ${topic} interview.

Question ${questionNumber}: ${question}

Candidate's Answer: ${answer}

Questions already asked (DO NOT repeat these):
${asked}

Evaluate the answer and respond in this EXACT JSON format with no extra text:
{
  "score": <number 0-10>,
  "evaluation": "<brief evaluation of the answer in 2-3 sentences>",
  "nextQuestion": "<a NEW ${difficulty} level ${topic} interview question that has NOT been asked before>"
}

Be strict but fair. Score 0-3 for wrong/incomplete, 4-6 for partial, 7-9 for good, 10 for perfect.
The nextQuestion MUST be completely different from all questions listed above.`;
};

const buildFinalReportPrompt = (
  topic: InterviewTopic,
  difficulty: InterviewDifficulty,
  questions: IInterviewQuestion[],
): string => {
  const qa = questions
    .map(
      (q) =>
        `Q${q.questionNumber}: ${q.question}\nAnswer: ${q.answer || "No answer"}\nScore: ${q.score}/10`,
    )
    .join("\n\n");

  return `You are generating a final interview report for a ${difficulty} level ${topic} interview.

Interview Summary:
${qa}

Generate a final report in this EXACT JSON format with no extra text:
{
  "score": <overall score 0-100>,
  "feedback": "<overall performance feedback in 3-4 sentences>",
  "strongAreas": ["<area 1>", "<area 2>", "<area 3>"],
  "weakAreas": ["<area 1>", "<area 2>", "<area 3>"],
  "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"]
}`;
};

export const startInterview = async (
  userId: string,
  topic: InterviewTopic,
  difficulty: InterviewDifficulty,
  duration: InterviewDuration,
): Promise<{ interview: IInterview; firstQuestion: IInterviewQuestion }> => {
  const interview = await Interview.create({
    userId,
    topic,
    difficulty,
    duration,
    status: "in-progress",
    startedAt: new Date(),
  });

  const prompt = buildStartPrompt(topic, difficulty, duration);
  const firstQuestionText = await getAIResponse(prompt, []);

  const firstQuestion = await InterviewQuestion.create({
    interviewId: interview._id,
    questionNumber: 1,
    question: firstQuestionText.trim(),
  });

  return { interview, firstQuestion };
};

export const submitAnswer = async (
  interviewId: string,
  userId: string,
  answer: string,
): Promise<{
  evaluation: string;
  score: number;
  nextQuestion: IInterviewQuestion | null;
}> => {
  const interview = await Interview.findOne({ _id: interviewId, userId });
  if (!interview) throw new Error("Interview not found");
  if (interview.status === "completed")
    throw new Error("Interview already completed");

  const questions = await InterviewQuestion.find({ interviewId }).sort({
    questionNumber: 1,
  });
  const currentQuestion = questions[questions.length - 1];

  if (!currentQuestion) throw new Error("No question found");

  const previousQuestions = questions.map((q) => q.question);

  const prompt = buildEvaluationPrompt(
    interview.topic,
    interview.difficulty,
    currentQuestion.question,
    answer,
    currentQuestion.questionNumber,
    previousQuestions,
  );

  const aiResponse = await getAIResponse(prompt, []);

  let parsed: { score: number; evaluation: string; nextQuestion: string };
  try {
    const clean = aiResponse.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(clean);
  } catch {
    throw new Error("AI response parsing failed");
  }

  await InterviewQuestion.findByIdAndUpdate(currentQuestion._id, {
    answer,
    evaluation: parsed.evaluation,
    score: parsed.score,
  });

  const nextQuestion = await InterviewQuestion.create({
    interviewId,
    questionNumber: currentQuestion.questionNumber + 1,
    question: parsed.nextQuestion,
  });

  return {
    evaluation: parsed.evaluation,
    score: parsed.score,
    nextQuestion,
  };
};

export const completeInterview = async (
  interviewId: string,
  userId: string,
): Promise<IInterview> => {
  const interview = await Interview.findOne({ _id: interviewId, userId });
  if (!interview) throw new Error("Interview not found");

  const questions = await InterviewQuestion.find({
    interviewId,
    answer: { $exists: true },
  }).sort({ questionNumber: 1 });

  const prompt = buildFinalReportPrompt(
    interview.topic,
    interview.difficulty,
    questions,
  );

  const aiResponse = await getAIResponse(prompt, []);

  let parsed: {
    score: number;
    feedback: string;
    strongAreas: string[];
    weakAreas: string[];
    suggestions: string[];
  };

  try {
    const clean = aiResponse.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(clean);
  } catch {
    throw new Error("AI report parsing failed");
  }

  const updatedInterview = await Interview.findByIdAndUpdate(
    interviewId,
    {
      status: "completed",
      completedAt: new Date(),
      score: parsed.score,
      feedback: parsed.feedback,
      strongAreas: parsed.strongAreas,
      weakAreas: parsed.weakAreas,
      suggestions: parsed.suggestions,
    },
    { new: true },
  );

  return updatedInterview as IInterview;
};

export const getInterviews = async (userId: string): Promise<IInterview[]> => {
  return await Interview.find({ userId }).sort({ createdAt: -1 });
};

export const getInterview = async (
  interviewId: string,
  userId: string,
): Promise<{ interview: IInterview; questions: IInterviewQuestion[] }> => {
  const interview = await Interview.findOne({ _id: interviewId, userId });
  if (!interview) throw new Error("Interview not found");

  const questions = await InterviewQuestion.find({ interviewId }).sort({
    questionNumber: 1,
  });

  return { interview, questions };
};
