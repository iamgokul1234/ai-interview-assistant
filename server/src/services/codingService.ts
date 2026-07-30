import CodingChallenge, {
  ICodingChallenge,
  CodingLanguage,
  CodeExample,
  CodeEvaluation,
} from '../models/CodingChallenge';
import type { InterviewDifficulty } from '../models/Interview';
import { getAIResponse } from './aiService';

const buildGeneratePrompt = (
  topic: string,
  difficulty: InterviewDifficulty,
  language: CodingLanguage
): string => {
  return `You are a Senior Technical Lead creating a ${difficulty} level coding challenge on the topic of "${topic}".

Write a high-quality problem in ${language}.

Respond ONLY with a valid JSON object in this EXACT structure with no extra text or markdown formatting:
{
  "title": "<Concise Problem Title>",
  "description": "<Clear, detailed problem description with clear requirements>",
  "examples": [
    { "input": "<Example 1 Input>", "output": "<Example 1 Output>", "explanation": "<Optional explanation>" },
    { "input": "<Example 2 Input>", "output": "<Example 2 Output>", "explanation": "<Optional explanation>" }
  ],
  "constraints": [
    "<Constraint 1, e.g. 1 <= nums.length <= 10^5>",
    "<Constraint 2, e.g. -10^9 <= nums[i] <= 10^9>"
  ],
  "starterCode": "<Idiomatic starter function signature with parameter names and empty body/return for ${language}>"
}`;
};

const buildEvaluationPrompt = (
  challenge: ICodingChallenge,
  userCode: string
): string => {
  return `You are an automated Code Judge evaluating a candidate's code submission for the following problem:

Problem Title: ${challenge.title}
Topic: ${challenge.topic}
Difficulty: ${challenge.difficulty}
Language: ${challenge.language}

Problem Description:
${challenge.description}

Examples & Constraints:
${JSON.stringify(challenge.examples, null, 2)}
Constraints: ${challenge.constraints.join(', ')}

Candidate's Submitted Code:
"""${challenge.language}
${userCode}
"""

Evaluate the submission strictly for correctness, edge cases, time complexity, and code quality.

Respond ONLY with a valid JSON object in this EXACT structure with no extra text or markdown formatting:
{
  "passed": <true if code correctly solves the problem and handles edge cases, false otherwise>,
  "score": <overall code quality and correctness score between 0 and 100>,
  "timeComplexity": "<Time complexity e.g. O(N log N) or O(N^2)>",
  "spaceComplexity": "<Space complexity e.g. O(1) or O(N)>",
  "detailedFeedback": "<Detailed evaluation of correctness, edge case handling, performance, and code style in 3-4 sentences>",
  "optimalSolution": "<Clean, production-ready, fully commented optimal solution in ${challenge.language}>"
}`;
};

export const generateChallenge = async (
  userId: string,
  topic: string,
  difficulty: InterviewDifficulty,
  language: CodingLanguage
): Promise<ICodingChallenge> => {
  const prompt = buildGeneratePrompt(topic, difficulty, language);
  const aiResponse = await getAIResponse(prompt, []);

  let parsed: {
    title: string;
    description: string;
    examples: CodeExample[];
    constraints: string[];
    starterCode: string;
  };

  try {
    const clean = aiResponse.replace(/```json|```/g, '').trim();
    parsed = JSON.parse(clean);
  } catch {
    throw new Error('Failed to parse AI generated challenge. Please try again.');
  }

  const challenge = await CodingChallenge.create({
    userId,
    topic,
    difficulty,
    language,
    title: parsed.title,
    description: parsed.description,
    examples: parsed.examples || [],
    constraints: parsed.constraints || [],
    starterCode: parsed.starterCode,
    status: 'unsolved',
  });

  return challenge;
};

export const submitSolution = async (
  challengeId: string,
  userId: string,
  userCode: string
): Promise<ICodingChallenge> => {
  const challenge = await CodingChallenge.findOne({ _id: challengeId, userId });
  if (!challenge) {
    throw new Error('Coding challenge not found');
  }

  if (!userCode.trim()) {
    throw new Error('User code submission cannot be empty');
  }

  const prompt = buildEvaluationPrompt(challenge, userCode);
  const aiResponse = await getAIResponse(prompt, []);

  let parsed: CodeEvaluation;

  try {
    const clean = aiResponse.replace(/```json|```/g, '').trim();
    parsed = JSON.parse(clean);
  } catch {
    throw new Error('Failed to parse AI solution evaluation. Please try again.');
  }

  challenge.userCode = userCode;
  challenge.status = 'submitted';
  challenge.evaluation = {
    passed: Boolean(parsed.passed),
    score: Math.min(100, Math.max(0, parsed.score || 0)),
    timeComplexity: parsed.timeComplexity || 'N/A',
    spaceComplexity: parsed.spaceComplexity || 'N/A',
    detailedFeedback: parsed.detailedFeedback || 'No feedback provided.',
    optimalSolution: parsed.optimalSolution || '',
  };

  await challenge.save();
  return challenge;
};

export const getChallenges = async (
  userId: string
): Promise<ICodingChallenge[]> => {
  return await CodingChallenge.find({ userId }).sort({ createdAt: -1 });
};

export const getChallengeById = async (
  challengeId: string,
  userId: string
): Promise<ICodingChallenge> => {
  const challenge = await CodingChallenge.findOne({ _id: challengeId, userId });
  if (!challenge) {
    throw new Error('Coding challenge not found');
  }
  return challenge;
};
