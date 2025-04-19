import Stripe from 'stripe';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('Stripe Error: Missing STRIPE_SECRET_KEY in environment variables.');
  // Depending on how critical Stripe is at startup, you might throw an error
  // or allow the app to start but log the missing key.
  // throw new Error('Missing STRIPE_SECRET_KEY');
}

// Initialize Stripe client
// The non-null assertion (!) assumes the key check above is sufficient
// or that the app shouldn't start without it. Handle null case if needed.
// The `{ apiVersion: '...' }` is recommended by Stripe to lock the API version.

// Temporarily disable Stripe initialization if key is missing to allow server start for testing other features
let stripe: Stripe | null = null;
if (stripeSecretKey) {
    stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2025-03-31.basil', // Use the version expected by the installed library types
        typescript: true, // Enable TypeScript support if available in your Stripe library version
    });
    console.log('[config] Stripe client initialized.');
} else {
    console.warn('[config] Stripe client NOT initialized due to missing STRIPE_SECRET_KEY.');
}


// Export the initialized client (or null) for use elsewhere
export { stripe }; // Use named export
export default stripe; // Keep default export for compatibility, though it might be null
