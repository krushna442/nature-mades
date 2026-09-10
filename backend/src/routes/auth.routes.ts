import { Router } from 'express';
import {
  register,
  login,
  logout,
  googleAuth,
  getMe,
  updateProfile,
  sendPasswordOtp,
  verifyOtpAndResetPassword,
  getWishlist,
  toggleWishlist,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.post('/google', authLimiter, googleAuth);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

// Gmail OTP Password Reset / Update
router.post('/send-otp', authLimiter, sendPasswordOtp);
router.post('/reset-password', authLimiter, verifyOtpAndResetPassword);

// Wishlist
router.get('/wishlist', authenticate, getWishlist);
router.post('/wishlist/toggle/:productId', authenticate, toggleWishlist);

export default router;
