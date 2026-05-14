import { Router } from 'express';
import { ScoreController } from '../controllers/score.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const controller = new ScoreController();

router.post('/save', authenticate, controller.saveScore.bind(controller));
router.get('/ranking/wins', controller.getRankingByWins.bind(controller));
router.get('/ranking/score', controller.getRankingByScore.bind(controller));
router.get('/me', authenticate, controller.getMe.bind(controller));

export default router;
