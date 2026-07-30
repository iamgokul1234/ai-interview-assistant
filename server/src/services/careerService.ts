import CareerPlan, {
  ICareerPlan,
  ExperienceLevel,
  TargetRole,
  MonthlyMilestone,
  WeeklyPlanItem,
} from '../models/CareerPlan';
import { getAIResponse } from './aiService';

export interface GenerateCareerInput {
  experience: ExperienceLevel;
  currentSkills: string[];
  targetRole: TargetRole;
  targetCompany?: string;
  targetSalary?: string;
}

const buildCareerPrompt = (input: GenerateCareerInput): string => {
  return `You are a Senior Principal Tech Career Coach and Engineering Mentor. Create a detailed, actionable career roadmap tailored to the candidate's background and goals.

Candidate Profile:
- Current Experience Level: ${input.experience}
- Current Skills: ${input.currentSkills.join(', ') || 'General CS fundamentals'}
- Target Role: ${input.targetRole}
- Target Company: ${input.targetCompany || 'Top Tech Product Companies'}
- Target Salary Goal: ${input.targetSalary || 'Competitive Market Rate'}

Respond ONLY with a valid JSON object in this EXACT structure with no extra text or markdown formatting:
{
  "roadmap6Month": [
    { "month": 1, "title": "<Month 1 Milestone Title>", "focus": "<Core Focus & Strategy>", "keyDeliverables": ["<Deliverable 1>", "<Deliverable 2>", "<Deliverable 3>"] },
    { "month": 2, "title": "<Month 2 Milestone Title>", "focus": "<Core Focus & Strategy>", "keyDeliverables": ["<Deliverable 1>", "<Deliverable 2>", "<Deliverable 3>"] },
    { "month": 3, "title": "<Month 3 Milestone Title>", "focus": "<Core Focus & Strategy>", "keyDeliverables": ["<Deliverable 1>", "<Deliverable 2>", "<Deliverable 3>"] },
    { "month": 4, "title": "<Month 4 Milestone Title>", "focus": "<Core Focus & Strategy>", "keyDeliverables": ["<Deliverable 1>", "<Deliverable 2>", "<Deliverable 3>"] },
    { "month": 5, "title": "<Month 5 Milestone Title>", "focus": "<Core Focus & Strategy>", "keyDeliverables": ["<Deliverable 1>", "<Deliverable 2>", "<Deliverable 3>"] },
    { "month": 6, "title": "<Month 6 Milestone Title>", "focus": "<Core Focus & Strategy>", "keyDeliverables": ["<Deliverable 1>", "<Deliverable 2>", "<Deliverable 3>"] }
  ],
  "weeklyLearningPlan": [
    { "week": 1, "topic": "<Topic Title>", "tasks": ["<Task 1>", "<Task 2>"] },
    { "week": 2, "topic": "<Topic Title>", "tasks": ["<Task 1>", "<Task 2>"] },
    { "week": 3, "topic": "<Topic Title>", "tasks": ["<Task 1>", "<Task 2>"] },
    { "week": 4, "topic": "<Topic Title>", "tasks": ["<Task 1>", "<Task 2>"] },
    { "week": 5, "topic": "<Topic Title>", "tasks": ["<Task 1>", "<Task 2>"] },
    { "week": 6, "topic": "<Topic Title>", "tasks": ["<Task 1>", "<Task 2>"] },
    { "week": 7, "topic": "<Topic Title>", "tasks": ["<Task 1>", "<Task 2>"] },
    { "week": 8, "topic": "<Topic Title>", "tasks": ["<Task 1>", "<Task 2>"] },
    { "week": 9, "topic": "<Topic Title>", "tasks": ["<Task 1>", "<Task 2>"] },
    { "week": 10, "topic": "<Topic Title>", "tasks": ["<Task 1>", "<Task 2>"] },
    { "week": 11, "topic": "<Topic Title>", "tasks": ["<Task 1>", "<Task 2>"] },
    { "week": 12, "topic": "<Topic Title>", "tasks": ["<Task 1>", "<Task 2>"] }
  ],
  "recommendedProjects": [
    "<Project 1: Full-stack or system application with tech stack>",
    "<Project 2: Advanced architectural application with tech stack>",
    "<Project 3: Production-ready portfolio project with tech stack>"
  ],
  "recommendedCertifications": [
    "<Certification 1>",
    "<Certification 2>",
    "<Certification 3>"
  ],
  "skillGapAnalysis": [
    "<Gap 1: Missing core technology or architecture concept>",
    "<Gap 2: Missing practical experience area>",
    "<Gap 3: Missing system design or testing practice>"
  ]
}

Ensure the plan is realistic, highly structured, and directly targets ${input.targetRole} requirements.`;
};

export const generateCareerPlan = async (
  userId: string,
  input: GenerateCareerInput
): Promise<ICareerPlan> => {
  const prompt = buildCareerPrompt(input);
  const aiResponse = await getAIResponse(prompt, []);

  let parsed: {
    roadmap6Month: MonthlyMilestone[];
    weeklyLearningPlan: WeeklyPlanItem[];
    recommendedProjects: string[];
    recommendedCertifications: string[];
    skillGapAnalysis: string[];
  };

  try {
    const clean = aiResponse.replace(/```json|```/g, '').trim();
    parsed = JSON.parse(clean);
  } catch {
    throw new Error('Failed to parse AI career roadmap. Please try again.');
  }

  const plan = await CareerPlan.create({
    userId,
    experience: input.experience,
    currentSkills: input.currentSkills,
    targetRole: input.targetRole,
    targetCompany: input.targetCompany,
    targetSalary: input.targetSalary,
    roadmap6Month: parsed.roadmap6Month || [],
    weeklyLearningPlan: parsed.weeklyLearningPlan || [],
    recommendedProjects: parsed.recommendedProjects || [],
    recommendedCertifications: parsed.recommendedCertifications || [],
    skillGapAnalysis: parsed.skillGapAnalysis || [],
  });

  return plan;
};

export const getCareerPlans = async (userId: string): Promise<ICareerPlan[]> => {
  return await CareerPlan.find({ userId }).sort({ createdAt: -1 });
};

export const getCareerPlanById = async (
  planId: string,
  userId: string
): Promise<ICareerPlan> => {
  const plan = await CareerPlan.findOne({ _id: planId, userId });
  if (!plan) {
    throw new Error('Career plan not found');
  }
  return plan;
};
