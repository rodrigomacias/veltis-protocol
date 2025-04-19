import express, { Router, Request, Response, NextFunction, raw } from 'express'; // Import express itself
import { createCheckoutSession, handleStripeWebhook } from '../controllers/billingController.js';
import { authenticateToken } from '../middleware/authMiddleware.js'; // Middleware for protected routes

const router = Router();

// Middleware to make raw body available for webhook verification
// Needs to be placed BEFORE express.json() middleware in the main app setup for this route specifically
// We will handle this by applying it only here.
const handleRawBody = (req: Request, res: Response, next: NextFunction) => {
    // Check if the content type is JSON, if so, use express.raw()
    if (req.headers['content-type'] === 'application/json') {
        raw({ type: 'application/json' })(req, res, (err) => {
            if (err) {
                return next(err);
            }
            // Attach raw body to req for Stripe verification
            (req as any).rawBody = req.body;
            next();
        });
    } else {
        // If not JSON, just proceed
        next();
    }
};


// POST /api/billing/create-checkout-session
// Protected route: Only authenticated users can create a session
router.post('/create-checkout-session', authenticateToken, createCheckoutSession);

// POST /api/billing/webhooks/stripe
// Public route: Stripe needs to be able to reach this without authentication
// Use raw body parser specifically for this route for signature verification
router.post('/webhooks/stripe', express.raw({type: 'application/json'}), handleStripeWebhook);


export default router;
