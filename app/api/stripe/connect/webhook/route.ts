import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent, stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import type Stripe from 'stripe';

/**
 * POST /api/stripe/connect/webhook
 *
 * Handles Stripe Connect webhooks for account updates
 *
 * Webhook events:
 * - account.updated: Creator completed onboarding
 * - account.application.authorized: User authorized the connected account
 * - account.application.deauthorized: User disconnected the account
 *
 * Environment variables:
 * - STRIPE_CONNECT_WEBHOOK_SECRET: Webhook signing secret
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Get webhook signature
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json(
        { error: 'No Stripe signature' },
        { status: 400 }
      );
    }

    // 2. Get webhook secret
    const webhookSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_CONNECT_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      );
    }

    // 3. Verify webhook signature
    const payload = await req.text();
    let event: Stripe.Event;

    try {
      event = constructWebhookEvent(payload, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // 4. Handle different event types
    switch (event.type) {
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        await handleAccountUpdated(account);
        break;
      }

      case 'account.application.authorized': {
        const account = event.data.object as unknown as Stripe.Account;
        await handleAccountAuthorized(account);
        break;
      }

      case 'account.application.deauthorized': {
        const account = event.data.object as unknown as Stripe.Account;
        await handleAccountDeauthorized(account);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // 5. Return success response
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe Connect webhook error:', error);
    return NextResponse.json(
      {
        error: 'Webhook handler failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Handle account.updated event
 *
 * Triggered when:
 * - Creator completes onboarding
 * - Account details change
 * - Capabilities are updated
 */
async function handleAccountUpdated(account: Stripe.Account) {
  console.log(`Account updated: ${account.id}`);

  // Find user with this Stripe account
  const user = await prisma.user.findFirst({
    where: {
      stripeAccountId: account.id,
    },
    select: { id: true, email: true },
  });

  if (!user) {
    console.warn(`No user found for Stripe account: ${account.id}`);
    return;
  }

  // Log account status changes
  console.log(`User ${user.id} (${user.email}) account status:`, {
    detailsSubmitted: account.details_submitted,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
  });

  // If onboarding is complete and payouts are enabled, creator is ready
  if (account.details_submitted && account.payouts_enabled) {
    console.log(`Creator ${user.id} is ready to receive payouts`);

    // Optionally: Send notification email to creator
    // await sendCreatorReadyEmail(user.email);
  }
}

/**
 * Handle account.application.authorized event
 *
 * Triggered when user authorizes the connected account
 */
async function handleAccountAuthorized(account: Stripe.Account) {
  console.log(`Account authorized: ${account.id}`);

  const user = await prisma.user.findFirst({
    where: {
      stripeAccountId: account.id,
    },
    select: { id: true },
  });

  if (user) {
    console.log(`User ${user.id} authorized their Stripe Connect account`);
  }
}

/**
 * Handle account.application.deauthorized event
 *
 * Triggered when user disconnects the account
 */
async function handleAccountDeauthorized(account: Stripe.Account) {
  console.log(`Account deauthorized: ${account.id}`);

  const user = await prisma.user.findFirst({
    where: {
      stripeAccountId: account.id,
    },
    select: { id: true },
  });

  if (user) {
    console.log(`User ${user.id} disconnected their Stripe Connect account`);

    // Optionally: Mark user as needing reconnection
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: { stripeAccountId: null },
    // });
  }
}
