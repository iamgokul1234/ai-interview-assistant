import { Router } from 'express';
import {
  generateChallengeHandler,
  submitSolutionHandler,
  getChallengesHandler,
  getChallengeByIdHandler,
} from '../controllers/codingController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.post('/generate', generateChallengeHandler);
router.post('/:id/submit', submitSolutionHandler);
router.get('/', getChallengesHandler);
router.get('/:id', getChallengeByIdHandler);

export default router;
