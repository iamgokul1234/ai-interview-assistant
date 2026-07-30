import { Router } from 'express';
import {
  getUserSettingsHandler,
  updateUserProfileHandler,
  changePasswordHandler,
  exportUserDataHandler,
  deleteUserAccountHandler,
} from '../controllers/settingsController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.get('/', getUserSettingsHandler);
router.put('/profile', updateUserProfileHandler);
router.put('/password', changePasswordHandler);
router.get('/export', exportUserDataHandler);
router.delete('/account', deleteUserAccountHandler);

export default router;
