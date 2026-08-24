import { Request, Response, NextFunction } from 'express';
import { db } from '../data/database';
import { UserRole } from '../types';

export function authenticateToken(req: any, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access denied. Authentication token required.' });
  }

  try {
    const decoded = db.verifyJWT(token);
    req.user = decoded;
    next();
  } catch (err: any) {
    return res.status(403).json({ success: false, error: 'Invalid or expired authentication token.' });
  }
}

export function requireRoles(...roles: UserRole[]) {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden. Required permissions missing.' });
    }
    next();
  };
}
