import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { patients, providers, sessions } from '@shared/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
    type: 'patient' | 'provider';
    hasSubscription?: boolean;
  };
}

// Generate session ID
function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Create session
export async function createSession(userId: number, userType: 'patient' | 'provider'): Promise<string> {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await db.insert(sessions).values({
    id: sessionId,
    userId: userId.toString(),
    userType,
    expiresAt,
  });

  return sessionId;
}

// Verify session
export async function verifySession(sessionId: string) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId));

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      // Delete expired session
      await db.delete(sessions).where(eq(sessions.id, sessionId));
    }
    return null;
  }

  // Get user data based on type
  if (session.userType === 'patient') {
    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.id, parseInt(session.userId)));
    
    if (patient) {
      return {
        id: patient.id,
        email: patient.email,
        name: patient.name,
        type: 'patient' as const,
        hasSubscription: patient.hasSubscription,
      };
    }
  } else {
    const [provider] = await db
      .select()
      .from(providers)
      .where(eq(providers.id, parseInt(session.userId)));
    
    if (provider) {
      return {
        id: provider.id,
        email: provider.email,
        name: provider.name,
        type: 'provider' as const,
      };
    }
  }

  return null;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Authentication middleware
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

// Provider-only middleware
export function requireProvider(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.type !== 'provider') {
    return res.status(403).json({ message: 'Provider access required' });
  }
  next();
}

export function requirePatient(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.type !== 'patient') {
    return res.status(403).json({ message: 'Patient access required' });
  }
  next();
}

// Subscription middleware for patients
export function requireSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.type === 'provider') {
    // Providers have access to everything
    return next();
  }
  
  if (req.user.type === 'patient' && !req.user.hasSubscription) {
    return res.status(403).json({ message: 'Subscription required' });
  }
  
  next();
}

// Session middleware to attach user to request
export async function sessionMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const sessionId = req.cookies?.sessionId;
  
  if (sessionId) {
    const user = await verifySession(sessionId);
    if (user) {
      req.user = user;
    }
  }
  
  next();
}

// Delete session (logout)
export async function deleteSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}