import ResumeReview, { IResumeReview } from '../models/ResumeReview';
import { getAIResponse } from './aiService';

const buildResumeReviewPrompt = (resumeText: string): string => {
  return `You are an expert ATS (Applicant Tracking System) reviewer and tech recruiter. Analyze the following resume text carefully and evaluate it thoroughly.

Resume Text:
"""
${resumeText}
"""

Respond ONLY with a valid JSON object in this EXACT structure with no extra text or markdown formatting:
{
  "atsScore": <number between 0 and 100 based on ATS readability, structure, keywords, and impact metrics>,
  "grammarFeedback": "<detailed analysis of grammar, tone, action verbs, and formatting improvements in 3-4 sentences>",
  "missingSkills": ["<skill 1>", "<skill 2>", "<skill 3>", "<skill 4>", "<skill 5>"],
  "improvedSummary": "<a high-impact, professional candidate summary optimized for ATS and recruiters>",
  "projectSuggestions": ["<project idea 1 with key tech stack>", "<project idea 2 with key tech stack>", "<project idea 3 with key tech stack>"],
  "overallFeedback": "<comprehensive recruiter assessment detailing strengths, weaknesses, and actionable tips in 4-5 sentences>"
}

Be realistic and constructive in scoring. Evaluated resume MUST be judged fairly based on modern software engineering hiring standards.`;
};

export const reviewResume = async (
  userId: string,
  resumeText: string,
  fileName?: string
): Promise<IResumeReview> => {
  if (!resumeText.trim()) {
    throw new Error('Resume text content cannot be empty');
  }

  const prompt = buildResumeReviewPrompt(resumeText);
  const aiResponse = await getAIResponse(prompt, []);

  let parsed: {
    atsScore: number;
    grammarFeedback: string;
    missingSkills: string[];
    improvedSummary: string;
    projectSuggestions: string[];
    overallFeedback: string;
  };

  try {
    const clean = aiResponse.replace(/```json|```/g, '').trim();
    parsed = JSON.parse(clean);
  } catch {
    throw new Error('Failed to parse AI resume evaluation. Please try again.');
  }

  const review = await ResumeReview.create({
    userId,
    resumeText,
    fileName: fileName || 'Uploaded_Resume.pdf',
    atsScore: Math.min(100, Math.max(0, parsed.atsScore || 0)),
    grammarFeedback: parsed.grammarFeedback,
    missingSkills: parsed.missingSkills || [],
    improvedSummary: parsed.improvedSummary,
    projectSuggestions: parsed.projectSuggestions || [],
    overallFeedback: parsed.overallFeedback,
  });

  return review;
};

export const getResumeReviews = async (userId: string): Promise<IResumeReview[]> => {
  return await ResumeReview.find({ userId }).sort({ createdAt: -1 });
};

export const getResumeReviewById = async (
  reviewId: string,
  userId: string
): Promise<IResumeReview> => {
  const review = await ResumeReview.findOne({ _id: reviewId, userId });
  if (!review) {
    throw new Error('Resume review not found');
  }
  return review;
};
