import Stripe from 'stripe';

/**
 * Stripe client configuration
 *
 * Handles Stripe initialization for both:
 * - Standard payments (processing customer purchases)
 * - Stripe Connect (creator payouts)
 */

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

/**
 * Stripe Connect for Creator Payouts
 *
 * Enables direct transfers to creator Stripe accounts
 * during checkout. Platform fee (30%) retained automatically.
 */

export async function createCreatorAccount(
  email: string,
  creatorName: string
): Promise<Stripe.Account> {
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'US',
    email,
    capabilities: {
      transfers: { requested: true },
      card_payments: { requested: true },
    },
    business_type: 'individual',
    business_profile: {
      name: creatorName,
      url: 'https://devtutorials.com',
      mcc: '5734', // Educational Services
    },
  });

  return account;
}

export async function createAccountLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string
): Promise<Stripe.AccountLink> {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  });

  return accountLink;
}

/**
 * Checkout Session Creation
 *
 * Creates Stripe Checkout session with direct payment to creator
 * and platform fee (30%) automatically retained.
 */

export interface CreateCheckoutSessionParams {
  tutorialId: string;
  tutorialTitle: string;
  price: number; // Price in cents
  creatorAccountId: string;
  userId: string;
  userEmail: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<Stripe.Checkout.Session> {
  const {
    tutorialId,
    tutorialTitle,
    price,
    creatorAccountId,
    userId,
    userEmail,
    successUrl,
    cancelUrl,
  } = params;

  // Calculate platform fee (30%)
  const platformFeeCents = Math.round(price * 0.30);

  const session = await stripe.checkout.sessions.create({
    payment_intent_data: {
      application_fee_amount: platformFeeCents,
      transfer_data: {
        destination: creatorAccountId,
      },
      metadata: {
        tutorialId,
        userId,
      },
    },
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: tutorialTitle,
            metadata: {
              tutorialId,
            },
          },
          unit_amount: price,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    customer_email: userEmail,
    metadata: {
      tutorialId,
      userId,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

/**
 * Webhook Signature Verification
 *
 * Verifies incoming Stripe webhooks to prevent fraud
 */

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * Creator Payouts
 *
 * Initiates payouts to creator Stripe Connect accounts
 */

export async function payCreator(
  accountId: string,
  amountCents: number,
  metadata?: Record<string, string>
): Promise<Stripe.Payout> {
  const payout = await stripe.payouts.create(
    {
      amount: amountCents,
      currency: 'usd',
      metadata,
    },
    {
      stripeAccount: accountId,
    }
  );

  return payout;
}

/**
 * Retrieve Checkout Session
 *
 * Fetches session details for verification
 */

export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  return await stripe.checkout.sessions.retrieve(sessionId);
}

/**
 * Retrieve Account
 *
 * Fetches creator Stripe Connect account details
 */

export async function getAccount(accountId: string): Promise<Stripe.Account> {
  return await stripe.accounts.retrieve(accountId);
}

/**
 * Calculate Creator Share (70%)
 */
export function calculateCreatorShare(totalCents: number): number {
  return Math.round(totalCents * 0.70);
}

/**
 * Calculate Platform Fee (30%)
 */
export function calculatePlatformFee(totalCents: number): number {
  return Math.round(totalCents * 0.30);
}
