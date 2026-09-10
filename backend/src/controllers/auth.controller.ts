import mongoose from 'mongoose';
import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import { User } from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import type { AuthRequest } from '../middleware/auth.js';
import { sendOtpEmail } from '../services/emailService.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Session Cookie helper: 24h for admin, 30d for patrons/customers
export function attachAuthCookie(res: Response, token: string, role: 'customer' | 'admin'): void {
  const maxAge = role === 'admin'
    ? 24 * 60 * 60 * 1000          // 24 hours in ms
    : 30 * 24 * 60 * 60 * 1000;    // 30 days in ms

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge,
    path: '/',
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
}

export async function logout(_req: Request, res: Response): Promise<void> {
  clearAuthCookie(res);
  res.json({ message: 'Signed out successfully' });
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Name, email, and password are required' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(409).json({ message: 'An account with this email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'customer',
      providers: { local: { enabled: true } },
    });

    res.status(201).json({
      message: 'Account created successfully! Please sign in with your credentials.',
      email: user.email,
    });
  } catch (error) {
    console.error('[Auth Register Error]:', error);
    res.status(500).json({ message: 'Failed to create account' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.passwordHash) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    attachAuthCookie(res, token, user.role);

    res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('[Auth Login Error]:', error);
    res.status(500).json({ message: 'Failed to sign in' });
  }
}

export async function googleAuth(req: Request, res: Response): Promise<void> {
  try {
    const { credential, email: directEmail, name: directName } = req.body;

    let email = directEmail;
    let name = directName;
    let googleId = '';
    let avatar: string | undefined;
    // If a valid Google ID token JWT (3 dot-separated segments) is provided, verify with Google
    const isJwt = typeof credential === 'string' && credential.split('.').length === 3;

    if (isJwt) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (payload) {
          email = payload.email;
          name = payload.name;
          googleId = payload.sub;
          avatar = payload.picture;
        }
      } catch (verifyErr: any) {
        console.warn('[Google Auth]: Token verification failed, checking payload:', verifyErr?.message || verifyErr);
      }
    } else if (credential && !email) {
      // If simulated or dev mock without direct email, assign friendly simulated patron identity
      email = 'patron@naturemades.com';
      name = 'NatureMades Patron';
      googleId = 'mock_google_id_' + credential.replace(/[^a-zA-Z0-9]/g, '').slice(-12);
    }

    if (!email) {
      res.status(400).json({ message: 'Google authentication failed: Email is required' });
      return;
    }

    email = email.toLowerCase().trim();

    // Google OAuth is disabled for administrator account
    if (email === 'admin@naturemades.com') {
      res.status(403).json({
        message: 'Administrator accounts must sign in using secure email and password credentials. Google OAuth is disabled for administrators.',
      });
      return;
    }

    let user = await User.findOne({
      $or: [{ 'providers.google.id': googleId }, { email }],
    });

    if (user && user.role === 'admin') {
      res.status(403).json({
        message: 'Administrator accounts must sign in using secure email and password credentials. Google OAuth is disabled for administrators.',
      });
      return;
    }

    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        avatar,
        role: 'customer',
        providers: {
          google: { id: googleId || email, email },
        },
      });
    } else {
      if (!user.providers.google?.id && googleId) {
        user.providers.google = { id: googleId, email };
        await user.save();
      }
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    attachAuthCookie(res, token, user.role);

    res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('[Google Auth Error]:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.user.userId).select('-passwordHash').lean();
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        addresses: user.addresses || [],
        savedProducts: user.savedProducts || [],
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[GetMe Error]:', error);
    res.status(500).json({ message: 'Failed to retrieve profile' });
  }
}

export async function updateProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const { name, addresses } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (name) user.name = name.trim();
    if (Array.isArray(addresses)) user.addresses = addresses;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    console.error('[Update Profile Error]:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
}

// POST /api/auth/send-otp
export async function sendPasswordOtp(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: 'Email address is required' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      res.status(404).json({ message: 'No account found with this email address' });
      return;
    }

    // Generate random 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetPasswordOtp = {
      code: otp,
      expiresAt,
    };
    await user.save();

    await sendOtpEmail(cleanEmail, otp);

    res.json({ message: 'Verification code (OTP) sent to your Gmail address' });
  } catch (error) {
    console.error('[SendOtp Error]:', error);
    res.status(500).json({ message: 'Failed to send OTP code' });
  }
}

// POST /api/auth/reset-password
export async function verifyOtpAndResetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      res.status(400).json({ message: 'Email, OTP, and new password are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'New password must be at least 6 characters long' });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user || !user.resetPasswordOtp) {
      res.status(400).json({ message: 'Invalid or expired OTP. Please request a new code.' });
      return;
    }

    if (new Date() > new Date(user.resetPasswordOtp.expiresAt)) {
      res.status(400).json({ message: 'OTP code has expired. Please request a new one.' });
      return;
    }

    if (user.resetPasswordOtp.code !== otp.trim()) {
      res.status(400).json({ message: 'Incorrect OTP code entered. Please check your Gmail.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordOtp = undefined;
    await user.save();

    res.json({ message: 'Password updated successfully! You can now log in with your new password.' });
  } catch (error) {
    console.error('[ResetPassword Error]:', error);
    res.status(500).json({ message: 'Failed to update password' });
  }
}

// GET /api/auth/wishlist
export async function getWishlist(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const user = await User.findById(req.user.userId).populate('savedProducts').lean();
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const products = (user.savedProducts || [])
      .filter(Boolean)
      .map((p: any) => ({
        ...p,
        id: p._id?.toString() || p.id,
      }));

    res.json({ wishlist: products });
  } catch (error) {
    console.error('[GetWishlist Error]:', error);
    res.status(500).json({ message: 'Failed to retrieve wishlist' });
  }
}

// POST /api/auth/wishlist/toggle/:productId
export async function toggleWishlist(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { productId } = req.params;
    if (!productId) {
      res.status(400).json({ message: 'Product ID is required' });
      return;
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (!Array.isArray(user.savedProducts)) {
      user.savedProducts = [];
    }

    const existingIndex = user.savedProducts.findIndex(
      (id) => id.toString() === productId
    );

    let isSaved = false;
    if (existingIndex > -1) {
      user.savedProducts.splice(existingIndex, 1);
      isSaved = false;
    } else {
      user.savedProducts.push(new mongoose.Types.ObjectId(productId));
      isSaved = true;
    }

    await user.save();

    res.json({
      message: isSaved ? 'Product added to your wishlist' : 'Product removed from your wishlist',
      isSaved,
      savedProductIds: user.savedProducts.map((id) => id.toString()),
    });
  } catch (error) {
    console.error('[ToggleWishlist Error]:', error);
    res.status(500).json({ message: 'Failed to update wishlist' });
  }
}

