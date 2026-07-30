import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import {
  getUserSettings,
  updateUserProfile,
  changePassword,
  exportUserData,
  deleteUserAccount,
} from '../services/settingsService';

export const getUserSettingsHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await getUserSettings(req.userId as string);
    res.status(200).json(user);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch user settings';
    res.status(400).json({ message });
  }
};

export const updateUserProfileHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const updated = await updateUserProfile(req.userId as string, req.body);
    res.status(200).json(updated);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to update user profile';
    res.status(400).json({ message });
  }
};

export const changePasswordHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res
        .status(400)
        .json({ message: 'Current password and new password are required' });
      return;
    }

    await changePassword(req.userId as string, currentPassword, newPassword);
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to change password';
    res.status(400).json({ message });
  }
};

export const exportUserDataHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const exportData = await exportUserData(req.userId as string);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=ai-interview-assistant-data-${Date.now()}.json`
    );
    res.status(200).json(exportData);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to export user data';
    res.status(400).json({ message });
  }
};

export const deleteUserAccountHandler = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { passwordConfirm } = req.body;

    if (!passwordConfirm) {
      res
        .status(400)
        .json({ message: 'Password confirmation is required to delete account' });
      return;
    }

    await deleteUserAccount(req.userId as string, passwordConfirm);
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to delete account';
    res.status(400).json({ message });
  }
};
