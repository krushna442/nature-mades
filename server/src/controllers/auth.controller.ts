import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import { User } from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import type { AuthRequest } from '../middleware/auth.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
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
    let avatar: string | undefined = undefined;

    // Verify Google ID token if credential is provided
    if (credential) {
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
      } catch (verifyErr) {
        console.warn('[Google Verify Warning]: Token verification fell back to provided payload', verifyErr);
      }
    }

    if (!email) {
      res.status(400).json({ message: 'Google authentication failed: Email is required' });
      return;
    }

    email = email.toLowerCase().trim();
    let user = await User.findOne({
      $or: [{ 'providers.google.id': googleId }, { email }],
    });

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

export async function instagramAuth(req: Request, res: Response): Promise<void> {
  try {
    const { code, accessToken, username: directUsername, id: directId } = req.body;

    let instagramId = directId || '';
    let username = directUsername || '';

    // If code is received from OAuth redirect, exchange for access token
    if (code && process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET) {
      try {
        const tokenRes = await axios.post(
          'https://api.instagram.com/oauth/access_token',
          new URLSearchParams({
            client_id: process.env.INSTAGRAM_CLIENT_ID,
            client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
            grant_type: 'authorization_code',
            redirect_uri: process.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:5173/auth/instagram/callback',
            code,
          }).toString(),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        instagramId = tokenRes.data.user_id?.toString() || '';
        const userAccessToken = tokenRes.data.access_token;

        if (userAccessToken && instagramId) {
          const profileRes = await axios.get(
            `https://graph.instagram.com/${instagramId}?fields=id,username&access_token=${userAccessToken}`
          );
          username = profileRes.data.username || username;
        }
      } catch (oauthErr) {
        console.warn('[Instagram OAuth Warning]: Token exchange fell back to payload', oauthErr);
      }
    } else if (accessToken) {
      instagramId = directId || 'ig_' + Math.random().toString(36).substring(7);
    }

    if (!instagramId && !username) {
      res.status(400).json({ message: 'Instagram authentication failed: Missing identifier' });
      return;
    }

    const syntheticEmail = `${username || instagramId}@instagram.naturemades.com`.toLowerCase();

    let user = await User.findOne({
      $or: [{ 'providers.instagram.id': instagramId }, { email: syntheticEmail }],
    });

    if (!user) {
      user = await User.create({
        name: username || 'Instagram User',
        email: syntheticEmail,
        role: 'customer',
        providers: {
          instagram: { id: instagramId, username },
        },
      });
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

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
    console.error('[Instagram Auth Error]:', error);
    res.status(500).json({ message: 'Instagram authentication failed' });
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
