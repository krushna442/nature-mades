import { Router } from 'express';
import {
  register,
  login,
  googleAuth,
  instagramAuth,
  getMe,
  updateProfile,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleAuth);
router.post('/instagram', authLimiter, instagramAuth);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

export default router;
