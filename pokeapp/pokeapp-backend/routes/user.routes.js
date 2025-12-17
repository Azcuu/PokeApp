import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth.controllers.js';
import { authMiddleware } from '../middlewares/auth-middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);

export default router;