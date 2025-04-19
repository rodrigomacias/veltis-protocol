import { Request, Response } from 'express';
import Stripe from 'stripe'; // Import the Stripe namespace for types
import stripeClient from '../config/stripe.js'; // Import initialized Stripe client (renamed to avoid conflict)
import { supabaseAdmin } from '../config/supabaseAdmin.js'; // Import Supabase admin client

// TODO: Implement controller functions for billing

/**
 * Creates a Stripe Checkout Session for initiating a subscription.
 * @param req Request object, expects priceId in body, userId from auth middleware.
 * @param res Response object.
 */
export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
    const { priceId } = req.body; // ID of the Stripe Price object for the plan
    const userId = req.user?.id;

    if (!userId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
    }
    if (!priceId) {
        res.status(400).json({ message: 'Price ID is required.' });
         return;
     }
      if (!stripeClient || !supabaseAdmin) { // Use stripeClient
         res.status(500).json({ message: 'Internal server configuration error.' });
         return;
     }

     try {
        // 1. Get User Email and find their default Team
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (userError || !userData || !userData.user?.email) {
            throw new Error(`Failed to retrieve user data or email for user ${userId}: ${userError?.message}`);
        }
        const userEmail = userData.user.email;

        const { data: teamData, error: teamError } = await supabaseAdmin
            .from('teams')
            .select('id, stripe_customer_id')
            .eq('owner_user_id', userId) // Assuming the user owns their default team
            .single();

        if (teamError || !teamData) {
             throw new Error(`Failed to retrieve team data for user ${userId}: ${teamError?.message}`);
        }

        let stripeCustomerId = teamData.stripe_customer_id;

        // 2. Get or create Stripe Customer
        if (!stripeCustomerId) {
            console.log(`[Checkout] Creating Stripe Customer for user ${userId} (Email: ${userEmail})`);
            const customer = await stripeClient.customers.create({
                email: userEmail,
                metadata: {
                    supabaseUserId: userId, // Link Stripe customer to Supabase user ID
                    teamId: teamData.id,    // Link Stripe customer to Veltis team ID
                },
            });
            stripeCustomerId = customer.id;

            // Save the new customer ID to the team table
            const { error: updateTeamError } = await supabaseAdmin
                .from('teams')
                .update({ stripe_customer_id: stripeCustomerId })
                .eq('id', teamData.id);

            if (updateTeamError) {
                 // Log error but proceed - Stripe customer was created. Might need reconciliation later.
                 console.error(`[Checkout] Failed to save stripe_customer_id ${stripeCustomerId} for team ${teamData.id}:`, updateTeamError);
            } else {
                 console.log(`[Checkout] Saved Stripe Customer ID ${stripeCustomerId} to team ${teamData.id}`);
            }
        } else {
             console.log(`[Checkout] Found existing Stripe Customer ID ${stripeCustomerId} for user ${userId} / team ${teamData.id}`);
        }


        // 3. Create Stripe Checkout Session
        const successUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`; // Redirect to dashboard on success
        const cancelUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/pricing`; // Redirect to pricing on cancel

        const session = await stripeClient.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            customer: stripeCustomerId,
            line_items: [
                {
                    price: priceId, // The ID of the Stripe Price object selected by the user
                    quantity: 1,
                },
            ],
             // Include metadata to link session back to user/team if needed in webhook
            subscription_data: {
                metadata: {
                    supabaseUserId: userId,
                    teamId: teamData.id,
                }
            },
            success_url: successUrl,
            cancel_url: cancelUrl,
        });

        // 4. Return the session ID
        if (!session.id) {
             throw new Error('Stripe Checkout Session ID is missing.');
        }
        res.status(200).json({ sessionId: session.id });

     } catch (error: any) {
        console.error('[Checkout Error] Failed to create checkout session:', error);
        res.status(500).json({ message: `Checkout error: ${error.message}` });
    }
};

/**
 * Handles incoming webhook events from Stripe.
 * @param req Request object, contains Stripe event in body and signature in header.
 * @param res Response object.
 */
export const handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
    const sig = req.headers['stripe-signature'] as string;
     const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!stripeClient || !webhookSecret) { // Use stripeClient
         console.error('[Webhook Error] Stripe client or webhook secret not configured.');
         res.status(500).json({ message: 'Internal server configuration error.' });
        return;
    }
     if (!sig) {
        console.warn('[Webhook] Missing stripe-signature header');
        res.status(400).send('Webhook Error: Missing signature');
        return;
     }


    let event: Stripe.Event;

     try {
         // Verify the event signature
         event = stripeClient.webhooks.constructEvent(req.body, sig, webhookSecret); // Use stripeClient
         console.log(`[Webhook] Received verified event: ${event.type}`);

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed':
                // Payment is successful and the subscription is created (or first payment made).
                // const session = event.data.object as Stripe.Checkout.Session;
                // TODO:
                // 1. Retrieve subscription details: stripe.subscriptions.retrieve(session.subscription)
                // 2. Extract relevant data: customerId, subscriptionId, planId (priceId), status, currentPeriodEnd.
                // 3. Get userId from session metadata or customer metadata.
                // 4. Create/Update the corresponding record in your `subscriptions` table in Supabase.
                //    - Associate with the correct team if applicable.
                console.log('[Webhook] Handling checkout.session.completed...');
                break;
            case 'customer.subscription.updated':
                // Handle subscription changes: renewals, cancellations, plan changes, payment failures.
                // const subscription = event.data.object as Stripe.Subscription;
                // TODO:
                // 1. Extract relevant data: subscriptionId, status, currentPeriodEnd, planId (priceId).
                // 2. Update the corresponding record in your `subscriptions` table.
                console.log('[Webhook] Handling customer.subscription.updated...');
                break;
            case 'customer.subscription.deleted':
                // Handle subscription cancellations (at period end or immediately).
                // const subscription = event.data.object as Stripe.Subscription;
                // TODO:
                // 1. Update the status in your `subscriptions` table (e.g., to 'canceled').
                //    Consider if access should be revoked immediately or at period end based on Stripe settings.
                console.log('[Webhook] Handling customer.subscription.deleted...');
                break;
            // Add other event types as needed (e.g., invoice.payment_failed)
            default:
                console.log(`[Webhook] Unhandled event type ${event.type}`);
        }

        // Return a 200 response to acknowledge receipt of the event
        res.status(200).json({ received: true });

    } catch (err: any) {
        console.error(`[Webhook Error] Webhook signature verification failed or handler error: ${err.message}`);
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
};
