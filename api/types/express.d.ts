// Augment Express Request to include `user` set by JWT middleware
import type { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      // decoded JWT payload or string id
      user?: {
        id: string;
        [key: string]: any;
      } | JwtPayload;
    }
  }
}

export {};