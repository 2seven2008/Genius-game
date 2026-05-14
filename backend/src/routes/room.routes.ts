import { Router } from 'express';
import { RoomController } from '../controllers/room.controller';
import { authenticate, optionalAuth } from '../middlewares/auth.middleware';

const router = Router();
const controller = new RoomController();

router.post('/', authenticate, controller.createRoom.bind(controller));
router.get('/public', optionalAuth, controller.getPublicRooms.bind(controller));
router.get('/:code', optionalAuth, controller.getRoomByCode.bind(controller));

export default router;
