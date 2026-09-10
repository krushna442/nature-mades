import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nature_mades_super_secret_jwt_key_2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'customer' | 'admin';
}

export function generateToken(payload: TokenPayload): string {
  // Admin sessions expire in 24 hours; Patron/Customer sessions expire in 30 days
  const expiresIn = payload.role === 'admin' ? '24h' : '30d';

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
