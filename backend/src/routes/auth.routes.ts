import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const controller = new AuthController();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar novo usuário
 *     tags: [Auth]
 */
router.post('/register', controller.register.bind(controller));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login com email e senha
 *     tags: [Auth]
 */
router.post('/login', controller.login.bind(controller));

/**
 * @swagger
 * /api/auth/guest:
 *   post:
 *     summary: Jogar como convidado
 *     tags: [Auth]
 */
router.post('/guest', controller.loginGuest.bind(controller));

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renovar access token
 *     tags: [Auth]
 */
router.post('/refresh', controller.refreshToken.bind(controller));

export default router;
