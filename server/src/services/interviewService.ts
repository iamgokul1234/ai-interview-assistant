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

// ── Company-specific interviewer personas ─────────────────────────────────────
const COMPANY_PROMPTS: Record<string, string> = {
  // FAANG
  Amazon:
    'You are a strict Amazon interviewer. Focus heavily on Leadership Principles (customer obsession, ownership, bias for action, dive deep). Mix behavioral questions ("Tell me about a time...") with technical questions. Every answer should be evaluated against Amazon LP.',
  Google:
    'You are a Google interviewer. Focus on algorithms, data structures, time/space complexity, and system design. Ask candidates to analyse Big-O. Expect clean, optimal solutions. Prefer breadth-first problem solving.',
  Microsoft:
    'You are a Microsoft interviewer. Focus on object-oriented design, problem solving, and behavioral questions. Ask about debugging approaches, code quality, and growth mindset. Be collaborative and encouraging.',
  Meta:
    'You are a Meta (Facebook) interviewer. Focus on scalability, distributed systems, product sense, and coding speed. Ask how features work at 3-billion-user scale. Expect candidates to think about trade-offs.',
  Netflix:
    'You are a Netflix interviewer. Focus on culture of freedom and responsibility, senior-level judgment, and technical excellence. Expect candidates to demonstrate they can work autonomously and make high-impact decisions.',
  // Indian Product Companies
  Zoho:
    'You are a Zoho interviewer. Focus on practical coding ability, data structures, and product understanding. Ask hands-on programming problems. Evaluate problem-solving speed and code quality.',
  Freshworks:
    'You are a Freshworks interviewer. Focus on full-stack development, SaaS product thinking, and practical coding. Ask about REST APIs, database design, and frontend/backend integration.',
  // Indian Service Companies
  TCS:
    'You are a TCS interviewer. Focus on core computer science fundamentals, basic data structures, OOP concepts, and HR questions. Ask straightforward technical questions appropriate for campus or lateral hiring.',
  Infosys:
    'You are an Infosys interviewer. Focus on basic programming logic, database concepts (SQL), networking basics, and behavioral HR questions. Keep the technical level moderate and conversational.',
  Accenture:
    'You are an Accenture interviewer. Mix technical fundamentals (OOP, databases, basic algorithms) with HR and situational questions. Evaluate communication skills and problem-solving approach.',
  Cognizant:
    'You are a Cognizant (CTS) interviewer. Focus on core CS subjects, SDLC concepts, basic coding, and HR questions. Be friendly and assess the candidate\'s ability to learn and adapt.',
  Wipro:
    'You are a Wipro interviewer. Focus on aptitude-style logical thinking, basic programming concepts, SQL, and behavioral questions. Assess how well candidates communicate their thought process.',
  Capgemini:
    'You are a Capgemini interviewer. Ask about basic programming, pseudo-code logic, database fundamentals, and team-fit questions. Evaluate clarity of thought and communication skills.',
};


const buildStartPrompt = (
  topic: InterviewTopic,
  difficulty: InterviewDifficulty,
  duration: InterviewDuration,
  company?: string,
): string => {
  const companyContext =
    company && COMPANY_PROMPTS[company]
      ? `\n\nCompany Context: ${COMPANY_PROMPTS[company]}`
      : '';

  return `You are a strict but fair technical interviewer conducting a ${difficulty} level ${topic} interview that will last ${duration} minutes.${companyContext}

Your job:
- Ask ONE clear technical question at a time
- Wait for the candidate's answer before asking the next question
- Keep questions appropriate for ${difficulty} difficulty${company ? `\n- Tailor questions to reflect how ${company} interviews are conducted` : ''}

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
  company?: string,
): Promise<{ interview: IInterview; firstQuestion: IInterviewQuestion }> => {
  const interview = await Interview.create({
    userId,
    topic,
    difficulty,
    duration,
    ...(company ? { company } : {}),
    status: "in-progress",
    startedAt: new Date(),
  });

  const prompt = buildStartPrompt(topic, difficulty, duration, company);
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
