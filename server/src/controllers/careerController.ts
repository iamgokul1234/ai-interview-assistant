import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import {
  generateCareerPlan,
  getCareerPlans,
  getCareerPlanById,
} from '../services/careerService';
import type { ExperienceLevel, TargetRole } from '../models/CareerPlan';

export const generateCareerPlanHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { experience, currentSkills, targetRole, targetCompany, targetSalary } =
      req.body;

    if (!experience || !targetRole) {
      res
        .status(400)
        .json({ message: 'Experience level and target role are required' });
      return;
    }

    const skillsArray = Array.isArray(currentSkills)
      ? currentSkills
      : typeof currentSkills === 'string'
      ? currentSkills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const plan = await generateCareerPlan(req.userId as string, {
      experience: experience as ExperienceLevel,
      currentSkills: skillsArray,
      targetRole: targetRole as TargetRole,
      targetCompany: typeof targetCompany === 'string' ? targetCompany.trim() : undefined,
      targetSalary: typeof targetSalary === 'string' ? targetSalary.trim() : undefined,
    });

    res.status(201).json(plan);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to generate career plan';
    res.status(400).json({ message });
  }
};

export const getCareerPlansHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const plans = await getCareerPlans(req.userId as string);
    res.status(200).json(plans);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch career plans';
    res.status(400).json({ message });
  }
};

export const getCareerPlanByIdHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const plan = await getCareerPlanById(id as string, req.userId as string);
    res.status(200).json(plan);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch career plan';
    res.status(400).json({ message });
  }
};
