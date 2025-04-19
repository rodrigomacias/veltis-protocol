import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabaseAdmin.js'; // Use the admin client for backend verification

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        // Add other user properties if needed from Supabase user object
      };
    }
  }
}

/**
 * Express middleware to authenticate requests using Supabase JWT.
 * Verifies the Authorization header (Bearer token) and attaches user info to req.user.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!supabaseAdmin) {
    console.error('[AuthMiddleware] Supabase admin client not initialized.');
    res.status(500).json({ message: 'Authentication service unavailable.' });
    return;
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1]; // Expecting "Bearer TOKEN"

  if (!token) {
    res.status(401).json({ message: 'Unauthorized: No token provided.' });
    return;
  }

  try {
    // Verify the token using Supabase Admin client
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error) {
      console.error('[AuthMiddleware] Token validation error:', error.message);
      res.status(401).json({ message: `Unauthorized: ${error.message}` });
      return;
    }

    if (!user) {
      res.status(401).json({ message: 'Unauthorized: Invalid token or user not found.' });
      return;
    }

    // Attach user information to the request object
    req.user = {
      id: user.id,
      // email: user.email, // Add other fields if needed downstream
    };

    console.log(`[AuthMiddleware] User authenticated: ${user.id}`);
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('[AuthMiddleware] Unexpected error during token validation:', error);
    res.status(500).json({ message: 'Internal server error during authentication.' });
  }
};
